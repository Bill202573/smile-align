import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

// Componente SVG para arcada superior
const UpperArchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M4 16C4 10 8 6 12 6C16 6 20 10 20 16" strokeLinecap="round" />
    <path d="M6 14C6 11 9 8 12 8C15 8 18 11 18 14" strokeLinecap="round" />
  </svg>
);

// Componente SVG para arcada inferior
const LowerArchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M4 8C4 14 8 18 12 18C16 18 20 14 20 8" strokeLinecap="round" />
    <path d="M6 10C6 13 9 16 12 16C15 16 18 13 18 10" strokeLinecap="round" />
  </svg>
);

interface Delivery {
  id: string;
  upper_from: number;
  upper_to: number;
  lower_from: number;
  lower_to: number;
  upper_retainer_qty: number;
  lower_retainer_qty: number;
  delivered_at: string;
  notes: string | null;
}

interface DeliveryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

export function DeliveryHistoryModal({
  isOpen,
  onClose,
  patientId,
  patientName
}: DeliveryHistoryModalProps) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchDeliveries();
    }
  }, [isOpen, patientId]);

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('aligner_deliveries')
        .select('*')
        .eq('patient_id', patientId)
        .order('delivered_at', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setIsLoading(false);
    }
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
          className="glass-card-elevated p-6 rounded-3xl w-full max-w-md max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold">Histórico de Entregas</h2>
              <p className="text-sm text-muted-foreground">{patientName}</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nenhuma entrega registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery, index) => (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-muted rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(delivery.delivered_at).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {delivery.upper_to > 0 && (
                      <div className="flex items-center gap-2">
                        <UpperArchIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                          Superior: {delivery.upper_from} → {delivery.upper_to}
                        </span>
                      </div>
                    )}
                    {delivery.lower_to > 0 && (
                      <div className="flex items-center gap-2">
                        <LowerArchIcon className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">
                          Inferior: {delivery.lower_from} → {delivery.lower_to}
                        </span>
                      </div>
                    )}
                    {(delivery.upper_retainer_qty > 0 || delivery.lower_retainer_qty > 0) && (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium text-success">
                          Contenções: {delivery.upper_retainer_qty > 0 && `${delivery.upper_retainer_qty} sup.`}
                          {delivery.upper_retainer_qty > 0 && delivery.lower_retainer_qty > 0 && ' • '}
                          {delivery.lower_retainer_qty > 0 && `${delivery.lower_retainer_qty} inf.`}
                        </span>
                      </div>
                    )}
                  </div>

                  {delivery.notes && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                      {delivery.notes}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
