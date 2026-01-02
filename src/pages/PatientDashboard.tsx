import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { PatientSidebar } from '@/components/patient/PatientSidebar';
import { DaysProgressBar } from '@/components/patient/DaysProgressBar';
import { PhotoUploadModal } from '@/components/patient/PhotoUploadModal';
import { PhotoGallery } from '@/components/patient/PhotoGallery';
import { ProfileTab } from '@/components/patient/ProfileTab';
import logo from '@/assets/logo.jpg';
import {
  Check,
  Camera,
  Clock,
  LogOut,
  Bell,
  TrendingUp,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Menu,
} from 'lucide-react';

function CircularProgress({ current, total, label }: { current: number; total: number; label: string }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
        <circle cx="48" cy="48" r="40" stroke="url(#progressGradient)" strokeWidth="8" fill="none"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="progress-ring" />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold font-display text-foreground">{current}/{total}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'treatment' | 'history' | 'gallery'>('treatment');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedArch, setSelectedArch] = useState<'upper' | 'lower'>('upper');
  const [isConfirming, setIsConfirming] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [changes, setChanges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const lastChange = changes[0];
  const lastChangeDate = lastChange ? new Date(lastChange.changed_at) : new Date(patient.start_date);
  const nextChangeDate = new Date(lastChangeDate);
  nextChangeDate.setDate(nextChangeDate.getDate() + patient.days_per_aligner);
  const daysElapsed = Math.floor((Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24));

  const handleConfirmChange = async () => {
    setIsConfirming(true);
    try {
      const currentAligner = selectedArch === 'upper' ? patient.current_upper_aligner : patient.current_lower_aligner;
      await supabase.from('aligner_changes').insert({
        patient_id: patient.id,
        aligner_number: currentAligner + 1,
        arch: selectedArch,
      });
      const updateField = selectedArch === 'upper' ? 'current_upper_aligner' : 'current_lower_aligner';
      await supabase.from('patients').update({ [updateField]: currentAligner + 1 }).eq('id', patient.id);
      fetchPatientData();
    } catch (error) {
      console.error('Error confirming change:', error);
    } finally {
      setIsConfirming(false);
      setShowConfirmModal(false);
    }
  };

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
              <Button variant="ghost" size="icon-sm"><Bell className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon-sm" onClick={logout}><LogOut className="w-5 h-5" /></Button>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {activeTab === 'profile' && <ProfileTab patient={patient} onUpdate={fetchPatientData} />}
          
          {activeTab === 'treatment' && (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-elevated p-6 rounded-3xl">
                <h2 className="text-xl font-display font-bold mb-4">Seu Progresso</h2>
                <div className="flex justify-center gap-8 mb-6">
                  {patient.arch !== 'lower' && (
                    <div className="text-center">
                      <CircularProgress current={patient.current_upper_aligner} total={patient.upper_aligners} label="Superior" />
                    </div>
                  )}
                  {patient.arch !== 'upper' && (
                    <div className="text-center">
                      <CircularProgress current={patient.current_lower_aligner} total={patient.lower_aligners} label="Inferior" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span>Você está indo muito bem!</span>
                </div>
              </motion.div>

              <DaysProgressBar daysElapsed={daysElapsed} totalDays={patient.days_per_aligner} nextChangeDate={nextChangeDate} />

              <div className="space-y-3">
                {patient.arch !== 'lower' && (
                  <Button variant="accent" size="lg" className="w-full" onClick={() => { setSelectedArch('upper'); setShowConfirmModal(true); }}
                    disabled={patient.current_upper_aligner >= patient.upper_aligners}>
                    <ArrowUp className="w-5 h-5" /> Trocar Superior ({patient.current_upper_aligner} → {patient.current_upper_aligner + 1})
                  </Button>
                )}
                {patient.arch !== 'upper' && (
                  <Button variant="gradient" size="lg" className="w-full" onClick={() => { setSelectedArch('lower'); setShowConfirmModal(true); }}
                    disabled={patient.current_lower_aligner >= patient.lower_aligners}>
                    <ArrowDown className="w-5 h-5" /> Trocar Inferior ({patient.current_lower_aligner} → {patient.current_lower_aligner + 1})
                  </Button>
                )}
              </div>

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
              {changes.map((change, index) => (
                <motion.div key={change.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                  className="glass-card p-4 rounded-xl flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-success/20' : 'bg-secondary'}`}>
                    {change.arch === 'upper' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium">{change.arch === 'upper' ? 'Superior' : 'Inferior'} #{change.aligner_number}</p>
                    <p className="text-sm text-muted-foreground">{new Date(change.changed_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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

      <PhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} patientId={patient.id}
        alignerNumber={patient.current_upper_aligner} onPhotoUploaded={fetchPatientData} />

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              onClick={(e) => e.stopPropagation()} className="glass-card-elevated p-8 rounded-3xl w-full max-w-md text-center">
              <div className="w-20 h-20 rounded-3xl gradient-accent flex items-center justify-center mx-auto mb-6">
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
    </div>
  );
}
