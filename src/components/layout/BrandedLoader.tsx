import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function BrandedLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-xs text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary mx-auto flex items-center justify-center shadow-lg">
          <ShieldCheck size={26} className="text-primary-foreground" />
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">IBMSSP ADMIN</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
