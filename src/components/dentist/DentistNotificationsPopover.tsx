import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Check, User, Inbox } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface DentistNotificationsPopoverProps {
  dentistId: string;
}

export function DentistNotificationsPopover({ dentistId }: DentistNotificationsPopoverProps) {
  const [notifications, setNotifications] = useState<DentistNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (dentistId) {
      console.log('DentistNotificationsPopover: fetching for dentist:', dentistId);
      fetchNotifications();
      
      // Set up realtime subscription
      const channel = supabase
        .channel('dentist_notifications_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'dentist_notifications',
          },
          (payload) => {
            console.log('Realtime notification received:', payload);
            fetchNotifications();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [dentistId]);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications for dentist:', dentistId);
      const { data, error } = await supabase
        .from('dentist_notifications')
        .select('*')
        .eq('dentist_id', dentistId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      console.log('Notifications result:', { data, error });
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching dentist notifications:', error);
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
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notificação marcada como lida');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Erro ao marcar como lida');
    } finally {
      setLoadingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('dentist_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('dentist_id', dentistId)
        .eq('is_read', false);

      if (error) throw error;
      
      setNotifications([]);
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Erro ao marcar notificações');
    }
  };

  const unreadCount = notifications.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(new Date(notification.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={loadingId === notification.id}
                        className="flex-shrink-0"
                      >
                        {loadingId === notification.id ? (
                          <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
