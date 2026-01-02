import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  User, 
  Stethoscope, 
  Shield, 
  Sparkles,
  ChevronLeft,
  UserPlus,
  Smile
} from 'lucide-react';
import logo from '@/assets/logo.png';

const roleConfig: Record<UserRole, { icon: React.ElementType; label: string; description: string; color: string }> = {
  patient: { 
    icon: User, 
    label: 'Paciente', 
    description: 'Acompanhe seu tratamento',
    color: 'from-blue-500 to-cyan-400'
  },
  dentist: { 
    icon: Stethoscope, 
    label: 'Dentista', 
    description: 'Gerencie seus pacientes',
    color: 'from-teal-500 to-emerald-400'
  },
  admin: { 
    icon: Shield, 
    label: 'Administrador', 
    description: 'Controle da clínica',
    color: 'from-violet-500 to-purple-400'
  },
  refiner: { 
    icon: Sparkles, 
    label: 'Refinador', 
    description: 'Gestão de refino',
    color: 'from-amber-500 to-orange-400'
  },
};

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.success) {
          // Navigation will be handled by App.tsx based on user role
        } else {
          setError(result.error || 'Erro ao fazer login.');
        }
      } else {
        if (!selectedRole) {
          setError('Selecione um perfil.');
          setIsLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          setIsLoading(false);
          return;
        }
        
        const result = await signup(email, password, fullName, selectedRole);
        if (result.success) {
          setSuccess('Conta criada com sucesso! Você já pode fazer login.');
          setMode('login');
          setStep('form');
          setPassword('');
        } else {
          setError(result.error || 'Erro ao criar conta.');
        }
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (mode === 'signup' && step === 'form') {
      setStep('role');
    } else {
      setMode('login');
      setStep('form');
      setSelectedRole(null);
    }
    setError('');
    setSuccess('');
  };

  const switchToSignup = () => {
    setMode('signup');
    setStep('role');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <img src={logo} alt="StelleAlign" className="w-20 h-20 mb-6" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            StelleAlign
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestão de Alinhadores Invisíveis
          </p>
        </motion.div>

        {/* Signup - Role Selection */}
        {mode === 'signup' && step === 'role' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md space-y-4"
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            
            <h2 className="text-xl font-semibold text-center mb-6">
              Selecione seu perfil para cadastro
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(roleConfig) as UserRole[]).map((role, index) => {
                const config = roleConfig[role];
                const Icon = config.icon;
                return (
                  <motion.button
                    key={role}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    onClick={() => handleRoleSelect(role)}
                    className="glass-card p-6 rounded-2xl text-left hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{config.label}</h3>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Login or Signup Form */}
        {(mode === 'login' || (mode === 'signup' && step === 'form')) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {mode === 'signup' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>
            )}

            <div className="glass-card p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-8">
                {mode === 'signup' && selectedRole ? (
                  <>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${roleConfig[selectedRole].color} flex items-center justify-center`}>
                      {React.createElement(roleConfig[selectedRole].icon, { className: "w-7 h-7 text-white" })}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Cadastro - {roleConfig[selectedRole].label}</h2>
                      <p className="text-sm text-muted-foreground">{roleConfig[selectedRole].description}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center">
                      <Smile className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Entrar</h2>
                      <p className="text-sm text-muted-foreground">Acesse sua conta</p>
                    </div>
                  </>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-12"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12"
                      required
                      minLength={6}
                    />
                  </div>
                  {mode === 'signup' && (
                    <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
                  )}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-destructive text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}

                {success && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-600 text-sm text-center"
                  >
                    {success}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Entrar' : 'Criar conta'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {mode === 'login' && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{' '}
                    <button
                      onClick={switchToSignup}
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Cadastre-se
                    </button>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 StelleAlign. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
