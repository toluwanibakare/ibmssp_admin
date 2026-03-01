import React, { useState } from 'react';
import { Eye, RotateCcw, Trash2 } from 'lucide-react';
import { useData, SentEmail } from '@/contexts/DataContext';
import { formatDateTime, timeAgo } from '@/lib/utils-ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DRAFT_STORAGE_KEY = 'ibmssp_email_draft';

function htmlToText(content: string) {
  return content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

export default function Messages() {
  const { emails, clearEmailHistory } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<SentEmail | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const isAdmin = user?.role === 'admin';

  const handleReuse = (email: SentEmail) => {
    const draft = {
      to: email.recipient_email || '',
      name: email.recipient_name || '',
      subject: email.subject || '',
      body: htmlToText(email.body || ''),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    navigate('/email-composer');
  };

  const handleClearHistory = async () => {
    const ok = window.confirm('Clear all sent/failed email history? This cannot be undone.');
    if (!ok) return;

    setIsClearing(true);
    try {
      await clearEmailHistory();
      setPreview(null);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Message History</h1>
          <p className="page-subtitle">{emails.length} emails sent</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={handleClearHistory}
            disabled={isClearing || emails.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 disabled:opacity-60"
          >
            <Trash2 size={14} />
            {isClearing ? 'Clearing...' : 'Clear History'}
          </button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {emails.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No emails sent yet.</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Recipient</th><th>Email</th><th>Subject</th><th>Status</th><th>Sent</th><th>Actions</th></tr></thead>
            <tbody>
              {emails.map(e => (
                <tr key={e.id}>
                  <td className="font-medium">{e.recipient_name}</td>
                  <td className="text-xs text-muted-foreground">{e.recipient_email}</td>
                  <td className="max-w-xs truncate text-sm">{e.subject}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      e.status === 'sent' ? 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]' :
                      e.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                      'bg-[hsl(var(--badge-grd-bg))] text-[hsl(var(--badge-grd))]'
                    }`}>{e.status}</span>
                  </td>
                  <td className="text-xs text-muted-foreground">{formatDateTime(e.sent_at)}</td>
                  <td className="flex items-center gap-1">
                    <button onClick={() => setPreview(preview?.id === e.id ? null : e)} className="p-1.5 rounded hover:bg-accent transition-colors" title="Preview">
                      <Eye size={13} className="text-muted-foreground" />
                    </button>
                    <button onClick={() => handleReuse(e)} className="p-1.5 rounded hover:bg-accent transition-colors" title="Reuse in composer">
                      <RotateCcw size={13} className="text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setPreview(null)} />
          <div className="relative bg-card rounded-2xl border border-border shadow-modal w-full max-w-lg p-6 animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Message Preview</h3>
              <button onClick={() => setPreview(null)} className="text-xs text-muted-foreground hover:text-foreground">Close ×</button>
            </div>
            <div className="space-y-2 text-sm pb-4 border-b border-border">
              <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">To:</span><span>{preview.recipient_name}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">Email:</span><span className="text-muted-foreground">{preview.recipient_email}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">Subject:</span><span className="font-medium">{preview.subject}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">Sent:</span><span className="text-muted-foreground">{formatDateTime(preview.sent_at)}</span></div>
            </div>
            <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: preview.body || '' }} />
          </div>
        </div>
      )}
    </div>
  );
}
