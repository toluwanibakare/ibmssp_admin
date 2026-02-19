import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
}

export function DeleteConfirmModal({ open, name, onConfirm, onCancel, message }: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card rounded-2xl border border-border shadow-modal w-full max-w-sm p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-destructive" />
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
        <h3 className="text-base font-semibold mb-1">Delete {name}?</h3>
        <p className="text-sm text-muted-foreground mb-5">
          {message || `This will permanently delete "${name}" and all associated data. This action cannot be undone.`}
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent/50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
