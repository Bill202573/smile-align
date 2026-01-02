import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PatientHeaderProps {
  fullName: string;
  avatarUrl?: string | null;
}

export function PatientHeader({ fullName, avatarUrl }: PatientHeaderProps) {
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar className="w-12 h-12 border-2 border-primary/20">
        <AvatarImage src={avatarUrl || undefined} alt={fullName} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="font-display font-bold text-lg text-foreground leading-tight">{fullName}</h1>
        <p className="text-sm text-muted-foreground">Meu Tratamento</p>
      </div>
    </div>
  );
}
