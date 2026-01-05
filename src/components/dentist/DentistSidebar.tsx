import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  LayoutDashboard, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import logo from '@/assets/logo.png';

export type DentistTabType = 'dashboard' | 'patients' | 'communications';

interface DentistSidebarProps {
  activeTab: DentistTabType;
  onTabChange: (tab: DentistTabType) => void;
  isOpen: boolean;
  onToggle: () => void;
  userName?: string;
  onLogout: () => void;
}

const menuItems: { id: DentistTabType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Pacientes', icon: Users },
  { id: 'communications', label: 'Comunicados', icon: MessageSquare },
];

export function DentistSidebar({ 
  activeTab, 
  onTabChange, 
  isOpen, 
  onToggle, 
  userName,
  onLogout 
}: DentistSidebarProps) {
  return (
    <>
      {/* Toggle button when sidebar is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={onToggle}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-foreground p-2 rounded-r-xl shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-card border-r border-border z-50 flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="StelleAlign" className="w-10 h-10 object-contain" />
                  <div>
                    <h1 className="font-semibold text-foreground">StelleAlign</h1>
                    <p className="text-xs text-muted-foreground">{userName || 'Dentista'}</p>
                  </div>
                </div>
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
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
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-border">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
