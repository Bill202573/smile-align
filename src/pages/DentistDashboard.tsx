import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PatientFormModal } from '@/components/dentist/PatientFormModal';
import { DeliveryModal } from '@/components/dentist/DeliveryModal';
import { DeliveryHistoryModal } from '@/components/dentist/DeliveryHistoryModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  LogOut,
  Users,
  Bell,
  Search,
  Filter,
  User,
  Check,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  Package,
  History,
} from 'lucide-react';
import logo from '@/assets/logo.jpg';

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
}

export default function DentistDashboard() {
  const { user, logout } = useAuth();
  
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

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

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pacientes', value: patients.length, icon: Users, color: 'bg-primary/10 text-primary' },
            { label: 'Em dia', value: patients.filter(p => getPatientStatus(p) === 'on-track').length, icon: Check, color: 'bg-success/10 text-success' },
            { label: 'Atenção', value: patients.filter(p => getPatientStatus(p) === 'delayed').length, icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 rounded-2xl text-center"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Search and Filter */}
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
          <Button variant="secondary" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
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

                return (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handlePatientClick(patient)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-7 h-7 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-1">
                          <h3 className="font-semibold text-foreground truncate flex-1 hover:text-primary transition-colors">
                            {patient.full_name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${config.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Sup: {patient.current_upper_aligner}/{patient.upper_aligners} • Inf: {patient.current_lower_aligner}/{patient.lower_aligners}
                        </p>
                        
                        {/* Progress bar */}
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-hero rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
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
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
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
