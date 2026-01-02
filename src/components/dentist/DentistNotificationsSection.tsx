import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck, User, Inbox } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

interface DentistNotification {
  id: string;
  patient_id: string;
  notification_id: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export function DentistNotificationsSection() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DentistNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('dentist_notifications')
        .select('*')
        .eq('dentist_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching dentist notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    setLoadingId(notificationId);
    try {
      const { error } = await supabase
        .from('dentist_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      toast.success('Notificação marcada como lida');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Erro ao marcar como lida');
    } finally {
      setLoadingId(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Confirmações de Recebimento</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
              {unreadCount} nova{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="font-medium text-foreground mb-1">Nenhuma confirmação</h4>
          <p className="text-sm text-muted-foreground">
            Quando um paciente confirmar o recebimento de um comunicado, você verá aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`glass-card p-4 rounded-2xl ${!notification.is_read ? 'border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !notification.is_read ? 'bg-primary/20' : 'bg-secondary'
                  }`}>
                    <User className={`w-5 h-5 ${!notification.is_read ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        !notification.is_read ? 'bg-success/20 text-success' : 'bg-secondary text-muted-foreground'
                      }`}>
                        {!notification.is_read ? 'Novo' : 'Lido'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-foreground">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    
                    {notification.read_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Visto em: {format(new Date(notification.read_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                  
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={loadingId === notification.id}
                      className="flex-shrink-0"
                    >
                      {loadingId === notification.id ? (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
