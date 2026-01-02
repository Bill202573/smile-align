import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient: {
    id: string;
    full_name: string;
    upper_aligners: number;
    lower_aligners: number;
    current_upper_aligner: number;
    current_lower_aligner: number;
  };
  dentistId: string;
}

export function DeliveryModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
  dentistId
}: DeliveryModalProps) {
  const [formData, setFormData] = useState({
    upper_from: 0,
    upper_to: 0,
    lower_from: 0,
    lower_to: 0,
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Record the delivery
      const { error: deliveryError } = await supabase
        .from('aligner_deliveries')
        .insert({
          patient_id: patient.id,
          upper_from: formData.upper_from,
          upper_to: formData.upper_to,
          lower_from: formData.lower_from,
          lower_to: formData.lower_to,
          delivered_by: dentistId,
          notes: formData.notes || null,
        });

      if (deliveryError) throw deliveryError;

      // Update patient's total aligners if needed
      const updates: any = {};
      if (formData.upper_to > patient.upper_aligners) {
        updates.upper_aligners = formData.upper_to;
      }
      if (formData.lower_to > patient.lower_aligners) {
        updates.lower_aligners = formData.lower_to;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('patients')
          .update(updates)
          .eq('id', patient.id);

        if (updateError) throw updateError;
      }

      toast.success('Entrega registrada com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error recording delivery:', error);
      toast.error('Erro ao registrar entrega: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card-elevated p-6 rounded-3xl w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold">Confirmar Entrega</h2>
              <p className="text-sm text-muted-foreground">{patient.full_name}</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upper Aligners */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ArrowUp className="w-4 h-4 text-primary" />
                </div>
                <Label className="font-semibold">Alinhadores Superiores</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pl-10">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">De</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.upper_from}
                    onChange={(e) => handleChange('upper_from', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Até</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.upper_to}
                    onChange={(e) => handleChange('upper_to', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Lower Aligners */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <ArrowDown className="w-4 h-4 text-accent" />
                </div>
                <Label className="font-semibold">Alinhadores Inferiores</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pl-10">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">De</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.lower_from}
                    onChange={(e) => handleChange('lower_from', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Até</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.lower_to}
                    onChange={(e) => handleChange('lower_to', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">Resumo da entrega:</p>
              <div className="space-y-1 text-sm">
                {formData.upper_to > 0 && (
                  <p className="font-medium">
                    Superior: {formData.upper_from} → {formData.upper_to} 
                    <span className="text-muted-foreground ml-1">
                      ({formData.upper_to - formData.upper_from + 1} alinhadores)
                    </span>
                  </p>
                )}
                {formData.lower_to > 0 && (
                  <p className="font-medium">
                    Inferior: {formData.lower_from} → {formData.lower_to}
                    <span className="text-muted-foreground ml-1">
                      ({formData.lower_to - formData.lower_from + 1} alinhadores)
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={2}
                placeholder="Observações sobre a entrega..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Confirmar Entrega
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
