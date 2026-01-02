import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bell, Check, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    setIsLoading(true);
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
      toast.success('Leitura confirmada!');
      onNotificationsChange?.();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erro ao confirmar leitura');
    } finally {
      setIsLoading(false);
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-card border-2 border-primary/30 rounded-2xl overflow-hidden"
        >
          <div className="p-4 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{notification.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                {notification.dentist_observation && (
                  <div className="bg-secondary/50 rounded-xl p-3 mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium">Orientação da dentista:</span>
                    </div>
                    <p className="text-sm text-foreground">{notification.dentist_observation}</p>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="accent"
              size="sm"
              className="w-full mt-4"
              onClick={() => handleConfirmRead(notification.id)}
              disabled={isLoading}
            >
              {isLoading ? (
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
      ))}
    </div>
  );
}
