import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';

interface DashboardStatsProps {
  totalPatients: number;
  patientsInTreatment: number;
  patientsCompleted: number;
  patientsRefining: number;
  patientsNeedingAttention: number;
}

export function DashboardStats({
  totalPatients,
  patientsInTreatment,
  patientsCompleted,
  patientsRefining,
  patientsNeedingAttention,
}: DashboardStatsProps) {
  const stats = [
    { 
      label: 'Total de Pacientes', 
      value: totalPatients, 
      icon: Users, 
      color: 'bg-primary/10 text-primary',
      description: 'Pacientes cadastrados'
    },
    { 
      label: 'Em Tratamento', 
      value: patientsInTreatment, 
      icon: Clock, 
      color: 'bg-blue-500/10 text-blue-500',
      description: 'Tratamento ativo'
    },
    { 
      label: 'Finalizados', 
      value: patientsCompleted, 
      icon: CheckCircle2, 
      color: 'bg-success/10 text-success',
      description: 'Tratamento concluído'
    },
    { 
      label: 'Em Refino', 
      value: patientsRefining, 
      icon: RefreshCw, 
      color: 'bg-accent/10 text-accent',
      description: 'Fase de refinamento'
    },
    { 
      label: 'Precisam Atenção', 
      value: patientsNeedingAttention, 
      icon: AlertTriangle, 
      color: 'bg-destructive/10 text-destructive',
      description: 'Requer acompanhamento'
    },
  ];

  const completionRate = totalPatients > 0 
    ? Math.round((patientsCompleted / totalPatients) * 100) 
    : 0;
  
  const activeRate = totalPatients > 0 
    ? Math.round(((patientsInTreatment + patientsRefining) / totalPatients) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Bem-vindo ao Dashboard
        </h2>
        <p className="text-muted-foreground">
          Acompanhe o progresso dos seus pacientes e gerencie os tratamentos.
        </p>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4 rounded-2xl"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-foreground">{activeRate}%</p>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${activeRate}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Refino</p>
              <p className="text-2xl font-bold text-foreground">
                {totalPatients > 0 ? Math.round((patientsRefining / totalPatients) * 100) : 0}%
              </p>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${totalPatients > 0 ? (patientsRefining / totalPatients) * 100 : 0}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Quick Actions Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-6 rounded-2xl"
      >
        <h3 className="font-semibold text-foreground mb-3">Ações Rápidas</h3>
        <p className="text-sm text-muted-foreground">
          Use o menu lateral para acessar a lista de pacientes ou gerenciar comunicados. 
          Na aba de pacientes você pode adicionar novos pacientes, registrar entregas de alinhadores 
          e acompanhar o progresso do tratamento.
        </p>
      </motion.div>
    </div>
  );
}
