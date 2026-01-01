import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Smile,
  LogOut,
  Package,
  Clock,
  CheckCircle,
  Truck,
  DollarSign,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const mockItems = [
  { id: '1', patientName: 'Maria Silva', alignerCount: 6, status: 'received', receivedAt: '2024-12-20', value: 180 },
  { id: '2', patientName: 'João Santos', alignerCount: 8, status: 'refining', receivedAt: '2024-12-18', value: 240 },
  { id: '3', patientName: 'Ana Costa', alignerCount: 4, status: 'completed', receivedAt: '2024-12-15', value: 120 },
  { id: '4', patientName: 'Carlos Lima', alignerCount: 10, status: 'returned', receivedAt: '2024-12-10', value: 300 },
];

const statusConfig = {
  received: { label: 'Recebido', color: 'bg-warning/20 text-warning', icon: Package },
  refining: { label: 'Refinando', color: 'bg-primary/20 text-primary', icon: Sparkles },
  completed: { label: 'Concluído', color: 'bg-success/20 text-success', icon: CheckCircle },
  returned: { label: 'Devolvido', color: 'bg-accent/20 text-accent', icon: Truck },
};

export default function RefinerDashboard() {
  const { user, logout } = useAuth();

  const totalPending = mockItems.filter(i => i.status === 'received' || i.status === 'refining').length;
  const totalCompleted = mockItems.filter(i => i.status === 'completed' || i.status === 'returned').length;
  const totalValue = mockItems.filter(i => i.status === 'returned').reduce((acc, i) => acc + i.value, 0);

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
              <p className="text-xs text-muted-foreground">Refinador: {user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={logout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pendentes', value: totalPending, icon: Clock, color: 'bg-warning/10 text-warning' },
            { label: 'Concluídos', value: totalCompleted, icon: CheckCircle, color: 'bg-success/10 text-success' },
            { label: 'Faturado', value: `R$ ${totalValue}`, icon: DollarSign, color: 'bg-accent/10 text-accent' },
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
                <p className="text-xl font-display font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Status Sections */}
        {['received', 'refining', 'completed', 'returned'].map((statusKey) => {
          const items = mockItems.filter(i => i.status === statusKey);
          if (items.length === 0) return null;

          const config = statusConfig[statusKey as keyof typeof statusConfig];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={statusKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
                <h2 className="font-display font-semibold">{config.label}</h2>
                <span className="text-sm text-muted-foreground">({items.length})</span>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{item.patientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.alignerCount} alinhadores • Recebido em {new Date(item.receivedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-foreground">R$ {item.value}</p>
                      {statusKey === 'received' && (
                        <Button variant="accent" size="sm" className="mt-2">
                          Iniciar
                        </Button>
                      )}
                      {statusKey === 'refining' && (
                        <Button variant="success" size="sm" className="mt-2">
                          Concluir
                        </Button>
                      )}
                      {statusKey === 'completed' && (
                        <Button variant="secondary" size="sm" className="mt-2">
                          Devolver
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          );
        })}

        {/* Financial Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Histórico Financeiro</h3>
            <Button variant="ghost" size="sm">
              Ver completo
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {mockItems.filter(i => i.status === 'returned').map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{item.patientName}</p>
                  <p className="text-sm text-muted-foreground">{item.alignerCount} alinhadores</p>
                </div>
                <span className="font-semibold text-success">+ R$ {item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Total a receber</span>
            <span className="text-2xl font-display font-bold text-accent">R$ {totalValue}</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
