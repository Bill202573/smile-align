import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  selectRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const demoUsers: Record<UserRole, User> = {
  patient: { id: '1', email: 'paciente@demo.com', name: 'Maria Silva', role: 'patient' },
  dentist: { id: '2', email: 'dentista@demo.com', name: 'Dr. João Santos', role: 'dentist' },
  admin: { id: '3', email: 'admin@demo.com', name: 'Ana Oliveira', role: 'admin' },
  refiner: { id: '4', email: 'refinador@demo.com', name: 'Carlos Pereira', role: 'refiner' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ortho-user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!user;

  useEffect(() => {
    if (user) {
      localStorage.setItem('ortho-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ortho-user');
    }
  }, [user]);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulated login - in production, this would call an API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (password.length >= 4) {
      const loggedUser = { ...demoUsers[role], email };
      setUser(loggedUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const selectRole = (role: UserRole) => {
    setUser(demoUsers[role]);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, selectRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
