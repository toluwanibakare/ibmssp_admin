import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDateTime, timeAgo } from '@/lib/utils-ui';

export default function Messages() {
  const { emails } = useData();
  const [preview, setPreview] = useState<typeof emails[0] | null>(null);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Message History</h1>
          <p className="page-subtitle">{emails.length} emails sent</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {emails.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No emails sent yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...emails].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()).map(e => (
                <tr key={e.id}>
                  <td className="font-medium">{e.recipientName}</td>
                  <td className="text-xs text-muted-foreground">{e.recipientEmail}</td>
                  <td className="max-w-xs truncate text-sm">{e.subject}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      e.status === 'sent' ? 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]' :
                      e.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                      'bg-[hsl(var(--badge-grd-bg))] text-[hsl(var(--badge-grd))]'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="text-xs text-muted-foreground">{formatDateTime(e.sentAt)}</td>
                  <td>
                    <button onClick={() => setPreview(preview?.id === e.id ? null : e)} className="p-1.5 rounded hover:bg-accent transition-colors">
                      <Eye size={13} className="text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setPreview(null)} />
          <div className="relative bg-card rounded-2xl border border-border shadow-modal w-full max-w-lg p-6 animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Message Preview</h3>
              <button onClick={() => setPreview(null)} className="text-xs text-muted-foreground hover:text-foreground">Close ×</button>
            </div>
            <div className="space-y-2 text-sm pb-4 border-b border-border">
              <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">To:</span><span>{preview.recipientName}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">Email:</span><span className="text-muted-foreground">{preview.recipientEmail}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">Subject:</span><span className="font-medium">{preview.subject}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">Sent:</span><span className="text-muted-foreground">{formatDateTime(preview.sentAt)}</span></div>
            </div>
            <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: preview.body }} />
          </div>
        </div>
      )}
    </div>
  );
}
