import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowUp, 
  ArrowDown, 
  Pause, 
  Play, 
  RefreshCw, 
  CheckCircle2,
  Package,
  Clock,
  FileText
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TreatmentHistoryEvent {
  id: string;
  patient_id: string;
  event_type: string;
  arch: 'upper' | 'lower' | 'both';
  aligner_from: number | null;
  aligner_to: number | null;
  is_refining: boolean | null;
  dentist_note: string | null;
  patient_reason: string | null;
  event_date: string;
  created_by: string | null;
}

interface AlignerChange {
  id: string;
  patient_id: string;
  aligner_number: number;
  arch: 'upper' | 'lower' | 'both';
  changed_at: string;
  notes: string | null;
}

interface PatientHistoryTabProps {
  patientId: string;
}

export function PatientHistoryTab({ patientId }: PatientHistoryTabProps) {
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentHistoryEvent[]>([]);
  const [alignerChanges, setAlignerChanges] = useState<AlignerChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchHistory();
    }
  }, [patientId]);

  const fetchHistory = async () => {
    try {
      const [historyResult, changesResult] = await Promise.all([
        supabase
          .from('treatment_history')
          .select('*')
          .eq('patient_id', patientId)
          .order('event_date', { ascending: false }),
        supabase
          .from('aligner_changes')
          .select('*')
          .eq('patient_id', patientId)
          .order('changed_at', { ascending: false })
      ]);

      if (historyResult.data) {
        setTreatmentHistory(historyResult.data);
      }
      if (changesResult.data) {
        setAlignerChanges(changesResult.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (eventType: string, arch: string) => {
    switch (eventType) {
      case 'aligner_change':
        return arch === 'upper' ? ArrowUp : ArrowDown;
      case 'pause_started':
        return Pause;
      case 'pause_released':
        return Play;
      case 'refining_started':
        return RefreshCw;
      case 'arch_completed':
        return CheckCircle2;
      case 'delivery':
        return Package;
      default:
        return FileText;
    }
  };

  const getEventLabel = (event: TreatmentHistoryEvent) => {
    const archLabel = event.arch === 'upper' ? 'Superior' : event.arch === 'lower' ? 'Inferior' : 'Ambas';
    
    switch (event.event_type) {
      case 'aligner_change':
        return `Troca de alinhador ${archLabel} #${event.aligner_from} → #${event.aligner_to}`;
      case 'pause_started':
        return `Pausa iniciada - ${archLabel}`;
      case 'pause_released':
        return `Pausa liberada - ${archLabel}`;
      case 'refining_started':
        return `Refinamento iniciado - ${archLabel}`;
      case 'arch_completed':
        return `Arcada ${archLabel} finalizada`;
      case 'delivery':
        return `Entrega de alinhadores - ${archLabel}`;
      default:
        return event.event_type;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'aligner_change':
        return 'bg-primary/10 text-primary';
      case 'pause_started':
        return 'bg-destructive/10 text-destructive';
      case 'pause_released':
        return 'bg-success/10 text-success';
      case 'refining_started':
        return 'bg-accent/10 text-accent';
      case 'arch_completed':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Combine and sort all events by date
  const allEvents = [
    ...treatmentHistory.map(e => ({
      id: e.id,
      type: 'history' as const,
      date: new Date(e.event_date),
      data: e
    })),
    ...alignerChanges.map(c => ({
      id: c.id,
      type: 'change' as const,
      date: new Date(c.changed_at),
      data: c
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Remove duplicates (aligner_change events that also appear in aligner_changes)
  const uniqueEvents = allEvents.filter((event, index, self) => {
    if (event.type === 'change') {
      // Check if there's a corresponding history event
      const hasHistoryEvent = self.some(e => 
        e.type === 'history' && 
        (e.data as TreatmentHistoryEvent).event_type === 'aligner_change' &&
        (e.data as TreatmentHistoryEvent).aligner_to === (event.data as AlignerChange).aligner_number &&
        (e.data as TreatmentHistoryEvent).arch === (event.data as AlignerChange).arch
      );
      return !hasHistoryEvent;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold">Histórico do Tratamento</h3>
        <span className="text-xs text-muted-foreground">({uniqueEvents.length} eventos)</span>
      </div>

      {uniqueEvents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum registro encontrado</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {uniqueEvents.map((event, index) => {
              if (event.type === 'history') {
                const historyEvent = event.data as TreatmentHistoryEvent;
                const Icon = getEventIcon(historyEvent.event_type, historyEvent.arch);
                const colorClass = getEventColor(historyEvent.event_type);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="glass-card p-4 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{getEventLabel(historyEvent)}</p>
                        {historyEvent.patient_reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Motivo: {historyEvent.patient_reason}
                          </p>
                        )}
                        {historyEvent.dentist_note && (
                          <p className="text-xs text-primary mt-1">
                            Obs. dentista: {historyEvent.dentist_note}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(event.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      {historyEvent.is_refining && (
                        <span className="text-[10px] px-2 py-0.5 bg-accent/20 text-accent rounded-full">
                          Refino
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              } else {
                const change = event.data as AlignerChange;
                const Icon = change.arch === 'upper' ? ArrowUp : ArrowDown;
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="glass-card p-4 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          Alinhador {change.arch === 'upper' ? 'Superior' : 'Inferior'} #{change.aligner_number}
                        </p>
                        {change.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{change.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(event.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              }
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
