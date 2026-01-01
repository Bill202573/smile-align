export type UserRole = 'patient' | 'dentist' | 'admin' | 'refiner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  // Alinhadores por arcada (separados)
  upperAligners: number; // Total de alinhadores superiores
  lowerAligners: number; // Total de alinhadores inferiores
  currentUpperAligner: number; // Alinhador superior atual
  currentLowerAligner: number; // Alinhador inferior atual
  daysPerAligner: number;
  arch: 'upper' | 'lower' | 'both';
  startDate: string;
  dentistId: string;
  dentistName: string;
  notes: string;
  createdAt: string;
}

export interface AlignerChange {
  id: string;
  patientId: string;
  alignerNumber: number;
  arch: 'upper' | 'lower'; // Qual arcada foi trocada
  changedAt: string;
  photoUrl?: string;
  notes?: string;
}

export interface Photo {
  id: string;
  patientId: string;
  url: string;
  type: 'before' | 'during' | 'progress';
  alignerNumber: number;
  arch?: 'upper' | 'lower' | 'both';
  uploadedAt: string;
  notes?: string;
}

export interface ProductionItem {
  id: string;
  patientId: string;
  patientName: string;
  upperAlignerCount: number;
  lowerAlignerCount: number;
  status: 'files_received' | 'preparing_3d' | 'printing' | 'printed' | 'ready_for_refining';
  entryDate: string;
  responsible: string;
  updatedAt: string;
}

export interface RefiningItem {
  id: string;
  patientId: string;
  patientName: string;
  upperAlignerCount: number;
  lowerAlignerCount: number;
  status: 'received' | 'refining' | 'completed' | 'returned';
  receivedAt: string;
  completedAt?: string;
  returnedAt?: string;
  value: number;
}
