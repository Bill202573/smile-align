import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowUp,
  ArrowDown,
  Pause,
  Play,
  CheckCircle2,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface TreatmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

interface HistoryEvent {
  id: string;
  event_date: string;
  arch: 'upper' | 'lower' | 'both';
  event_type: string;
  aligner_from: number | null;
  aligner_to: number | null;
  is_refining: boolean;
  patient_reason: string | null;
  dentist_note: string | null;
}

const eventTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  aligner_change: { label: 'Troca de alinhador', icon: RefreshCw, color: 'text-primary bg-primary/10' },
  pause_started: { label: 'Pausa iniciada', icon: Pause, color: 'text-warning bg-warning/10' },
  pause_released: { label: 'Pausa liberada', icon: Play, color: 'text-success bg-success/10' },
  arch_completed: { label: 'Arcada finalizada', icon: CheckCircle2, color: 'text-success bg-success/10' },
  refining_started: { label: 'Início do refino', icon: RefreshCw, color: 'text-accent bg-accent/10' },
  refining_completed: { label: 'Refino concluído', icon: CheckCircle2, color: 'text-success bg-success/10' },
};

const archLabels: Record<string, string> = {
  upper: 'Superior',
  lower: 'Inferior',
  both: 'Ambas',
};

export function TreatmentHistoryModal({
  isOpen,
  onClose,
  patientId,
  patientName,
}: TreatmentHistoryModalProps) {
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchHistory();
    }
  }, [isOpen, patientId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('treatment_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching treatment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ArchIcon = ({ arch }: { arch: string }) => {
    if (arch === 'upper') return <ArrowUp className="w-4 h-4" />;
    if (arch === 'lower') return <ArrowDown className="w-4 h-4" />;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Histórico de Tratamento
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{patientName}</p>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum evento registrado ainda.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

              <div className="space-y-4">
                {history.map((event) => {
                  const config = eventTypeConfig[event.event_type] || {
                    label: event.event_type,
                    icon: Clock,
                    color: 'text-muted-foreground bg-muted',
                  };
                  const EventIcon = config.icon;

                  return (
                    <div key={event.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className={`absolute left-2 top-2 w-5 h-5 rounded-full flex items-center justify-center ${config.color}`}>
                        <EventIcon className="w-3 h-3" />
                      </div>

                      <div className="glass-card p-4 rounded-xl space-y-2">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${config.color.split(' ')[0]}`}>
                                {config.label}
                              </span>
                              {event.is_refining && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                                  Refino
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(event.event_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ArchIcon arch={event.arch} />
                            <span>{archLabels[event.arch]}</span>
                          </div>
                          
                          {event.aligner_from !== null && event.aligner_to !== null && (
                            <span className="text-muted-foreground">
                              {event.aligner_from} → {event.aligner_to}
                            </span>
                          )}
                        </div>

                        {/* Reason/Note */}
                        {event.patient_reason && (
                          <div className="text-sm p-2 bg-warning/10 rounded-lg">
                            <span className="font-medium text-warning">Motivo do paciente: </span>
                            <span className="text-muted-foreground">{event.patient_reason}</span>
                          </div>
                        )}
                        
                        {event.dentist_note && (
                          <div className="text-sm p-2 bg-primary/10 rounded-lg">
                            <span className="font-medium text-primary">Obs. dentista: </span>
                            <span className="text-muted-foreground">{event.dentist_note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
