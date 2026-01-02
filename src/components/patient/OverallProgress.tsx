import React from 'react';
import { TrendingUp, Check } from 'lucide-react';

interface OverallProgressProps {
  upperCurrent: number;
  upperTotal: number;
  lowerCurrent: number;
  lowerTotal: number;
  arch: 'upper' | 'lower' | 'both';
}

export function OverallProgress({ upperCurrent, upperTotal, lowerCurrent, lowerTotal, arch }: OverallProgressProps) {
  // Calculate overall progress based on arch type
  let usedAligners = 0;
  let totalAligners = 0;

  if (arch === 'upper') {
    usedAligners = upperCurrent;
    totalAligners = upperTotal;
  } else if (arch === 'lower') {
    usedAligners = lowerCurrent;
    totalAligners = lowerTotal;
  } else {
    usedAligners = upperCurrent + lowerCurrent;
    totalAligners = upperTotal + lowerTotal;
  }

  const percentage = totalAligners > 0 ? (usedAligners / totalAligners) * 100 : 0;
  const isComplete = percentage >= 100;

  const getMessage = () => {
    if (isComplete) return 'Tratamento concluído! 🎉';
    if (percentage >= 75) return 'Quase lá! Continue assim!';
    if (percentage >= 50) return 'Metade do caminho!';
    if (percentage >= 25) return 'Ótimo progresso!';
    return 'Início do tratamento';
  };

  return (
    <div className="glass-card-elevated p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-foreground">Progresso Geral</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isComplete ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
        }`}>
          {Math.round(percentage)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-secondary rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isComplete 
              ? 'bg-gradient-to-r from-success to-success/80' 
              : 'bg-gradient-to-r from-primary via-accent to-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <TrendingUp className="w-4 h-4 text-primary" />
          )}
          <span className="text-muted-foreground">{getMessage()}</span>
        </div>
        <span className="font-medium text-foreground">{usedAligners}/{totalAligners}</span>
      </div>
    </div>
  );
}
