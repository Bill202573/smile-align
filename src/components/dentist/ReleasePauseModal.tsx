import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Check, AlertCircle, User, Calendar, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PausedArchInfo {
  arch: 'upper' | 'lower';
  pauseReason: string;
  pauseDate: string;
}

interface ReleasePauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (observation: string) => void;
  patientName: string;
  pausedArch: PausedArchInfo | null;
  isLoading?: boolean;
}

export function ReleasePauseModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  pausedArch,
  isLoading = false,
}: ReleasePauseModalProps) {
  const [observation, setObservation] = useState('');

  const handleConfirm = () => {
    if (!observation.trim()) return;
    onConfirm(observation);
    setObservation('');
  };

  const handleClose = () => {
    setObservation('');
    onClose();
  };

  if (!pausedArch) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card-elevated p-6 rounded-3xl w-full max-w-md"
          >
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-display font-bold text-center">Liberar Pausa</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Arcada {pausedArch.arch === 'upper' ? 'Superior' : 'Inferior'}
              </p>
            </div>

            {/* Patient Info */}
            <div className="bg-secondary/50 rounded-xl p-4 mb-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{patientName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Pausado em: {format(new Date(pausedArch.pauseDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground">Motivo: </span>
                  <span className="text-sm font-medium text-destructive">{pausedArch.pauseReason}</span>
                </div>
              </div>
            </div>

            {/* Observation Field */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">
                Observação clínica <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Ex: Utilizar alinhador substituto por 7 dias, Retomar troca normalmente, Manter alinhador atual até nova consulta..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Esta observação será enviada ao paciente como notificação.
              </p>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-xl mb-4">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                O paciente precisará confirmar a leitura da orientação antes de continuar o tratamento.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                variant="accent"
                className="flex-1"
                onClick={handleConfirm}
                disabled={!observation.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Liberar
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
