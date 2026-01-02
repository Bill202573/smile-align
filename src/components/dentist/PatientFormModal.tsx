import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Calendar, Key, Copy, Check, RefreshCw, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefiningFormSection } from './RefiningFormSection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dentistId: string;
  dentistName: string;
  editPatient?: any;
  defaultTab?: 'personal' | 'treatment';
}

export function PatientFormModal({
  isOpen,
  onClose,
  onSuccess,
  dentistId,
  dentistName,
  editPatient,
  defaultTab = 'treatment'
}: PatientFormModalProps) {
  const isEditing = !!editPatient;
  
  const getInitialFormData = () => ({
    full_name: editPatient?.full_name || '',
    cpf: editPatient?.cpf || '',
    process_number: editPatient?.process_number || '',
    birth_date: editPatient?.birth_date || '',
    email: editPatient?.email || '',
    phone: editPatient?.phone || '',
    address: editPatient?.address || '',
    upper_aligners: editPatient?.upper_aligners || 0,
    lower_aligners: editPatient?.lower_aligners || 0,
    days_per_aligner: editPatient?.days_per_aligner || 14,
    arch: editPatient?.arch || 'both',
    notes: editPatient?.notes || '',
    gender: editPatient?.gender || '',
    dentist_name: editPatient?.dentist_name || dentistName,
    refining_active: editPatient?.refining_active || false,
    refining_upper_aligners: editPatient?.refining_upper_aligners || 0,
    refining_lower_aligners: editPatient?.refining_lower_aligners || 0,
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [provisionalPassword, setProvisionalPassword] = useState(editPatient?.provisional_password || '');
  const [activeTab, setActiveTab] = useState<string>(isEditing ? defaultTab : 'personal');

  // Reset form when editPatient changes
  React.useEffect(() => {
    setFormData(getInitialFormData());
    setProvisionalPassword(editPatient?.provisional_password || '');
    setActiveTab(isEditing ? defaultTab : 'personal');
  }, [editPatient, dentistName, defaultTab]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setProvisionalPassword(password);
    return password;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(provisionalPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Senha copiada!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const password = provisionalPassword || generatePassword();
      const wasRefiningActive = editPatient?.refining_active || false;
      const isNowRefining = formData.refining_active;
      const startingRefining = !wasRefiningActive && isNowRefining;

      if (isEditing) {
        // Update existing patient
        const { gender, dentist_name, refining_active, refining_upper_aligners, refining_lower_aligners, ...restData } = formData;
        
        const updatePayload: Record<string, any> = {
          ...restData,
          gender: gender || null,
          dentist_name: dentist_name,
          provisional_password: password,
          refining_active: refining_active,
          refining_upper_aligners: refining_upper_aligners,
          refining_lower_aligners: refining_lower_aligners,
        };

        // If starting refining, set status to refino and reset refining progress
        if (startingRefining) {
          updatePayload.treatment_status = 'refino';
          updatePayload.current_refining_upper = 1;
          updatePayload.current_refining_lower = 1;
          updatePayload.refining_upper_status = 'em_uso';
          updatePayload.refining_lower_status = 'em_uso';
          updatePayload.refining_upper_last_change = new Date().toISOString().split('T')[0];
          updatePayload.refining_lower_last_change = new Date().toISOString().split('T')[0];
        }

        const { error } = await supabase
          .from('patients')
          .update(updatePayload)
          .eq('id', editPatient.id);

        if (error) throw error;

        // Record refining started in history
        if (startingRefining) {
          await supabase.from('treatment_history').insert([
            {
              patient_id: editPatient.id,
              arch: 'upper',
              event_type: 'refining_started',
              aligner_from: 0,
              aligner_to: 1,
              is_refining: true,
            },
            {
              patient_id: editPatient.id,
              arch: 'lower',
              event_type: 'refining_started',
              aligner_from: 0,
              aligner_to: 1,
              is_refining: true,
            },
          ]);
        }

        toast.success('Paciente atualizado com sucesso!');
      } else {
        // Get current user for dentist_id
        const { data: { user } } = await supabase.auth.getUser();
        const actualDentistId = user?.id || null;

        // Create patient record
        const { gender, dentist_name, refining_active, refining_upper_aligners, refining_lower_aligners, ...restData } = formData;
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            ...restData,
            gender: gender || null,
            dentist_id: actualDentistId,
            dentist_name: dentist_name,
            provisional_password: password,
            refining_active: refining_active,
            refining_upper_aligners: refining_upper_aligners,
            refining_lower_aligners: refining_lower_aligners,
          });

        if (patientError) throw patientError;
        
        toast.success('Paciente cadastrado com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card-elevated p-6 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold">
              {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
            </h2>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Dados Pessoais
                </TabsTrigger>
                <TabsTrigger value="treatment" className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Tratamento
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6 mt-0">
                {/* Personal Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input
                        value={formData.cpf}
                        onChange={(e) => handleChange('cpf', e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Nº do Processo</Label>
                      <Input
                        value={formData.process_number}
                        onChange={(e) => handleChange('process_number', e.target.value)}
                        placeholder="Número do processo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data de Nascimento</Label>
                      <Input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => handleChange('birth_date', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Gênero</Label>
                      <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        disabled={isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Endereço</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Login Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Acesso do Paciente
                  </h3>
                  
                  <div className="p-4 bg-muted rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Senha Provisória</p>
                        <p className="text-xs text-muted-foreground">
                          O paciente usará esta senha para o primeiro acesso
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={generatePassword}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Gerar Nova
                      </Button>
                    </div>
                    
                    {provisionalPassword && (
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-background rounded-lg font-mono text-lg">
                          {provisionalPassword}
                        </code>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={copyToClipboard}
                        >
                          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="treatment" className="space-y-6 mt-0">
                {/* Treatment Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Dentista</Label>
                      <Input
                        value={formData.dentist_name}
                        onChange={(e) => handleChange('dentist_name', e.target.value)}
                        placeholder="Nome do dentista responsável"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Arcada</Label>
                      <Select value={formData.arch} onValueChange={(v) => handleChange('arch', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upper">Superior</SelectItem>
                          <SelectItem value="lower">Inferior</SelectItem>
                          <SelectItem value="both">Ambas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Dias por Alinhador</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.days_per_aligner}
                        onChange={(e) => handleChange('days_per_aligner', parseInt(e.target.value) || 14)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Alinhadores Superiores</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.upper_aligners}
                        onChange={(e) => handleChange('upper_aligners', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Alinhadores Inferiores</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.lower_aligners}
                        onChange={(e) => handleChange('lower_aligners', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-3">
                      <Label>Previsão de Conclusão</Label>
                      <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                        {formData.upper_aligners > 0 || formData.lower_aligners > 0 ? (
                          (() => {
                            const maxAligners = Math.max(formData.upper_aligners, formData.lower_aligners);
                            const totalDays = maxAligners * formData.days_per_aligner + 15;
                            const estimatedDate = new Date();
                            estimatedDate.setDate(estimatedDate.getDate() + totalDays);
                            return `Aproximadamente ${estimatedDate.toLocaleDateString('pt-BR')} (${totalDays} dias a partir de hoje)`;
                          })()
                        ) : (
                          'Preencha o número de alinhadores para calcular a previsão'
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refining Section - only show when editing and treatment is completed or in refino */}
                {isEditing && (editPatient?.treatment_status === 'completed' || editPatient?.treatment_status === 'refino') && (
                  <RefiningFormSection
                    refiningActive={formData.refining_active}
                    refiningUpperAligners={formData.refining_upper_aligners}
                    refiningLowerAligners={formData.refining_lower_aligners}
                    onRefiningActiveChange={(active) => handleChange('refining_active', active)}
                    onRefiningUpperChange={(value) => handleChange('refining_upper_aligners', value)}
                    onRefiningLowerChange={(value) => handleChange('refining_lower_aligners', value)}
                  />
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    placeholder="Observações sobre o paciente..."
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {isEditing ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
