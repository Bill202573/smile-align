import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, AlignerChange, Photo } from '@/types';

interface PatientContextType {
  patients: Patient[];
  alignerChanges: AlignerChange[];
  photos: Photo[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  confirmAlignerChange: (patientId: string, photoUrl?: string, notes?: string) => void;
  addPhoto: (photo: Omit<Photo, 'id' | 'uploadedAt'>) => void;
  getPatientById: (id: string) => Patient | undefined;
  getPatientChanges: (patientId: string) => AlignerChange[];
  getPatientPhotos: (patientId: string) => Photo[];
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Demo patient data
const demoPatient: Patient = {
  id: '1',
  fullName: 'Maria Silva',
  cpf: '123.456.789-00',
  birthDate: '1990-05-15',
  email: 'maria@email.com',
  phone: '(11) 99999-9999',
  address: 'Rua das Flores, 123 - São Paulo, SP',
  totalAligners: 24,
  daysPerAligner: 14,
  arch: 'both',
  currentAligner: 12,
  startDate: '2024-06-01',
  dentistId: '2',
  dentistName: 'Dr. João Santos',
  notes: 'Paciente muito colaborativa',
  createdAt: '2024-05-20',
};

const demoChanges: AlignerChange[] = [
  { id: '1', patientId: '1', alignerNumber: 11, changedAt: '2024-11-15T10:00:00Z' },
  { id: '2', patientId: '1', alignerNumber: 12, changedAt: '2024-11-29T14:30:00Z' },
];

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('ortho-patients');
    return saved ? JSON.parse(saved) : [demoPatient];
  });

  const [alignerChanges, setAlignerChanges] = useState<AlignerChange[]>(() => {
    const saved = localStorage.getItem('ortho-changes');
    return saved ? JSON.parse(saved) : demoChanges;
  });

  const [photos, setPhotos] = useState<Photo[]>(() => {
    const saved = localStorage.getItem('ortho-photos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ortho-patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('ortho-changes', JSON.stringify(alignerChanges));
  }, [alignerChanges]);

  useEffect(() => {
    localStorage.setItem('ortho-photos', JSON.stringify(photos));
  }, [photos]);

  const addPatient = (patient: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patient,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const confirmAlignerChange = (patientId: string, photoUrl?: string, notes?: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient || patient.currentAligner >= patient.totalAligners) return;

    const newChange: AlignerChange = {
      id: Date.now().toString(),
      patientId,
      alignerNumber: patient.currentAligner + 1,
      changedAt: new Date().toISOString(),
      photoUrl,
      notes,
    };

    setAlignerChanges(prev => [...prev, newChange]);
    updatePatient(patientId, { currentAligner: patient.currentAligner + 1 });
  };

  const addPhoto = (photo: Omit<Photo, 'id' | 'uploadedAt'>) => {
    const newPhoto: Photo = {
      ...photo,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
    };
    setPhotos(prev => [...prev, newPhoto]);
  };

  const getPatientById = (id: string) => patients.find(p => p.id === id);

  const getPatientChanges = (patientId: string) =>
    alignerChanges.filter(c => c.patientId === patientId).sort((a, b) => 
      new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );

  const getPatientPhotos = (patientId: string) =>
    photos.filter(p => p.patientId === patientId).sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

  return (
    <PatientContext.Provider
      value={{
        patients,
        alignerChanges,
        photos,
        addPatient,
        updatePatient,
        confirmAlignerChange,
        addPhoto,
        getPatientById,
        getPatientChanges,
        getPatientPhotos,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
}
