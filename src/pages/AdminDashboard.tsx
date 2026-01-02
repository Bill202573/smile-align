import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PatientFormModal } from '@/components/dentist/PatientFormModal';
import { DeliveryModal } from '@/components/dentist/DeliveryModal';
import { DeliveryHistoryModal } from '@/components/dentist/DeliveryHistoryModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpg';
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
} from 'lucide-react';

type ArchType = 'upper' | 'lower' | 'both';

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

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {/* Search */}
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

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">Pacientes Cadastrados</h2>
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

                  return (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => handlePatientClick(patient)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                            {patient.full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Sup: {patient.current_upper_aligner}/{patient.upper_aligners} • Inf: {patient.current_lower_aligner}/{patient.lower_aligners} • {patient.dentist_name || 'Sem dentista'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-2">
                            <div className="text-sm font-medium text-accent">{progress}%</div>
                            <div className="text-xs text-muted-foreground">progresso</div>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
