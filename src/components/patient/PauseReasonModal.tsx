import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Check, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PauseReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, customReason?: string) => void;
  arch: 'upper' | 'lower';
  isLoading?: boolean;
}

const PAUSE_REASONS = [
  { value: 'broken', label: 'Alinhador quebrado' },
  { value: 'lost', label: 'Alinhador perdido' },
  { value: 'pain', label: 'Desconforto ou dor' },
  { value: 'gum_issue', label: 'Ferida / irritação na gengiva' },
  { value: 'dentist_instruction', label: 'Orientação prévia da dentista' },
  { value: 'other', label: 'Outro motivo' },
];

export function PauseReasonModal({
  isOpen,
  onClose,
  onConfirm,
  arch,
  isLoading = false,
}: PauseReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    if (!selectedReason) return;
    const reasonLabel = PAUSE_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;
    onConfirm(reasonLabel, selectedReason === 'other' ? customReason : undefined);
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  const canConfirm = selectedReason && (selectedReason !== 'other' || customReason.trim());

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
              <div className="w-16 h-16 rounded-2xl bg-warning/20 flex items-center justify-center mb-4">
                <Pause className="w-8 h-8 text-warning" />
              </div>
              <h2 className="text-xl font-display font-bold text-center">Pausar Tratamento</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Arcada {arch === 'upper' ? 'Superior' : 'Inferior'}
              </p>
            </div>

            {/* Info Alert */}
            <div className="flex items-start gap-3 p-3 bg-info/10 rounded-xl mb-4">
              <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                A outra arcada continuará normalmente. Sua dentista será notificada e liberará a pausa após análise.
              </p>
            </div>

            {/* Reasons */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-3 block">Motivo da pausa:</Label>
              <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="space-y-2">
                {PAUSE_REASONS.map((reason) => (
                  <div
                    key={reason.value}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedReason === reason.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedReason(reason.value)}
                  >
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value} className="flex-1 cursor-pointer">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Custom reason textarea */}
            {selectedReason === 'other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4"
              >
                <Textarea
                  placeholder="Descreva o motivo..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="min-h-[80px]"
                />
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                variant="accent"
                className="flex-1"
                onClick={handleConfirm}
                disabled={!canConfirm || isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmar
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
