import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Camera, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileTabProps {
  patient: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    address: string | null;
    birth_date: string;
    avatar_url?: string | null;
  };
  onUpdate: () => void;
}

export function ProfileTab({ patient, onUpdate }: ProfileTabProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `avatars/${patient.id}/${Date.now()}_avatar.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('patient-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('patient-photos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('patients')
        .update({ avatar_url: publicUrl })
        .eq('id', patient.id);

      if (dbError) throw dbError;

      toast.success('Foto de perfil atualizada!');
      onUpdate();
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error('Erro ao atualizar foto: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
              {patient.avatar_url ? (
                <img 
                  src={patient.avatar_url} 
                  alt={patient.full_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 text-primary" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">{patient.full_name}</h2>
          <p className="text-muted-foreground">Paciente</p>
        </div>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{patient.email}</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Phone className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Telefone</p>
            <p className="font-medium text-foreground">{patient.phone}</p>
          </div>
        </div>

        {patient.address && (
          <div className="glass-card p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Endereço</p>
              <p className="font-medium text-foreground">{patient.address}</p>
            </div>
          </div>
        )}

        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Data de Nascimento</p>
            <p className="font-medium text-foreground">{formatDate(patient.birth_date)}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
