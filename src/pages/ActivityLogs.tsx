import React from 'react';
import { UserPlus, UserMinus, UserCheck, Mail, LogIn, Tag } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDateTime, timeAgo } from '@/lib/utils-ui';
import { ActivityLog } from '@/lib/mock-data';

function ActionIcon({ action }: { action: ActivityLog['action'] }) {
  const map = {
    user_created: { icon: UserPlus, color: 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]' },
    user_updated: { icon: UserCheck, color: 'bg-[hsl(var(--badge-std-bg))] text-[hsl(var(--badge-std))]' },
    user_deleted: { icon: UserMinus, color: 'bg-destructive/10 text-destructive' },
    email_sent: { icon: Mail, color: 'bg-primary/10 text-primary' },
    login: { icon: LogIn, color: 'bg-muted text-muted-foreground' },
    category_created: { icon: Tag, color: 'bg-[hsl(var(--badge-ind-bg))] text-[hsl(var(--badge-ind))]' },
  };
  const { icon: Icon, color } = map[action];
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={14} />
    </div>
  );
}

export default function ActivityLogs() {
  const { logs } = useData();

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Logs</h1>
          <p className="page-subtitle">Chronological audit trail of all admin actions</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No activity logged yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log, idx) => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-accent/20 transition-colors">
                <ActionIcon action={log.action} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.description}</p>
                  {log.publicId && (
                    <p className="text-xs font-mono text-primary mt-0.5">{log.publicId}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{log.performedBy}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground" title={formatDateTime(log.timestamp)}>
                      {timeAgo(log.timestamp)}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize whitespace-nowrap ${
                  log.action === 'user_created' ? 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]' :
                  log.action === 'user_deleted' ? 'bg-destructive/10 text-destructive' :
                  log.action === 'email_sent' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {log.action.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
