import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import {
  Smile,
  Check,
  Camera,
  Calendar,
  Clock,
  ChevronRight,
  LogOut,
  Bell,
  TrendingUp,
  Image,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

function CircularProgress({ current, total }: { current: number; total: number }) {
  const percentage = (current / total) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          className="text-secondary"
        />
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="url(#progressGradient)"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="progress-ring"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-display text-foreground">{current}</span>
        <span className="text-sm text-muted-foreground">de {total}</span>
      </div>
    </div>
  );
}

function CountdownTimer({ daysLeft }: { daysLeft: number }) {
  const isUrgent = daysLeft <= 2;
  
  return (
    <div className={`glass-card p-4 rounded-2xl ${isUrgent ? 'border-warning/50' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUrgent ? 'bg-warning/20' : 'bg-primary/10'}`}>
          <Clock className={`w-6 h-6 ${isUrgent ? 'text-warning' : 'text-primary'}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Próxima troca em</p>
          <p className={`text-2xl font-bold font-display ${isUrgent ? 'text-warning' : 'text-foreground'}`}>
            {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const { patients, confirmAlignerChange, getPatientChanges } = usePatients();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Get patient data (using demo patient for now)
  const patient = patients[0];
  const changes = getPatientChanges(patient?.id || '1');
  
  if (!patient) return null;

  const progress = Math.round((patient.currentAligner / patient.totalAligners) * 100);
  
  // Calculate days until next change
  const lastChange = changes[0];
  const lastChangeDate = lastChange ? new Date(lastChange.changedAt) : new Date(patient.startDate);
  const nextChangeDate = new Date(lastChangeDate);
  nextChangeDate.setDate(nextChangeDate.getDate() + patient.daysPerAligner);
  const daysLeft = Math.max(0, Math.ceil((nextChangeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const handleConfirmChange = async () => {
    setIsConfirming(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    confirmAlignerChange(patient.id);
    setIsConfirming(false);
    setShowConfirmModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <Smile className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">OrthoAlign</h1>
              <p className="text-xs text-muted-foreground">Olá, {user?.name?.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-elevated p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">Seu Progresso</h2>
              <p className="text-muted-foreground">Tratamento com {patient.totalAligners} alinhadores</p>
            </div>
            <CircularProgress current={patient.currentAligner} total={patient.totalAligners} />
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Alinhador {patient.currentAligner}</span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full gradient-hero rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-success" />
            <span>Você está indo muito bem! Continue assim.</span>
          </div>
        </motion.div>

        {/* Countdown and CTA */}
        <div className="grid gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CountdownTimer daysLeft={daysLeft} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="accent"
              size="xl"
              className="w-full"
              onClick={() => setShowConfirmModal(true)}
              disabled={patient.currentAligner >= patient.totalAligners}
            >
              <Check className="w-6 h-6" />
              Confirmar Troca de Alinhador
            </Button>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <button className="glass-card p-5 rounded-2xl text-left hover:shadow-lg transition-all group">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Adicionar Foto</h3>
            <p className="text-sm text-muted-foreground mt-1">Registre seu progresso</p>
          </button>

          <button className="glass-card p-5 rounded-2xl text-left hover:shadow-lg transition-all group">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
              <Image className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">Galeria</h3>
            <p className="text-sm text-muted-foreground mt-1">Ver fotos anteriores</p>
          </button>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Histórico de Trocas</h3>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="space-y-4">
            {changes.slice(0, 3).map((change, index) => (
              <div key={change.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-success/20' : 'bg-secondary'
                }`}>
                  <Check className={`w-5 h-5 ${index === 0 ? 'text-success' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Alinhador {change.alignerNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(change.changedAt).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {change.photoUrl && <Camera className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Next Appointment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próxima consulta</p>
              <p className="font-display font-semibold text-lg">15 de Janeiro, 2025</p>
              <p className="text-sm text-muted-foreground">{patient.dentistName}</p>
            </div>
          </div>
        </motion.div>

        {/* Care Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Dicas de Cuidados</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-success mt-0.5" />
              <span>Use o alinhador por 22 horas por dia</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-success mt-0.5" />
              <span>Limpe o alinhador com água e sabão neutro</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-success mt-0.5" />
              <span>Remova antes de comer ou beber (exceto água)</span>
            </li>
          </ul>
        </motion.div>
      </main>

      {/* Confirm Change Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card-elevated p-8 rounded-3xl w-full max-w-md"
            >
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl gradient-accent flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-2">Confirmar Troca</h2>
                <p className="text-muted-foreground mb-6">
                  Você está trocando para o <strong>Alinhador {patient.currentAligner + 1}</strong>
                </p>

                <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-xl mb-6 text-left">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Certifique-se de que o novo alinhador está limpo e encaixado corretamente.
                  </p>
                </div>

                <Button
                  variant="glass"
                  className="w-full mb-3"
                >
                  <Camera className="w-5 h-5" />
                  Adicionar foto (opcional)
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="accent"
                    className="flex-1"
                    onClick={handleConfirmChange}
                    disabled={isConfirming}
                  >
                    {isConfirming ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirmar
                        <Check className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
