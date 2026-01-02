import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bell, Check, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_arch: string | null;
  dentist_observation: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationBannerProps {
  patientId: string;
  onNotificationsChange?: () => void;
}

export function NotificationBanner({ patientId, onNotificationsChange }: NotificationBannerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [patientId]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleConfirmRead = async (notificationId: string) => {
    setLoadingId(notificationId);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notificação marcada como lida!');
      onNotificationsChange?.();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erro ao marcar como lida');
    } finally {
      setLoadingId(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pause_released':
        return 'Pausa Liberada';
      case 'message':
        return 'Comunicado';
      case 'reminder':
        return 'Lembrete';
      default:
        return 'Notificação';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pause_released':
        return 'bg-success/20 text-success';
      case 'message':
        return 'bg-primary/20 text-primary';
      case 'reminder':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-secondary text-muted-foreground';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">
          Comunicados ({notifications.length})
        </h3>
      </div>
      
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="glass-card border-2 border-primary/30 rounded-2xl overflow-hidden"
          >
            <div 
              className="p-4 bg-primary/5 cursor-pointer"
              onClick={() => setExpandedId(expandedId === notification.id ? null : notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getTypeColor(notification.type)}`}>
                      {getTypeLabel(notification.type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notification.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                </div>
                <div className="flex-shrink-0">
                  {expandedId === notification.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === notification.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-4">
                    {notification.dentist_observation && (
                      <div className="bg-secondary/50 rounded-xl p-3 mt-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium">Orientação da dentista:</span>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{notification.dentist_observation}</p>
                      </div>
                    )}
                    
                    <Button
                      variant="accent"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmRead(notification.id);
                      }}
                      disabled={loadingId === notification.id}
                    >
                      {loadingId === notification.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Marcar como lida
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
