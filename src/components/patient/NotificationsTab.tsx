import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Check, MessageSquare, Inbox, Filter } from 'lucide-react';
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
  read_at: string | null;
}

interface NotificationsTabProps {
  patientId: string;
  onNotificationsChange?: () => void;
}

type FilterStatus = 'all' | 'unread' | 'read';

export function NotificationsTab({ patientId, onNotificationsChange }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [patientId]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRead = async (notificationId: string) => {
    setConfirmingId(notificationId);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      toast.success('Leitura confirmada!');
      onNotificationsChange?.();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erro ao confirmar leitura');
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterStatus === 'unread') return !n.is_read;
    if (filterStatus === 'read') return n.is_read;
    return true;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pause_released':
        return 'Pausa Liberada';
      case 'message':
        return 'Mensagem';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold">Notificações</h2>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="unread">Não lidas</SelectItem>
            <SelectItem value="read">Lidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            {filterStatus === 'unread' ? 'Nenhuma notificação não lida' : 
             filterStatus === 'read' ? 'Nenhuma notificação lida' : 
             'Nenhuma notificação'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {filterStatus === 'unread' 
              ? 'Você está em dia com suas notificações!' 
              : 'As notificações da sua dentista aparecerão aqui.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card rounded-2xl overflow-hidden ${
                !notification.is_read ? 'border-2 border-primary/30' : 'opacity-75'
              }`}
            >
              {/* Header */}
              <div
                className={`p-4 cursor-pointer ${!notification.is_read ? 'bg-primary/5' : ''}`}
                onClick={() => setExpandedId(expandedId === notification.id ? null : notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !notification.is_read ? 'bg-primary/20' : 'bg-secondary'
                  }`}>
                    <Bell className={`w-5 h-5 ${!notification.is_read ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getTypeColor(notification.type)}`}>
                        {getTypeLabel(notification.type)}
                      </span>
                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
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
                        <div className="bg-secondary/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Orientação da dentista:</span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{notification.dentist_observation}</p>
                        </div>
                      )}

                      {!notification.is_read && (
                        <Button
                          variant="accent"
                          className="w-full"
                          onClick={() => handleConfirmRead(notification.id)}
                          disabled={confirmingId === notification.id}
                        >
                          {confirmingId === notification.id ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Confirmar Leitura
                            </>
                          )}
                        </Button>
                      )}

                      {notification.is_read && notification.read_at && (
                        <p className="text-xs text-center text-muted-foreground">
                          Lida em {format(new Date(notification.read_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
