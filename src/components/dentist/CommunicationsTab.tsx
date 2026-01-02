import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Filter, 
  User, 
  Clock, 
  Check, 
  CheckCheck,
  Plus,
  Search,
  Inbox
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  patient_id: string;
  title: string;
  message: string;
  type: string;
  dentist_observation: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  patient?: {
    full_name: string;
  };
}

interface Patient {
  id: string;
  full_name: string;
  dentist_id: string | null;
}

type FilterStatus = 'all' | 'unread' | 'read';

export function CommunicationsTab() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch patients for this dentist
      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, full_name, dentist_id')
        .order('full_name');
      
      setPatients(patientsData || []);

      // Fetch only notifications of type 'message' sent by dentist
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'message')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      }

      // Map patient names to notifications
      const notificationsWithPatients = (notificationsData || []).map(notification => {
        const patient = patientsData?.find(p => p.id === notification.patient_id);
        return {
          ...notification,
          patient: patient ? { full_name: patient.full_name } : undefined
        };
      });

      setNotifications(notificationsWithPatients);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar comunicados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedPatientId || !messageTitle.trim() || !messageContent.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.from('notifications').insert({
        patient_id: selectedPatientId,
        title: messageTitle.trim(),
        message: messageContent.trim(),
        type: 'message',
        dentist_observation: messageContent.trim(),
      }).select().single();

      if (error) throw error;

      toast.success('Comunicado enviado com sucesso!');
      setIsNewMessageOpen(false);
      setSelectedPatientId('');
      setMessageTitle('');
      setMessageContent('');
      
      // Refresh data to show the new message
      fetchData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar comunicado');
    } finally {
      setIsSending(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'unread' && !n.is_read) ||
      (filterStatus === 'read' && n.is_read);
    
    const matchesSearch = searchTerm === '' || 
      n.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold">Comunicados Enviados</h2>
        <Button variant="gradient" onClick={() => setIsNewMessageOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Comunicado
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por paciente ou mensagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border-2 border-input bg-card text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unread">Não lidos</SelectItem>
            <SelectItem value="read">Lidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
          <p className="text-xs text-muted-foreground">Total Enviados</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-warning">{notifications.filter(n => !n.is_read).length}</p>
          <p className="text-xs text-muted-foreground">Aguardando Leitura</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-success">{notifications.filter(n => n.is_read).length}</p>
          <p className="text-xs text-muted-foreground">Confirmados</p>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Nenhum comunicado encontrado</h3>
          <p className="text-sm text-muted-foreground">
            {filterStatus !== 'all' ? 'Tente alterar os filtros.' : 'Envie um novo comunicado para um paciente.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`glass-card p-4 rounded-2xl ${!notification.is_read ? 'border-l-4 border-l-warning' : 'border-l-4 border-l-success'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notification.is_read ? 'bg-success/20' : 'bg-warning/20'
                }`}>
                  <User className={`w-5 h-5 ${notification.is_read ? 'text-success' : 'text-warning'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-foreground">{notification.patient?.full_name || 'Paciente'}</span>
                    <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${notification.is_read ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                      {notification.is_read ? <CheckCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{notification.is_read ? 'Confirmado' : 'Aguardando'}</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{notification.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Enviado: {format(new Date(notification.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</span>
                    {notification.is_read && notification.read_at && (
                      <span className="text-success">Confirmado: {format(new Date(notification.read_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Message Modal */}
      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Novo Comunicado
            </DialogTitle>
            <DialogDescription>
              Envie uma mensagem ou comunicado para um paciente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paciente</label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <input
                type="text"
                placeholder="Ex: Lembrete de consulta"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                className="w-full h-10 px-4 rounded-xl border-2 border-input bg-card text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mensagem</label>
              <Textarea
                placeholder="Digite sua mensagem para o paciente..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setIsNewMessageOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="gradient" 
              className="flex-1" 
              onClick={handleSendMessage}
              disabled={isSending || !selectedPatientId || !messageTitle.trim() || !messageContent.trim()}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
