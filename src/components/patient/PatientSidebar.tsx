import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Activity, 
  History, 
  Camera, 
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.jpg';

type TabType = 'profile' | 'treatment' | 'history' | 'gallery';

interface PatientSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOpen: boolean;
  onToggle: () => void;
  patientName: string;
  avatarUrl?: string;
}

export function PatientSidebar({ 
  activeTab, 
  onTabChange, 
  isOpen, 
  onToggle,
  patientName,
  avatarUrl
}: PatientSidebarProps) {
  const menuItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'treatment', label: 'Tratamento', icon: Activity },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'gallery', label: 'Galeria de Fotos', icon: Camera },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 h-full w-[280px] bg-card border-r border-border z-50 flex flex-col ${
          isOpen ? 'shadow-xl' : ''
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <img src={logo} alt="Stelle Odontologia" className="h-12 object-contain" />
            <Button variant="ghost" size="icon-sm" onClick={onToggle} className="lg:hidden">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Patient Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={patientName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{patientName}</p>
              <p className="text-xs text-muted-foreground">Paciente</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </button>
        </div>
      </motion.aside>

      {/* Toggle button when closed */}
      {!isOpen && (
        <Button
          variant="secondary"
          size="icon"
          onClick={onToggle}
          className="fixed left-4 top-4 z-40 shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </>
  );
}
