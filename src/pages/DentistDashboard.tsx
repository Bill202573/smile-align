import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PatientFormModal } from '@/components/dentist/PatientFormModal';
import { DeliveryModal } from '@/components/dentist/DeliveryModal';
import { DeliveryHistoryModal } from '@/components/dentist/DeliveryHistoryModal';
import { TreatmentHistoryModal } from '@/components/dentist/TreatmentHistoryModal';
import { ReleasePauseModal } from '@/components/dentist/ReleasePauseModal';
import { CommunicationsTab } from '@/components/dentist/CommunicationsTab';
import { DentistNotificationsSection } from '@/components/dentist/DentistNotificationsSection';
import { DentistNotificationsPopover } from '@/components/dentist/DentistNotificationsPopover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LogOut,
  Users,
  Search,
  User,
  Check,
  Clock,
  AlertTriangle,
  Plus,
  Package,
  History,
  CheckCircle2,
  RefreshCw,
  Pause,
  Play,
  ArrowUp,
  ArrowDown,
  MessageSquare,
} from 'lucide-react';
import logo from '@/assets/logo.jpg';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientRow {
  id: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  email: string;
  phone: string;
  address: string | null;
  upper_aligners: number;
  lower_aligners: number;
  current_upper_aligner: number;
  current_lower_aligner: number;
  days_per_aligner: number;
  arch: 'upper' | 'lower' | 'both';
  start_date: string;
  dentist_id: string | null;
  dentist_name: string | null;
  notes: string | null;
  provisional_password: string | null;
  process_number: string | null;
  gender: 'male' | 'female' | null;
  treatment_status: 'in_treatment' | 'completed' | 'refino';
  estimated_completion_date: string | null;
  upper_arch_status: 'em_uso' | 'pausado' | 'finalizado' | null;
  lower_arch_status: 'em_uso' | 'pausado' | 'finalizado' | null;
  upper_last_change_date: string | null;
  lower_last_change_date: string | null;
  // Refining fields
  refining_active: boolean;
  refining_upper_aligners: number;
  refining_lower_aligners: number;
  current_refining_upper: number;
  current_refining_lower: number;
}

interface PausedArchInfo {
  arch: 'upper' | 'lower';
  pauseReason: string;
  pauseDate: string;
}

type StatusFilter = 'all' | 'on-track' | 'delayed';
type TreatmentFilter = 'all' | 'in_treatment' | 'completed' | 'refino';
type DentistFilter = 'all' | string;
type MainTab = 'patients' | 'communications';

export default function DentistDashboard() {
  const { user, logout } = useAuth();
  
  const [mainTab, setMainTab] = useState<MainTab>('patients');
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isDeliveryHistoryModalOpen, setIsDeliveryHistoryModalOpen] = useState(false);
  const [isTreatmentHistoryModalOpen, setIsTreatmentHistoryModalOpen] = useState(false);
  const [isReleasePauseModalOpen, setIsReleasePauseModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);
  const [selectedPausedArch, setSelectedPausedArch] = useState<PausedArchInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [treatmentFilter, setTreatmentFilter] = useState<TreatmentFilter>('all');
  const [dentistFilter, setDentistFilter] = useState<DentistFilter>('all');
  const [isReleasingPause, setIsReleasingPause] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  // Get unique dentists for filter
  const uniqueDentists = useMemo(() => {
    const dentists = patients
      .map(p => p.dentist_name)
      .filter((name): name is string => !!name);
    return [...new Set(dentists)];
  }, [patients]);

  // Calculate estimated completion date for a patient
  const getEstimatedCompletion = (patient: PatientRow): Date | null => {
    const maxAligners = Math.max(patient.upper_aligners, patient.lower_aligners);
    if (maxAligners === 0) return null;
    const startDate = new Date(patient.start_date);
    const totalDays = maxAligners * patient.days_per_aligner + 15; // +15 days after last aligner
    return addDays(startDate, totalDays);
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      toast.error('Erro ao carregar pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  // Improved patient status calculation based on aligner progress vs expected
  const getPatientStatus = (patient: PatientRow) => {
    // Completed patients are always on-track
    if (patient.treatment_status === 'completed') {
      return 'on-track';
    }

    // Check if any arch is paused
    if (patient.upper_arch_status === 'pausado' || patient.lower_arch_status === 'pausado') {
      return 'delayed';
    }

    // For patients in treatment or refining, check if they're behind schedule
    const today = new Date();
    let isDelayed = false;

    // Check upper arch
    if (patient.arch !== 'lower' && patient.upper_last_change_date) {
      const lastChange = new Date(patient.upper_last_change_date);
      const daysSinceChange = differenceInDays(today, lastChange);
      if (daysSinceChange > patient.days_per_aligner) {
        isDelayed = true;
      }
    }

    // Check lower arch
    if (patient.arch !== 'upper' && patient.lower_last_change_date) {
      const lastChange = new Date(patient.lower_last_change_date);
      const daysSinceChange = differenceInDays(today, lastChange);
      if (daysSinceChange > patient.days_per_aligner) {
        isDelayed = true;
      }
    }

    return isDelayed ? 'delayed' : 'on-track';
  };

  const statusConfig = {
    'on-track': { label: 'Em dia', color: 'bg-success/20 text-success', icon: Check },
    'pending': { label: 'Pendente', color: 'bg-warning/20 text-warning', icon: Clock },
    'delayed': { label: 'Atenção', color: 'bg-destructive/20 text-destructive', icon: AlertTriangle },
  };

  // Stats calculations
  const patientsInTreatment = patients.filter(p => p.treatment_status === 'in_treatment').length;
  const patientsCompleted = patients.filter(p => p.treatment_status === 'completed').length;
  const patientsRefining = patients.filter(p => p.treatment_status === 'refino').length;
  const patientsNeedingAttention = patients.filter(p => getPatientStatus(p) === 'delayed').length;

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getPatientStatus(patient);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesTreatment = treatmentFilter === 'all' || patient.treatment_status === treatmentFilter;
    const matchesDentist = dentistFilter === 'all' || patient.dentist_name === dentistFilter;
    return matchesSearch && matchesStatus && matchesTreatment && matchesDentist;
  });

  const handlePatientClick = (patient: PatientRow) => {
    setSelectedPatient(patient);
    setIsPatientModalOpen(true);
  };

  const handleNewPatient = () => {
    setSelectedPatient(null);
    setIsPatientModalOpen(true);
  };

  const handleDelivery = (patient: PatientRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setIsDeliveryModalOpen(true);
  };

  const handleDeliveryHistory = (patient: PatientRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setIsDeliveryHistoryModalOpen(true);
  };

  const handleTreatmentHistory = (patient: PatientRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setIsTreatmentHistoryModalOpen(true);
  };

  const handleReleasePause = async (patient: PatientRow, arch: 'upper' | 'lower', e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Fetch the pause reason from treatment_history
    const { data: historyData } = await supabase
      .from('treatment_history')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('arch', arch)
      .eq('event_type', 'pause_started')
      .order('event_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    setSelectedPatient(patient);
    setSelectedPausedArch({
      arch,
      pauseReason: historyData?.patient_reason || 'Motivo não informado',
      pauseDate: historyData?.event_date || new Date().toISOString(),
    });
    setIsReleasePauseModalOpen(true);
  };

  const handleConfirmReleasePause = async (observation: string) => {
    if (!selectedPatient || !selectedPausedArch) return;
    
    setIsReleasingPause(true);
    try {
      const statusField = selectedPausedArch.arch === 'upper' ? 'upper_arch_status' : 'lower_arch_status';
      const lastChangeDateField = selectedPausedArch.arch === 'upper' ? 'upper_last_change_date' : 'lower_last_change_date';
      
      // Record release in treatment_history
      await supabase.from('treatment_history').insert({
        patient_id: selectedPatient.id,
        arch: selectedPausedArch.arch,
        event_type: 'pause_released',
        aligner_from: selectedPausedArch.arch === 'upper' ? selectedPatient.current_upper_aligner : selectedPatient.current_lower_aligner,
        aligner_to: selectedPausedArch.arch === 'upper' ? selectedPatient.current_upper_aligner : selectedPatient.current_lower_aligner,
        is_refining: selectedPatient.refining_active || false,
        dentist_note: observation,
      });
      
      // Update patient status
      await supabase.from('patients').update({
        [statusField]: 'em_uso',
        [lastChangeDateField]: new Date().toISOString().split('T')[0],
      }).eq('id', selectedPatient.id);
      
      // Create notification for patient
      await supabase.from('notifications').insert({
        patient_id: selectedPatient.id,
        title: 'Pausa Liberada',
        message: `Sua dentista liberou a pausa da arcada ${selectedPausedArch.arch === 'upper' ? 'superior' : 'inferior'}. Confira as orientações.`,
        type: 'pause_released',
        related_arch: selectedPausedArch.arch,
        dentist_observation: observation,
      });
      
      toast.success('Pausa liberada com sucesso!');
      fetchPatients();
    } catch (error) {
      console.error('Error releasing pause:', error);
      toast.error('Erro ao liberar pausa');
    } finally {
      setIsReleasingPause(false);
      setIsReleasePauseModalOpen(false);
      setSelectedPausedArch(null);
    }
  };

  const getArchStatusLabel = (status: string | null) => {
    switch (status) {
      case 'pausado':
        return { label: 'Pausado', color: 'text-destructive' };
      case 'finalizado':
        return { label: 'Finalizado', color: 'text-success' };
      default:
        return { label: 'Em dia', color: 'text-success' };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h1 className="font-semibold text-foreground">OrthoAlign</h1>
              <p className="text-xs text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DentistNotificationsPopover dentistId={user?.id || ''} />
            <Button variant="ghost" size="icon-sm" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setMainTab('patients')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              mainTab === 'patients'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Pacientes
          </button>
          <button
            onClick={() => setMainTab('communications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              mainTab === 'communications'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comunicados
          </button>
        </div>

        {mainTab === 'communications' && (
          <div className="space-y-6">
            {/* Confirmações de recebimento dos pacientes */}
            <DentistNotificationsSection />
            
            {/* Comunicados enviados */}
            <CommunicationsTab />
          </div>
        )}

        {mainTab === 'patients' && (
          <>
            {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Pacientes', value: patients.length, icon: Users, color: 'bg-primary/10 text-primary' },
            { label: 'Em tratamento', value: patientsInTreatment, icon: Clock, color: 'bg-primary/10 text-primary' },
            { label: 'Finalizados', value: patientsCompleted, icon: CheckCircle2, color: 'bg-success/10 text-success' },
            { label: 'Em refino', value: patientsRefining, icon: RefreshCw, color: 'bg-accent/10 text-accent' },
            { label: 'Atenção', value: patientsNeedingAttention, icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-3 rounded-2xl text-center"
              >
                <div className={`w-8 h-8 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-display font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-input bg-card text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="on-track">Em dia</SelectItem>
                <SelectItem value="delayed">Atenção</SelectItem>
              </SelectContent>
            </Select>

            <Select value={treatmentFilter} onValueChange={(v) => setTreatmentFilter(v as TreatmentFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tratamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in_treatment">Em tratamento</SelectItem>
                <SelectItem value="completed">Finalizado</SelectItem>
                <SelectItem value="refino">Em refino</SelectItem>
              </SelectContent>
            </Select>

            {uniqueDentists.length > 0 && (
              <Select value={dentistFilter} onValueChange={(v) => setDentistFilter(v as DentistFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Dentista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos dentistas</SelectItem>
                  {uniqueDentists.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Patient List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">Meus Pacientes</h2>
            <Button variant="gradient" onClick={handleNewPatient}>
              <Plus className="w-4 h-4" />
              Novo Paciente
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient, index) => {
                const status = getPatientStatus(patient);
                const config = statusConfig[status];
                const StatusIcon = config.icon;
                const totalAligners = patient.upper_aligners + patient.lower_aligners;
                const currentTotal = patient.current_upper_aligner + patient.current_lower_aligner;
                const progress = totalAligners > 0 ? Math.round((currentTotal / totalAligners) * 100) : 0;

                const estimatedDate = getEstimatedCompletion(patient);
                const isCompleted = patient.treatment_status === 'completed';
                const isRefining = patient.treatment_status === 'refino';

                return (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handlePatientClick(patient)}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Top row: Avatar + Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                              {patient.full_name}
                            </h3>
                            {isCompleted && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Finalizado
                              </span>
                            )}
                            {isRefining && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                Refino
                              </span>
                            )}
                          </div>
                          {patient.process_number && (
                            <p className="text-xs text-muted-foreground">Processo: {patient.process_number}</p>
                          )}
                          
                          {/* Arch details with individual status */}
                          <div className="mt-2 space-y-1">
                            {patient.arch !== 'lower' && (
                              <div className="flex items-center gap-2 text-sm">
                                <ArrowUp className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Sup: {patient.current_upper_aligner}/{patient.upper_aligners}
                                </span>
                                <span className={`text-xs font-medium ${getArchStatusLabel(patient.upper_arch_status).color}`}>
                                  {patient.upper_arch_status === 'pausado' ? (
                                    <button
                                      onClick={(e) => handleReleasePause(patient, 'upper', e)}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
                                    >
                                      <Pause className="w-3 h-3" />
                                      Pausado
                                      <Play className="w-3 h-3 ml-1" />
                                    </button>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      {getArchStatusLabel(patient.upper_arch_status).label}
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                            {patient.arch !== 'upper' && (
                              <div className="flex items-center gap-2 text-sm">
                                <ArrowDown className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Inf: {patient.current_lower_aligner}/{patient.lower_aligners}
                                </span>
                                <span className={`text-xs font-medium ${getArchStatusLabel(patient.lower_arch_status).color}`}>
                                  {patient.lower_arch_status === 'pausado' ? (
                                    <button
                                      onClick={(e) => handleReleasePause(patient, 'lower', e)}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
                                    >
                                      <Pause className="w-3 h-3" />
                                      Pausado
                                      <Play className="w-3 h-3 ml-1" />
                                    </button>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      {getArchStatusLabel(patient.lower_arch_status).label}
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          {estimatedDate && !isCompleted && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Previsão: {format(estimatedDate, 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom row: Progress + Status + Actions */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full gradient-hero rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <span className="text-xs font-medium text-primary whitespace-nowrap">
                          {progress}%
                        </span>

                        {!isCompleted && !isRefining && (
                          <button
                            onClick={(e) => handleTreatmentHistory(patient, e)}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 ${config.color} hover:opacity-80 transition-opacity`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </button>
                        )}

                        {isRefining && (
                          <button
                            onClick={(e) => handleTreatmentHistory(patient, e)}
                            className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 bg-accent/20 text-accent hover:opacity-80 transition-opacity"
                          >
                            <RefreshCw className="w-3 h-3" />
                            {patient.current_refining_upper}/{patient.refining_upper_aligners} • {patient.current_refining_lower}/{patient.refining_lower_aligners}
                          </button>
                        )}

                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            onClick={(e) => handleDelivery(patient, e)}
                            title="Registrar entrega"
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            onClick={(e) => handleDeliveryHistory(patient, e)}
                            title="Histórico de entregas"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
          </>
        )}
      </main>

      {/* Modals */}
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => {
          setIsPatientModalOpen(false);
          setSelectedPatient(null);
        }}
        onSuccess={fetchPatients}
        dentistId={user?.id || ''}
        dentistName={user?.name || ''}
        editPatient={selectedPatient}
        defaultTab="treatment"
      />

      {selectedPatient && (
        <>
          <DeliveryModal
            isOpen={isDeliveryModalOpen}
            onClose={() => {
              setIsDeliveryModalOpen(false);
              setSelectedPatient(null);
            }}
            onSuccess={fetchPatients}
            patient={{
              id: selectedPatient.id,
              full_name: selectedPatient.full_name,
              upper_aligners: selectedPatient.upper_aligners,
              lower_aligners: selectedPatient.lower_aligners,
              current_upper_aligner: selectedPatient.current_upper_aligner,
              current_lower_aligner: selectedPatient.current_lower_aligner,
            }}
            dentistId={user?.id || ''}
          />

          <DeliveryHistoryModal
            isOpen={isDeliveryHistoryModalOpen}
            onClose={() => {
              setIsDeliveryHistoryModalOpen(false);
              setSelectedPatient(null);
            }}
            patientId={selectedPatient.id}
            patientName={selectedPatient.full_name}
          />

          <TreatmentHistoryModal
            isOpen={isTreatmentHistoryModalOpen}
            onClose={() => {
              setIsTreatmentHistoryModalOpen(false);
              setSelectedPatient(null);
            }}
            patientId={selectedPatient.id}
            patientName={selectedPatient.full_name}
          />

          <ReleasePauseModal
            isOpen={isReleasePauseModalOpen}
            onClose={() => {
              setIsReleasePauseModalOpen(false);
              setSelectedPausedArch(null);
            }}
            onConfirm={handleConfirmReleasePause}
            patientName={selectedPatient.full_name}
            pausedArch={selectedPausedArch}
            isLoading={isReleasingPause}
          />
        </>
      )}
    </div>
  );
}
