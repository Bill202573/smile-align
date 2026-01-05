-- Habilitar realtime para dentist_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.dentist_notifications;

-- Garantir que a tabela tenha REPLICA IDENTITY FULL para realtime
ALTER TABLE public.dentist_notifications REPLICA IDENTITY FULL;