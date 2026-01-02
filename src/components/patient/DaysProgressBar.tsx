import React from 'react';

interface DaysProgressBarProps {
  daysElapsed: number;
  totalDays: number;
  nextChangeDate: Date;
}

export function DaysProgressBar({ daysElapsed, totalDays, nextChangeDate }: DaysProgressBarProps) {
  const percentage = Math.min((daysElapsed / totalDays) * 100, 100);
  
  // Color based on progress: blue -> orange -> red
  const getColor = () => {
    if (percentage < 50) {
      return 'from-blue-500 to-blue-400';
    } else if (percentage < 80) {
      return 'from-blue-500 via-orange-400 to-orange-500';
    } else {
      return 'from-orange-500 via-red-400 to-red-500';
    }
  };

  const getBackgroundGradient = () => {
    if (percentage < 50) {
      return 'bg-gradient-to-r from-blue-500 to-blue-400';
    } else if (percentage < 80) {
      return 'bg-gradient-to-r from-blue-500 via-orange-400 to-orange-500';
    } else {
      return 'bg-gradient-to-r from-orange-500 via-red-400 to-red-500';
    }
  };

  const daysLeft = totalDays - daysElapsed;
  const formattedDate = nextChangeDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="glass-card p-5 rounded-2xl">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Próxima troca</p>
        <p className="font-display font-semibold text-lg text-foreground">{formattedDate}</p>
      </div>
      
      <div className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${
        daysLeft <= 2 
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
          : daysLeft <= 5 
            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      }`}>
        {daysLeft <= 0 ? 'Hora de trocar!' : `${daysLeft} dias restantes`}
      </div>
      
      <div className="relative">
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBackgroundGradient()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Dia {daysElapsed}</span>
          <span>Dia {totalDays}</span>
        </div>
      </div>
    </div>
  );
}
