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
  totalAligners: number;
  daysPerAligner: number;
  arch: 'upper' | 'lower' | 'both';
  currentAligner: number;
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
  uploadedAt: string;
  notes?: string;
}

export interface ProductionItem {
  id: string;
  patientId: string;
  patientName: string;
  alignerCount: number;
  status: 'files_received' | 'preparing_3d' | 'printing' | 'printed' | 'ready_for_refining';
  entryDate: string;
  responsible: string;
  updatedAt: string;
}

export interface RefiningItem {
  id: string;
  patientId: string;
  patientName: string;
  alignerCount: number;
  status: 'received' | 'refining' | 'completed' | 'returned';
  receivedAt: string;
  completedAt?: string;
  returnedAt?: string;
  value: number;
}
