import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { PatientSidebar } from '@/components/patient/PatientSidebar';
import { PatientHeader } from '@/components/patient/PatientHeader';
import { ArchProgressCard } from '@/components/patient/ArchProgressCard';
import { OverallProgress } from '@/components/patient/OverallProgress';
import { PhotoUploadModal } from '@/components/patient/PhotoUploadModal';
import { PhotoGallery } from '@/components/patient/PhotoGallery';
import { ProfileTab } from '@/components/patient/ProfileTab';
import { PauseReasonModal } from '@/components/patient/PauseReasonModal';
import { NotificationBanner } from '@/components/patient/NotificationBanner';
import { NotificationsTab } from '@/components/patient/NotificationsTab';
import logo from '@/assets/logo.jpg';
import {
  Check,
  Camera,
  LogOut,
  Bell,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Menu,
  Pause,
} from 'lucide-react';

type ArchStatus = 'em_uso' | 'pausado' | 'finalizado';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'treatment' | 'history' | 'gallery' | 'notifications'>('treatment');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [selectedArch, setSelectedArch] = useState<'upper' | 'lower'>('upper');
  const [isConfirming, setIsConfirming] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [changes, setChanges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetchPatientData();
  }, [user]);

  const fetchPatientData = async () => {
    if (!user?.email) return;
    try {
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (patientData) {
        setPatient(patientData);
        const { data: changesData } = await supabase
          .from('aligner_changes')
          .select('*')
          .eq('patient_id', patientData.id)
          .order('changed_at', { ascending: false });
        setChanges(changesData || []);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getArchLastChangeDate = (arch: 'upper' | 'lower') => {
    // First check if there's a last_change_date in the patient record
    const lastChangeDateField = arch === 'upper' ? patient?.upper_last_change_date : patient?.lower_last_change_date;
    if (lastChangeDateField) {
      return new Date(lastChangeDateField);
    }
    
    // Fallback to looking at changes history
    const archChanges = changes.filter(c => c.arch === arch);
    if (archChanges.length > 0) {
      return new Date(archChanges[0].changed_at);
    }
    return new Date(patient?.start_date || Date.now());
  };

  const calculateDaysElapsed = (arch: 'upper' | 'lower') => {
    const lastChange = getArchLastChangeDate(arch);
    return Math.floor((Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateNextChangeDate = (arch: 'upper' | 'lower') => {
    const lastChange = getArchLastChangeDate(arch);
    const nextChange = new Date(lastChange);
    nextChange.setDate(nextChange.getDate() + (patient?.days_per_aligner || 14));
    return nextChange;
  };

  const getArchStatus = (arch: 'upper' | 'lower'): ArchStatus => {
    const statusField = arch === 'upper' ? patient?.upper_arch_status : patient?.lower_arch_status;
    const currentAligner = arch === 'upper' ? patient?.current_upper_aligner : patient?.current_lower_aligner;
    const totalAligners = arch === 'upper' ? patient?.upper_aligners : patient?.lower_aligners;
    
    // Auto-finalize if at last aligner
    if (currentAligner >= totalAligners) {
      return 'finalizado';
    }
    
    return statusField || 'em_uso';
  };

  const handleConfirmChange = async () => {
    setIsConfirming(true);
    try {
      const currentAligner = selectedArch === 'upper' ? patient.current_upper_aligner : patient.current_lower_aligner;
      const totalAligners = selectedArch === 'upper' ? patient.upper_aligners : patient.lower_aligners;
      const newAlignerNumber = currentAligner + 1;
      
      // Insert change record in aligner_changes
      await supabase.from('aligner_changes').insert({
        patient_id: patient.id,
        aligner_number: newAlignerNumber,
        arch: selectedArch,
      });

      // Insert event in treatment_history
      await supabase.from('treatment_history').insert({
        patient_id: patient.id,
        arch: selectedArch,
        event_type: 'aligner_change',
        aligner_from: currentAligner,
        aligner_to: newAlignerNumber,
        is_refining: patient.refining_active || false,
      });
      
      // Update patient - only the specific arch
      const updateField = selectedArch === 'upper' ? 'current_upper_aligner' : 'current_lower_aligner';
      const lastChangeDateField = selectedArch === 'upper' ? 'upper_last_change_date' : 'lower_last_change_date';
      const statusField = selectedArch === 'upper' ? 'upper_arch_status' : 'lower_arch_status';
      
      const updateData: Record<string, any> = {
        [updateField]: newAlignerNumber,
        [lastChangeDateField]: new Date().toISOString().split('T')[0],
      };
      
      // Check if this was the last aligner
      if (newAlignerNumber >= totalAligners) {
        updateData[statusField] = 'finalizado';
        
        // Record arch completion in history
        await supabase.from('treatment_history').insert({
          patient_id: patient.id,
          arch: selectedArch,
          event_type: 'arch_completed',
          aligner_from: newAlignerNumber,
          aligner_to: newAlignerNumber,
          is_refining: patient.refining_active || false,
        });

        // Check if both arches are now finalized
        const otherArchFinalized = selectedArch === 'upper' 
          ? (patient.current_lower_aligner >= patient.lower_aligners || patient.arch === 'upper')
          : (patient.current_upper_aligner >= patient.upper_aligners || patient.arch === 'lower');
        
        if (otherArchFinalized && !patient.refining_active) {
          updateData.treatment_status = 'completed';
        }
      }
      
      await supabase.from('patients').update(updateData).eq('id', patient.id);
      fetchPatientData();
    } catch (error) {
      console.error('Error confirming change:', error);
    } finally {
      setIsConfirming(false);
      setShowConfirmModal(false);
    }
  };

  const handlePauseWithReason = async (reason: string, customReason?: string) => {
    setIsConfirming(true);
    try {
      const statusField = selectedArch === 'upper' ? 'upper_arch_status' : 'lower_arch_status';
      const finalReason = customReason ? `${reason}: ${customReason}` : reason;
      
      // Record event in treatment_history with reason
      await supabase.from('treatment_history').insert({
        patient_id: patient.id,
        arch: selectedArch,
        event_type: 'pause_started',
        aligner_from: selectedArch === 'upper' ? patient.current_upper_aligner : patient.current_lower_aligner,
        aligner_to: selectedArch === 'upper' ? patient.current_upper_aligner : patient.current_lower_aligner,
        is_refining: patient.refining_active || false,
        patient_reason: finalReason,
      });
      
      await supabase.from('patients').update({
        [statusField]: 'pausado',
      }).eq('id', patient.id);
      
      fetchPatientData();
    } catch (error) {
      console.error('Error pausing treatment:', error);
    } finally {
      setIsConfirming(false);
      setShowPauseModal(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    if (!patient?.id) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', patient.id)
      .eq('is_read', false);
    setUnreadNotifications(count || 0);
  };

  useEffect(() => {
    if (patient?.id) {
      fetchUnreadNotifications();
    }
  }, [patient?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <img src={logo} alt="Stelle Odontologia" className="h-16 mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold mb-2">Bem-vindo!</h1>
          <p className="text-muted-foreground mb-4">Seu cadastro ainda não foi encontrado.</p>
          <Button variant="secondary" onClick={logout}><LogOut className="w-4 h-4" /> Sair</Button>
        </div>
      </div>
    );
  }

  const showUpperArch = patient.arch !== 'lower';
  const showLowerArch = patient.arch !== 'upper';

  return (
    <div className="min-h-screen bg-background">
      <PatientSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        patientName={patient.full_name}
        avatarUrl={patient.avatar_url}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-[280px]' : ''}`}>
        <header className="glass-card sticky top-0 z-30 border-b">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-5 h-5" />
              </Button>
              <img src={logo} alt="Stelle" className="h-8" />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon-sm" 
                className="relative"
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={logout}><LogOut className="w-5 h-5" /></Button>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Patient Header - visible on all pages */}
          <PatientHeader 
            fullName={patient.full_name} 
            avatarUrl={patient.avatar_url} 
          />

          {activeTab === 'profile' && <ProfileTab patient={patient} onUpdate={fetchPatientData} />}
          
          {activeTab === 'treatment' && (
            <>
              {/* Notifications */}
              <NotificationBanner 
                patientId={patient.id} 
                onNotificationsChange={fetchUnreadNotifications}
              />

              {/* Overall Progress */}
              <OverallProgress
                upperCurrent={patient.current_upper_aligner}
                upperTotal={patient.upper_aligners}
                lowerCurrent={patient.current_lower_aligner}
                lowerTotal={patient.lower_aligners}
                arch={patient.arch}
              />

              {/* Individual Arch Progress Cards */}
              <div className="space-y-4">
                {showUpperArch && (
                  <ArchProgressCard
                    arch="upper"
                    currentAligner={patient.current_upper_aligner}
                    totalAligners={patient.upper_aligners}
                    status={getArchStatus('upper')}
                    daysElapsed={calculateDaysElapsed('upper')}
                    totalDays={patient.days_per_aligner}
                    nextChangeDate={calculateNextChangeDate('upper')}
                    onChangeClick={() => {
                      setSelectedArch('upper');
                      setShowConfirmModal(true);
                    }}
                    onPauseToggle={() => {
                      setSelectedArch('upper');
                      setShowPauseModal(true);
                    }}
                  />
                )}
                
                {showLowerArch && (
                  <ArchProgressCard
                    arch="lower"
                    currentAligner={patient.current_lower_aligner}
                    totalAligners={patient.lower_aligners}
                    status={getArchStatus('lower')}
                    daysElapsed={calculateDaysElapsed('lower')}
                    totalDays={patient.days_per_aligner}
                    nextChangeDate={calculateNextChangeDate('lower')}
                    onChangeClick={() => {
                      setSelectedArch('lower');
                      setShowConfirmModal(true);
                    }}
                    onPauseToggle={() => {
                      setSelectedArch('lower');
                      setShowPauseModal(true);
                    }}
                  />
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowPhotoModal(true)} className="glass-card p-5 rounded-2xl text-left hover:shadow-lg transition-all group">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Camera className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Adicionar Foto</h3>
                  <p className="text-sm text-muted-foreground mt-1">Registre seu progresso</p>
                </button>
                <button onClick={() => setActiveTab('gallery')} className="glass-card p-5 rounded-2xl text-left hover:shadow-lg transition-all group">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                    <Camera className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold">Galeria</h3>
                  <p className="text-sm text-muted-foreground mt-1">Ver fotos anteriores</p>
                </button>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold">Histórico de Trocas</h2>
              {changes.length === 0 ? (
                <div className="glass-card p-8 rounded-xl text-center">
                  <p className="text-muted-foreground">Nenhuma troca registrada ainda.</p>
                </div>
              ) : (
                changes.map((change, index) => (
                  <motion.div key={change.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                    className="glass-card p-4 rounded-xl flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-success/20' : 'bg-secondary'
                    } ${change.arch === 'upper' ? 'text-accent' : 'text-primary'}`}>
                      {change.arch === 'upper' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{change.arch === 'upper' ? 'Superior' : 'Inferior'} #{change.aligner_number}</p>
                      <p className="text-sm text-muted-foreground">{new Date(change.changed_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab 
              patientId={patient.id} 
              onNotificationsChange={fetchUnreadNotifications}
            />
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold">Galeria de Fotos</h2>
                <Button variant="accent" size="sm" onClick={() => setShowPhotoModal(true)}><Camera className="w-4 h-4" /> Adicionar</Button>
              </div>
              <PhotoGallery patientId={patient.id} />
            </div>
          )}
        </main>
      </div>

      <PhotoUploadModal 
        isOpen={showPhotoModal} 
        onClose={() => setShowPhotoModal(false)} 
        patientId={patient.id}
        alignerNumber={patient.current_upper_aligner} 
        onPhotoUploaded={fetchPatientData} 
      />

      {/* Confirm Change Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              onClick={(e) => e.stopPropagation()} className="glass-card-elevated p-8 rounded-3xl w-full max-w-md text-center">
              <div className={`w-20 h-20 rounded-3xl ${selectedArch === 'upper' ? 'gradient-accent' : 'gradient-primary'} flex items-center justify-center mx-auto mb-6`}>
                {selectedArch === 'upper' ? <ArrowUp className="w-10 h-10 text-white" /> : <ArrowDown className="w-10 h-10 text-white" />}
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Confirmar Troca</h2>
              <p className="text-muted-foreground mb-6">
                Alinhador {selectedArch === 'upper' ? 'Superior' : 'Inferior'} para #{selectedArch === 'upper' ? patient.current_upper_aligner + 1 : patient.current_lower_aligner + 1}
              </p>
              <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-xl mb-6 text-left">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Certifique-se de que o alinhador está limpo e encaixado corretamente.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
                <Button variant="accent" className="flex-1" onClick={handleConfirmChange} disabled={isConfirming}>
                  {isConfirming ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-5 h-5" /> Confirmar</>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Reason Modal */}
      <PauseReasonModal
        isOpen={showPauseModal && getArchStatus(selectedArch) !== 'pausado'}
        onClose={() => setShowPauseModal(false)}
        onConfirm={handlePauseWithReason}
        arch={selectedArch}
        isLoading={isConfirming}
      />
    </div>
  );
}
