import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RefreshCw } from 'lucide-react';

interface RefiningFormSectionProps {
  refiningActive: boolean;
  refiningUpperAligners: number;
  refiningLowerAligners: number;
  onRefiningActiveChange: (active: boolean) => void;
  onRefiningUpperChange: (value: number) => void;
  onRefiningLowerChange: (value: number) => void;
  disabled?: boolean;
}

export function RefiningFormSection({
  refiningActive,
  refiningUpperAligners,
  refiningLowerAligners,
  onRefiningActiveChange,
  onRefiningUpperChange,
  onRefiningLowerChange,
  disabled = false,
}: RefiningFormSectionProps) {
  return (
    <div className="space-y-4 p-4 rounded-xl border-2 border-accent/30 bg-accent/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-accent" />
          <Label className="text-base font-semibold">Refino</Label>
        </div>
        <Switch
          checked={refiningActive}
          onCheckedChange={onRefiningActiveChange}
          disabled={disabled}
        />
      </div>

      {refiningActive && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <Label className="text-sm text-muted-foreground">Superior (qtd)</Label>
            <Input
              type="number"
              min={0}
              value={refiningUpperAligners}
              onChange={(e) => onRefiningUpperChange(parseInt(e.target.value) || 0)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Inferior (qtd)</Label>
            <Input
              type="number"
              min={0}
              value={refiningLowerAligners}
              onChange={(e) => onRefiningLowerChange(parseInt(e.target.value) || 0)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
