import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PatientFormModal } from '@/components/dentist/PatientFormModal';
import { DeliveryModal } from '@/components/dentist/DeliveryModal';
import { DeliveryHistoryModal } from '@/components/dentist/DeliveryHistoryModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import logo from '@/assets/logo.jpg';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  User,
  Check,
  LogOut,
  Users,
  Settings,
  Layers,
  Package,
  History,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

type ArchType = 'upper' | 'lower' | 'both';
type StatusFilter = 'all' | 'on-track' | 'delayed';
type TreatmentFilter = 'all' | 'in_treatment' | 'completed';
type DentistFilter = 'all' | string;

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
  arch: ArchType;
  start_date: string;
  dentist_id: string | null;
  dentist_name: string | null;
  notes: string | null;
  provisional_password: string | null;
  process_number: string | null;
  gender: 'male' | 'female' | null;
  treatment_status: 'in_treatment' | 'completed';
  estimated_completion_date: string | null;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'patients' | 'production'>('patients');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [treatmentFilter, setTreatmentFilter] = useState<TreatmentFilter>('all');
  const [dentistFilter, setDentistFilter] = useState<DentistFilter>('all');

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
    const totalDays = maxAligners * patient.days_per_aligner + 15;
    return addDays(startDate, totalDays);
  };

  const getPatientStatus = (patient: PatientRow) => {
    const totalProgress = patient.current_upper_aligner + patient.current_lower_aligner;
    const totalAligners = patient.upper_aligners + patient.lower_aligners;
    const progress = totalAligners > 0 ? (totalProgress / totalAligners) * 100 : 0;
    
    if (progress >= 90) return 'delayed';
    if (progress >= 50) return 'pending';
    return 'on-track';
  };

  const statusConfig = {
    'on-track': { label: 'Em dia', color: 'bg-success/20 text-success', icon: Check },
    'pending': { label: 'Pendente', color: 'bg-warning/20 text-warning', icon: Clock },
    'delayed': { label: 'Atenção', color: 'bg-destructive/20 text-destructive', icon: AlertTriangle },
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

  const handleHistory = (patient: PatientRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setIsHistoryModalOpen(true);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getPatientStatus(patient);
    const matchesStatus = statusFilter === 'all' || status === statusFilter || 
      (statusFilter === 'on-track' && status === 'on-track') ||
      (statusFilter === 'delayed' && (status === 'delayed' || status === 'pending'));
    const matchesTreatment = treatmentFilter === 'all' || patient.treatment_status === treatmentFilter;
    const matchesDentist = dentistFilter === 'all' || patient.dentist_name === dentistFilter;
    return matchesSearch && matchesStatus && matchesTreatment && matchesDentist;
  });

  const tabs = [
    { id: 'patients' as const, label: 'Pacientes', icon: Users },
    { id: 'production' as const, label: 'Produção', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h1 className="font-semibold text-foreground">OrthoAlign</h1>
              <p className="text-xs text-muted-foreground">Admin: {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pb-8 space-y-6">
        {/* Patients List */}
        {activeTab === 'patients' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
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

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold">Pacientes Cadastrados</h2>
                <p className="text-sm text-muted-foreground">
                  Previsão de conclusão baseada no último alinhador + 15 dias
                </p>
              </div>
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
                  const totalAligners = patient.upper_aligners + patient.lower_aligners;
                  const currentTotal = patient.current_upper_aligner + patient.current_lower_aligner;
                  const progress = totalAligners > 0 ? Math.round((currentTotal / totalAligners) * 100) : 0;
                  const status = getPatientStatus(patient);
                  const config = statusConfig[status];
                  const StatusIcon = config.icon;
                  const estimatedDate = getEstimatedCompletion(patient);
                  const isCompleted = patient.treatment_status === 'completed';

                  return (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => handlePatientClick(patient)}
                    >
                      <div className="flex flex-col gap-3">
                        {/* Top row: Avatar + Info */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                                {patient.full_name}
                              </h3>
                              {isCompleted && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Finalizado
                                </span>
                              )}
                            </div>
                            {patient.process_number && (
                              <p className="text-xs text-muted-foreground">Processo: {patient.process_number}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Sup: {patient.current_upper_aligner}/{patient.upper_aligners} • Inf: {patient.current_lower_aligner}/{patient.lower_aligners} • {patient.dentist_name || 'Sem dentista'}
                              {estimatedDate && !isCompleted && (
                                <span className="ml-2">• Previsão: {format(estimatedDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                              )}
                            </p>
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

                          {!isCompleted && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 ${config.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </span>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon-sm"
                              onClick={(e) => handleDelivery(patient, e)}
                              title="Registrar entrega"
                            >
                              <Package className="w-5 h-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-sm"
                              onClick={(e) => handleHistory(patient, e)}
                              title="Histórico de entregas"
                            >
                              <History className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Production Control (Placeholder) */}
        {activeTab === 'production' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Layers className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold mb-2">Controle de Produção</h2>
            <p className="text-muted-foreground mb-6">
              Sistema Kanban para gerenciamento do fluxo de produção de alinhadores.
            </p>
            <Button variant="secondary">Em desenvolvimento</Button>
          </motion.div>
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
        dentistName={user?.name || 'Administrador'}
        editPatient={selectedPatient}
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
            isOpen={isHistoryModalOpen}
            onClose={() => {
              setIsHistoryModalOpen(false);
              setSelectedPatient(null);
            }}
            patientId={selectedPatient.id}
            patientName={selectedPatient.full_name}
          />
        </>
      )}
    </div>
  );
}
