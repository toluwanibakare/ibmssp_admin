import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, Users, User, Tag, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { timeAgo } from '@/lib/utils-ui';

type RecipientMode = 'single' | 'category';

export default function EmailComposer() {
  const { members, logs, sendEmail } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preEmail = searchParams.get('email') || '';
  const preName = searchParams.get('name') || '';

  const [mode, setMode] = useState<RecipientMode>(preEmail ? 'single' : 'single');
  const [recipientTo, setRecipientTo] = useState(preEmail);
  const [recipientName, setRecipientName] = useState(preName);
  const [selectedCategory, setSelectedCategory] = useState('student');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'single' && !recipientTo.trim()) e.recipient = 'Please enter a recipient email';
    if (!subject.trim()) e.subject = 'Subject is required';
    if (!body.trim()) e.body = 'Message body is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      if (mode === 'single') {
        await sendEmail({ to: recipientTo, subject, text: body, html: `<p>${body.replace(/\n/g, '<br>')}</p>` });
      } else {
        const catMembers = members.filter(m => m.category === selectedCategory);
        for (const m of catMembers) {
          await sendEmail({ to: m.email, subject, text: body, html: `<p>${body.replace(/\n/g, '<br>')}</p>` });
        }
      }
      setSent(true);
      setTimeout(() => { setSent(false); setSubject(''); setBody(''); setRecipientTo(''); setRecipientName(''); }, 3000);
    } finally {
      setSending(false);
    }
  };

  const emailLogs = logs.filter(l => l.action === 'EMAIL_SENT').slice(0, 20);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Email Composer</h1>
          <p className="page-subtitle">Send messages to IBMSSP members</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-4">
          {sent && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/30 text-success text-sm font-medium">
              <Send size={14} /> Email sent successfully!
            </div>
          )}

          <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-4">
            {/* Mode */}
            <div>
              <label className="text-xs font-medium mb-2 block">Send to</label>
              <div className="flex gap-2">
                {(['single', 'category'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${mode === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent/50'}`}>
                    {m === 'single' ? <User size={12} /> : <Tag size={12} />}
                    {m === 'single' ? 'Single member' : 'Entire category'}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient */}
            {mode === 'single' ? (
              <div className="space-y-2">
                <label className="text-xs font-medium">Recipient Email</label>
                <input
                  type="email"
                  value={recipientTo}
                  onChange={e => setRecipientTo(e.target.value)}
                  placeholder="member@example.com"
                  className={`input-field ${errors.recipient ? 'border-destructive' : ''}`}
                />
                {errors.recipient && <p className="text-xs text-destructive">{errors.recipient}</p>}
                <label className="text-xs font-medium">Or select a member</label>
                <select
                  value={recipientTo}
                  onChange={e => {
                    const m = members.find(m => m.email === e.target.value);
                    setRecipientTo(e.target.value);
                    if (m) setRecipientName(`${m.first_name} ${m.last_name}`);
                  }}
                  className="input-field"
                >
                  <option value="">— Pick from list —</option>
                  {members.map(m => (
                    <option key={m.member_id} value={m.email}>{m.public_id} – {m.first_name} {m.last_name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Category</label>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-field">
                  <option value="student">Students ({members.filter(m => m.category === 'student').length})</option>
                  <option value="graduate">Graduates ({members.filter(m => m.category === 'graduate').length})</option>
                  <option value="individual">Individuals ({members.filter(m => m.category === 'individual').length})</option>
                  <option value="organization">Organizations ({members.filter(m => m.category === 'organization').length})</option>
                </select>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject…" className={`input-field ${errors.subject ? 'border-destructive' : ''}`} />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} placeholder="Write your message here…" className={`input-field resize-none text-sm leading-relaxed ${errors.body ? 'border-destructive' : ''}`} />
              {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
            </div>

            <button onClick={handleSend} disabled={sending || sent} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {sending ? 'Sending…' : sent ? 'Sent!' : <><Send size={14} /> Send Email</>}
            </button>
          </div>
        </div>

        {/* Email Log Sidebar */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold">Email Activity</h3>
          </div>
          <div className="divide-y divide-border overflow-y-auto max-h-[500px]">
            {emailLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground px-4 py-6">No emails sent yet.</p>
            ) : emailLogs.map(log => (
              <div key={log.id} className="px-4 py-3">
                <p className="text-xs font-medium truncate">{log.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(log.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
