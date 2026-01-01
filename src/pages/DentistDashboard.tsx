import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import {
  Smile,
  LogOut,
  Users,
  Bell,
  Search,
  Filter,
  User,
  Check,
  Clock,
  AlertTriangle,
  Eye,
  ChevronRight,
} from 'lucide-react';

export default function DentistDashboard() {
  const { user, logout } = useAuth();
  const { patients, getPatientChanges } = usePatients();

  const getPatientStatus = (patient: typeof patients[0]) => {
    const changes = getPatientChanges(patient.id);
    const lastChange = changes[0];
    
    if (!lastChange) return 'on-track';
    
    const lastChangeDate = new Date(lastChange.changedAt);
    const nextChangeDate = new Date(lastChangeDate);
    nextChangeDate.setDate(nextChangeDate.getDate() + patient.daysPerAligner);
    
    const daysLate = Math.floor((Date.now() - nextChangeDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLate > 3) return 'delayed';
    if (daysLate >= 0) return 'pending';
    return 'on-track';
  };

  const statusConfig = {
    'on-track': { label: 'Em dia', color: 'bg-success/20 text-success', icon: Check },
    'pending': { label: 'Pendente', color: 'bg-warning/20 text-warning', icon: Clock },
    'delayed': { label: 'Atrasado', color: 'bg-destructive/20 text-destructive', icon: AlertTriangle },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <Smile className="w-5 h-5 text-white" />
            </div>
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
              className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-input bg-card text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <Button variant="secondary" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 rounded-2xl border-l-4 border-l-accent"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Nova troca confirmada</p>
              <p className="text-sm text-muted-foreground">Maria Silva trocou para o Alinhador 12 há 2 horas</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>

        {/* Patient List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">Meus Pacientes</h2>
            <Button variant="ghost" size="sm">
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {patients.map((patient, index) => {
              const status = getPatientStatus(patient);
              const config = statusConfig[status];
              const StatusIcon = config.icon;
              const progress = Math.round(((patient.currentUpperAligner + patient.currentLowerAligner) / (patient.upperAligners + patient.lowerAligners)) * 100);

              return (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{patient.fullName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Sup: {patient.currentUpperAligner}/{patient.upperAligners} • Inf: {patient.currentLowerAligner}/{patient.lowerAligners}
                      </p>
                      
                      {/* Progress bar */}
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-hero rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
