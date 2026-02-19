import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, Users, User, Tag, Mail, Clock, Eye } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Category } from '@/lib/mock-data';
import { timeAgo } from '@/lib/utils-ui';

type RecipientMode = 'single' | 'multiple' | 'category';

export default function EmailComposer() {
  const { users, emails, sendEmail } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('to');

  const [mode, setMode] = useState<RecipientMode>('single');
  const [selectedUserId, setSelectedUserId] = useState<string>(preselectedId || '');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Student');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<typeof emails[0] | null>(null);

  const selectedUser = users.find(u => u.id === Number(selectedUserId));
  const categoryUsers = users.filter(u => u.category === selectedCategory);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'single' && !selectedUserId) e.recipient = 'Please select a recipient';
    if (mode === 'multiple' && selectedUserIds.length === 0) e.recipient = 'Please select at least one recipient';
    if (!subject.trim()) e.subject = 'Subject is required';
    if (!body.trim()) e.body = 'Message body is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));

    if (mode === 'single' && selectedUser) {
      sendEmail({ recipientId: selectedUser.id, recipientName: selectedUser.fullName, recipientEmail: selectedUser.email, subject, body, status: 'sent' });
    } else if (mode === 'multiple') {
      const names = users.filter(u => selectedUserIds.includes(u.id)).map(u => u.fullName).join(', ');
      sendEmail({ recipientId: null, recipientName: `Multiple (${selectedUserIds.length})`, recipientEmail: 'multiple', subject, body, status: 'sent' });
    } else {
      sendEmail({ recipientId: null, recipientName: `All ${selectedCategory}s (${categoryUsers.length})`, recipientEmail: 'category', subject, body, status: 'sent' });
    }

    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setSubject(''); setBody(''); }, 2500);
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Email Composer</h1>
          <p className="page-subtitle">Send messages to registry users</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-4">
          {sent && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[hsl(var(--badge-org-bg))] border border-[hsl(var(--badge-org)/0.3)] text-[hsl(var(--badge-org))] text-sm font-medium">
              <Send size={14} /> Email sent successfully!
            </div>
          )}

          <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-4">
            {/* Recipient Mode */}
            <div>
              <label className="text-xs font-medium mb-2 block">Send to</label>
              <div className="flex gap-2">
                {(['single', 'multiple', 'category'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${mode === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent/50'}`}>
                    {m === 'single' ? <User size={12} /> : m === 'multiple' ? <Users size={12} /> : <Tag size={12} />}
                    {m === 'single' ? 'Single user' : m === 'multiple' ? 'Multiple users' : 'Entire category'}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Selector */}
            <div>
              {mode === 'single' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Recipient</label>
                  <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className={`input-field ${errors.recipient ? 'border-destructive' : ''}`}>
                    <option value="">— Select a user —</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.publicId} – {u.fullName}</option>)}
                  </select>
                  {errors.recipient && <p className="text-xs text-destructive">{errors.recipient}</p>}
                </div>
              )}
              {mode === 'multiple' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Recipients ({selectedUserIds.length} selected)</label>
                  <div className="max-h-40 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-2 px-3 py-2 hover:bg-accent/30 cursor-pointer">
                        <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={e => setSelectedUserIds(prev => e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id))} className="rounded accent-primary" />
                        <span className="text-xs font-mono text-primary">{u.publicId}</span>
                        <span className="text-sm">{u.fullName}</span>
                      </label>
                    ))}
                  </div>
                  {errors.recipient && <p className="text-xs text-destructive">{errors.recipient}</p>}
                </div>
              )}
              {mode === 'category' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Category</label>
                  <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value as Category)} className="input-field">
                    {(['Student', 'Organization', 'Graduate', 'Trained Auditor', 'Consultant'] as Category[]).map(c => (
                      <option key={c} value={c}>{c} ({users.filter(u => u.category === c).length} users)</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject…" className={`input-field ${errors.subject ? 'border-destructive' : ''}`} />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} placeholder="Write your message here…" className={`input-field resize-none font-mono text-xs leading-relaxed ${errors.body ? 'border-destructive' : ''}`} />
              {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
            </div>

            <button onClick={handleSend} disabled={sending || sent} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {sending ? 'Sending…' : sent ? 'Sent!' : <><Send size={14} /> Send Email</>}
            </button>
          </div>
        </div>

        {/* Email History */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold">Sent History</h3>
          </div>
          <div className="divide-y divide-border overflow-y-auto max-h-[500px]">
            {emails.map(e => (
              <button key={e.id} onClick={() => setPreviewEmail(previewEmail?.id === e.id ? null : e)} className="w-full text-left px-4 py-3 hover:bg-accent/30 transition-colors">
                <p className="text-xs font-medium truncate">{e.subject}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{e.recipientName}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground">{timeAgo(e.sentAt)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${e.status === 'sent' ? 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]' : 'bg-destructive/10 text-destructive'}`}>
                    {e.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setPreviewEmail(null)} />
          <div className="relative bg-card rounded-2xl border border-border shadow-modal w-full max-w-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Email Preview</h3>
              <button onClick={() => setPreviewEmail(null)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="space-y-2 text-sm mb-4 pb-4 border-b border-border">
              <div className="flex gap-2"><span className="text-muted-foreground w-16 shrink-0">To:</span><span>{previewEmail.recipientName}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-16 shrink-0">Subject:</span><span className="font-medium">{previewEmail.subject}</span></div>
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: previewEmail.body }} />
          </div>
        </div>
      )}
    </div>
  );
}
