import React from 'react';
import { UserPlus, UserCheck, Mail, LogIn, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDateTime } from '@/lib/utils-ui';
import { useAuth } from '@/contexts/AuthContext';

function ActionIcon({ action }: { action: string }) {
  const map: Record<string, { icon: React.ElementType; color: string }> = {
    REGISTRATION: { icon: UserPlus, color: 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]' },
    APPROVAL: { icon: UserCheck, color: 'bg-success/10 text-success' },
    EMAIL_SENT: { icon: Mail, color: 'bg-primary/10 text-primary' },
    LOGIN: { icon: LogIn, color: 'bg-muted text-muted-foreground' },
  };
  const cfg = map[action] || { icon: LogIn, color: 'bg-muted text-muted-foreground' };
  const Icon = cfg.icon;
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
      <Icon size={14} />
    </div>
  );
}

export default function ActivityLogs() {
  const { logs, clearActivityLogs } = useData();
  const { user } = useAuth();
  const [isClearing, setIsClearing] = React.useState(false);
  const isAdmin = user?.role === 'admin';

  const handleClearLogs = async () => {
    const ok = window.confirm('Clear all activity logs? This cannot be undone.');
    if (!ok) return;

    setIsClearing(true);
    try {
      await clearActivityLogs();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Activity Logs</h1>
          <p className="page-subtitle">Chronological audit trail of all IBMSSP admin actions</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={handleClearLogs}
            disabled={isClearing || logs.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 disabled:opacity-60"
          >
            <Trash2 size={14} />
            {isClearing ? 'Clearing...' : 'Clear Logs'}
          </button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No activity logged yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-accent/20 transition-colors">
                <ActionIcon action={log.action} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.description}</p>
                  <span className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize whitespace-nowrap ${
                  log.action === 'REGISTRATION' ? 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]' :
                  log.action === 'APPROVAL' ? 'bg-success/10 text-success' :
                  log.action === 'EMAIL_SENT' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>{log.action}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
