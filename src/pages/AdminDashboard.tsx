import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Smile,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Clock,
  Stethoscope,
  FileText,
  Check,
  LogOut,
  Users,
  Settings,
  Layers,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

type ArchType = 'upper' | 'lower' | 'both';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { addPatient, patients } = usePatients();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'patients' | 'register' | 'production'>('patients');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    birthDate: '',
    email: '',
    phone: '',
    address: '',
    upperAligners: 24,
    lowerAligners: 20,
    daysPerAligner: 14,
    arch: 'both' as ArchType,
    currentUpperAligner: 1,
    currentLowerAligner: 1,
    startDate: new Date().toISOString().split('T')[0],
    dentistId: '2',
    dentistName: 'Dr. João Santos',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addPatient({
      ...formData,
      upperAligners: Number(formData.upperAligners),
      lowerAligners: Number(formData.lowerAligners),
      daysPerAligner: Number(formData.daysPerAligner),
      currentUpperAligner: Number(formData.currentUpperAligner),
      currentLowerAligner: Number(formData.currentLowerAligner),
    });
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        fullName: '',
        cpf: '',
        birthDate: '',
        email: '',
        phone: '',
        address: '',
        upperAligners: 24,
        lowerAligners: 20,
        daysPerAligner: 14,
        arch: 'both',
        currentUpperAligner: 1,
        currentLowerAligner: 1,
        startDate: new Date().toISOString().split('T')[0],
        dentistId: '2',
        dentistName: 'Dr. João Santos',
        notes: '',
      });
      setActiveTab('patients');
    }, 2000);
  };

  const tabs = [
    { id: 'patients' as const, label: 'Pacientes', icon: Users },
    { id: 'register' as const, label: 'Cadastrar', icon: User },
    { id: 'production' as const, label: 'Produção', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <Smile className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">OrthoAlign</h1>
              <p className="text-xs text-muted-foreground">Admin: {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pb-8">
        {/* Patients List */}
        {activeTab === 'patients' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">Pacientes Cadastrados</h2>
              <Button variant="gradient" onClick={() => setActiveTab('register')}>
                <User className="w-4 h-4" />
                Novo Paciente
              </Button>
            </div>

            <div className="space-y-3">
              {patients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{patient.fullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Sup: {patient.currentUpperAligner}/{patient.upperAligners} • Inf: {patient.currentLowerAligner}/{patient.lowerAligners} • {patient.dentistName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-accent">
                        {Math.round(((patient.currentUpperAligner + patient.currentLowerAligner) / (patient.upperAligners + patient.lowerAligners)) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">progresso</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Patient Registration Form */}
        {activeTab === 'register' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 rounded-3xl"
          >
            {showSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-3xl bg-success/20 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-2">Paciente Cadastrado!</h2>
                <p className="text-muted-foreground">O cadastro foi realizado com sucesso.</p>
              </motion.div>
            ) : (
              <>
                <h2 className="text-xl font-display font-bold mb-6">Cadastrar Novo Paciente</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Dados Pessoais
                    </h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Nome do paciente"
                            className="pl-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="cpf"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleInputChange}
                            placeholder="000.000.000-00"
                            className="pl-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            className="pl-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="email@exemplo.com"
                            className="pl-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone/WhatsApp</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(00) 00000-0000"
                            className="pl-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Endereço</Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Rua, número, bairro, cidade - UF"
                            className="pl-12"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Treatment Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Dados do Tratamento
                    </h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="arch">Arcada</Label>
                        <select
                          id="arch"
                          name="arch"
                          value={formData.arch}
                          onChange={handleInputChange}
                          className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                        >
                          <option value="upper">Superior</option>
                          <option value="lower">Inferior</option>
                          <option value="both">Ambas</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daysPerAligner">Dias por Alinhador</Label>
                        <Input
                          id="daysPerAligner"
                          name="daysPerAligner"
                          type="number"
                          min="7"
                          max="30"
                          value={formData.daysPerAligner}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Upper Arch Fields */}
                    {(formData.arch === 'upper' || formData.arch === 'both') && (
                      <div className="p-4 bg-primary/5 rounded-xl space-y-4">
                        <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                          <ArrowUp className="w-4 h-4" /> Arcada Superior
                        </h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="upperAligners">Total de Alinhadores</Label>
                            <Input
                              id="upperAligners"
                              name="upperAligners"
                              type="number"
                              min="1"
                              max="100"
                              value={formData.upperAligners}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currentUpperAligner">Alinhador Inicial</Label>
                            <Input
                              id="currentUpperAligner"
                              name="currentUpperAligner"
                              type="number"
                              min="1"
                              value={formData.currentUpperAligner}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lower Arch Fields */}
                    {(formData.arch === 'lower' || formData.arch === 'both') && (
                      <div className="p-4 bg-accent/5 rounded-xl space-y-4">
                        <h4 className="text-sm font-semibold text-accent flex items-center gap-2">
                          <ArrowDown className="w-4 h-4" /> Arcada Inferior
                        </h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="lowerAligners">Total de Alinhadores</Label>
                            <Input
                              id="lowerAligners"
                              name="lowerAligners"
                              type="number"
                              min="1"
                              max="100"
                              value={formData.lowerAligners}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currentLowerAligner">Alinhador Inicial</Label>
                            <Input
                              id="currentLowerAligner"
                              name="currentLowerAligner"
                              type="number"
                              min="1"
                              value={formData.currentLowerAligner}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">

                      <div className="space-y-2">
                        <Label htmlFor="startDate">Data de Início</Label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="pl-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dentistName">Dentista Responsável</Label>
                        <div className="relative">
                          <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="dentistName"
                            name="dentistName"
                            value={formData.dentistName}
                            onChange={handleInputChange}
                            placeholder="Dr. Nome do dentista"
                            className="pl-12"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Observações sobre o paciente..."
                          className="flex min-h-24 w-full rounded-xl border-2 border-input bg-background px-4 py-3 pl-12 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setActiveTab('patients')}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Cadastrar Paciente
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}

        {/* Production Control (Placeholder) */}
        {activeTab === 'production' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Layers className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold mb-2">Controle de Produção</h2>
            <p className="text-muted-foreground mb-6">
              Sistema Kanban para gerenciamento do fluxo de produção de alinhadores.
            </p>
            <Button variant="secondary">Em desenvolvimento</Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
