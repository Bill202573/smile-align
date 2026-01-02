import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Pause, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArchProgressCardProps {
  arch: 'upper' | 'lower';
  currentAligner: number;
  totalAligners: number;
  status: 'em_uso' | 'pausado' | 'finalizado';
  daysElapsed: number;
  totalDays: number;
  nextChangeDate: Date;
  onChangeClick: () => void;
  onPauseToggle: () => void;
}

export function ArchProgressCard({
  arch,
  currentAligner,
  totalAligners,
  status,
  daysElapsed,
  totalDays,
  nextChangeDate,
  onChangeClick,
  onPauseToggle,
}: ArchProgressCardProps) {
  const isUpper = arch === 'upper';
  const archLabel = isUpper ? 'Superior' : 'Inferior';
  const Icon = isUpper ? ArrowUp : ArrowDown;
  
  const percentage = totalAligners > 0 ? (currentAligner / totalAligners) * 100 : 0;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const daysLeft = totalDays - daysElapsed;
  const daysPercentage = Math.min((daysElapsed / totalDays) * 100, 100);

  const isFinalized = status === 'finalizado' || currentAligner >= totalAligners;
  const isPaused = status === 'pausado';
  const canChange = !isFinalized && !isPaused;

  const getStatusColor = () => {
    if (isFinalized) return 'text-success';
    if (isPaused) return 'text-warning';
    return 'text-primary';
  };

  const getStatusBg = () => {
    if (isFinalized) return 'bg-success/10';
    if (isPaused) return 'bg-warning/10';
    return isUpper ? 'bg-accent/10' : 'bg-primary/10';
  };

  const getDaysColor = () => {
    if (daysLeft <= 2) return 'bg-destructive/10 text-destructive';
    if (daysLeft <= 5) return 'bg-warning/10 text-warning';
    return 'bg-primary/10 text-primary';
  };

  const getDaysBarColor = () => {
    if (daysPercentage >= 80) return 'bg-gradient-to-r from-warning to-destructive';
    if (daysPercentage >= 50) return 'bg-gradient-to-r from-primary to-warning';
    return 'bg-gradient-to-r from-primary to-accent';
  };

  const formattedDate = nextChangeDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 rounded-2xl space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${getStatusBg()} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${getStatusColor()}`} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{archLabel}</h3>
            <p className="text-sm text-muted-foreground">
              {isFinalized ? 'Finalizado' : isPaused ? 'Pausado' : `${currentAligner} de ${totalAligners}`}
            </p>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="none" className="text-secondary" />
            <circle 
              cx="40" cy="40" r="36" 
              stroke={isFinalized ? 'hsl(var(--success))' : isPaused ? 'hsl(var(--warning))' : isUpper ? 'hsl(var(--accent))' : 'hsl(var(--primary))'} 
              strokeWidth="6" fill="none"
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              className="transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold font-display text-foreground">{currentAligner}/{totalAligners}</span>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {isFinalized && (
        <div className="flex items-center gap-2 p-3 bg-success/10 rounded-xl">
          <Check className="w-4 h-4 text-success flex-shrink-0" />
          <p className="text-sm text-success font-medium">Manter último alinhador</p>
        </div>
      )}

      {isPaused && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-xl">
          <Pause className="w-4 h-4 text-warning flex-shrink-0" />
          <p className="text-sm text-warning font-medium">Alinhador pausado. Continue usando o outro normalmente.</p>
        </div>
      )}

      {/* Days Progress (only if not finalized) */}
      {!isFinalized && !isPaused && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Próxima troca: {formattedDate}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDaysColor()}`}>
              {daysLeft <= 0 ? 'Trocar!' : `${daysLeft}d`}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getDaysBarColor()}`}
              style={{ width: `${daysPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant={isUpper ? 'accent' : 'gradient'}
          size="sm"
          className="flex-1"
          onClick={onChangeClick}
          disabled={!canChange}
        >
          <Icon className="w-4 h-4" />
          {isFinalized ? 'Finalizado' : `Trocar (${currentAligner} → ${currentAligner + 1})`}
        </Button>
        
        {!isFinalized && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onPauseToggle}
            className="px-3"
          >
            {isPaused ? <Check className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
