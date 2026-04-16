import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, User, Tag, Clock, Linkedin, MessageCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { timeAgo } from '@/lib/utils-ui';
import { useAuth } from '@/contexts/AuthContext';
import type { Member } from '@/contexts/DataContext';
import ibmsspLogo from '@/assets/ibmssp-logo.png';

type RecipientMode = 'single' | 'category';
type ComposerField = 'subject' | 'body';
const DRAFT_STORAGE_KEY = 'ibmssp_email_draft';

const MERGE_FIELDS = [
  { label: 'User ID', token: '{{user_id}}' },
  { label: 'Member ID', token: '{{member_id}}' },
  { label: 'Name', token: '{{name}}' },
  { label: 'Email', token: '{{email}}' },
  { label: 'Phone', token: '{{phone}}' },
  { label: 'Category', token: '{{category}}' },
  { label: 'All Details', token: '{{all_details}}' },
] as const;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildFullName(member?: Member | null, fallbackName = '') {
  if (!member) return fallbackName;
  return `${member.first_name || ''} ${member.last_name || ''}`.trim();
}

function buildAllDetails(member?: Member | null, fallback?: { name?: string; email?: string }) {
  const fullName = buildFullName(member, fallback?.name || '');
  return [
    `Name: ${fullName || 'N/A'}`,
    `Email: ${member?.email || fallback?.email || 'N/A'}`,
    `Phone: ${member?.phone || 'N/A'}`,
    `User ID: ${member?.public_id || 'N/A'}`,
    `Member ID: ${member?.member_id ?? 'N/A'}`,
    `Category: ${member?.category || 'N/A'}`,
  ].join('\n');
}

function applyMergeFields(template: string, member?: Member | null, fallback?: { name?: string; email?: string }) {
  const fullName = buildFullName(member, fallback?.name || '');
  const replacements: Record<string, string> = {
    '{{user_id}}': member?.public_id || '',
    '{{public_id}}': member?.public_id || '',
    '{{member_id}}': member?.member_id != null ? String(member.member_id) : '',
    '{{name}}': fullName || '',
    '{{full_name}}': fullName || '',
    '{{first_name}}': member?.first_name || '',
    '{{last_name}}': member?.last_name || '',
    '{{email}}': member?.email || fallback?.email || '',
    '{{phone}}': member?.phone || '',
    '{{category}}': member?.category || '',
    '{{all_details}}': buildAllDetails(member, fallback),
  };

  return Object.entries(replacements).reduce(
    (result, [token, value]) => result.split(token).join(value),
    template
  );
}

export default function EmailComposer() {
  const { members, emails, templates, sendEmail, createTemplate } = useData();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preEmail = searchParams.get('email') || '';
  const preName = searchParams.get('name') || '';

  const [mode, setMode] = useState<RecipientMode>('single');
  const [recipientTo, setRecipientTo] = useState(preEmail);
  const [recipientName, setRecipientName] = useState(preName);
  const [selectedCategory, setSelectedCategory] = useState('student');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateError, setTemplateError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeField, setActiveField] = useState<ComposerField>('body');

  const subjectRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return;

    try {
      const draft = JSON.parse(raw) as { to?: string; name?: string; subject?: string; body?: string };
      setMode('single');
      setRecipientTo(draft.to || '');
      setRecipientName(draft.name || '');
      setSubject(draft.subject || '');
      setBody(draft.body || '');
    } catch (error) {
      console.error('Invalid saved email draft:', error);
    } finally {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  const selectedMember = useMemo(
    () => members.find((m) => m.email === recipientTo) || null,
    [members, recipientTo]
  );

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
    setSendError('');
    try {
      if (mode === 'single') {
        const mergedSubject = applyMergeFields(subject, selectedMember, { name: recipientName, email: recipientTo });
        const mergedBody = applyMergeFields(body, selectedMember, { name: recipientName, email: recipientTo });

        await sendEmail({
          to: recipientTo,
          recipientName: recipientName || recipientTo,
          subject: mergedSubject,
          text: mergedBody,
          html: `<p>${escapeHtml(mergedBody).replace(/\n/g, '<br>')}</p>`,
        });
      } else {
        const catMembers = members.filter((m) => m.category === selectedCategory);
        for (const m of catMembers) {
          const mergedSubject = applyMergeFields(subject, m);
          const mergedBody = applyMergeFields(body, m);
          await sendEmail({
            to: m.email,
            recipientName: `${m.first_name} ${m.last_name}`.trim(),
            subject: mergedSubject,
            text: mergedBody,
            html: `<p>${escapeHtml(mergedBody).replace(/\n/g, '<br>')}</p>`,
          });
        }
      }

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setSubject('');
        setBody('');
        setRecipientTo('');
        setRecipientName('');
      }, 3000);
    } catch (error: unknown) {
      setSendError(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    const t = templates.find((tpl) => String(tpl.id) === id);
    if (t) {
      setSubject(t.subject);
      setBody(t.body || '');
    }
  };

  const handleSaveTemplate = async () => {
    const name = templateName.trim();
    if (!name) {
      setTemplateError('Template name is required');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setTemplateError('Add a subject and message before saving');
      return;
    }
    setTemplateError('');
    try {
      await createTemplate({ name, subject: subject.trim(), body });
      setTemplateName('');
    } catch (error: any) {
      setTemplateError(error?.message || 'Failed to save template');
    }
  };

  const insertMergeToken = (token: string) => {
    const isSubject = activeField === 'subject';
    const target = isSubject ? subjectRef.current : bodyRef.current;
    const currentValue = isSubject ? subject : body;
    const setValue = isSubject ? setSubject : setBody;

    if (!target) {
      setValue((prev) => `${prev}${prev ? ' ' : ''}${token}`);
      return;
    }

    const start = target.selectionStart ?? currentValue.length;
    const end = target.selectionEnd ?? currentValue.length;
    const nextValue = `${currentValue.slice(0, start)}${token}${currentValue.slice(end)}`;
    setValue(nextValue);

    requestAnimationFrame(() => {
      target.focus();
      const nextPos = start + token.length;
      target.setSelectionRange(nextPos, nextPos);
    });
  };

  const previewMember = mode === 'single'
    ? selectedMember
    : members.find((m) => m.category === selectedCategory) || null;
  const previewSubject = applyMergeFields(subject || 'Hello {{name}}', previewMember, { name: recipientName, email: recipientTo });
  const previewBody = applyMergeFields(
    body || 'Hello {{name}},\nYour ID is {{user_id}} and phone is {{phone}}.\n\n{{all_details}}',
    previewMember,
    { name: recipientName, email: recipientTo }
  );
  const recentEmails = emails.slice(0, 20);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Email Composer</h1>
          <p className="page-subtitle">Send messages to IBMSSP members</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {sent && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/30 text-success text-sm font-medium">
              <Send size={14} /> Email sent successfully!
            </div>
          )}
          {sendError && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
              {sendError}
            </div>
          )}

          <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-4">
            <div>
              <label className="text-xs font-medium mb-2 block">Send to</label>
              <div className="flex flex-wrap gap-2">
                {(['single', 'category'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      mode === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent/50'
                    }`}
                  >
                    {m === 'single' ? <User size={12} /> : <Tag size={12} />}
                    {m === 'single' ? 'Single member' : 'Entire category'}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'single' ? (
              <div className="space-y-2">
                <label className="text-xs font-medium">Recipient Email</label>
                <input
                  type="email"
                  value={recipientTo}
                  onChange={(e) => setRecipientTo(e.target.value)}
                  placeholder="member@example.com"
                  className={`input-field ${errors.recipient ? 'border-destructive' : ''}`}
                />
                {errors.recipient && <p className="text-xs text-destructive">{errors.recipient}</p>}

                <label className="text-xs font-medium">Or select a member</label>
                <select
                  value={recipientTo}
                  onChange={(e) => {
                    const m = members.find((member) => member.email === e.target.value);
                    setRecipientTo(e.target.value);
                    if (m) setRecipientName(`${m.first_name} ${m.last_name}`.trim());
                  }}
                  className="input-field"
                >
                  <option value="">- Pick from list -</option>
                  {members.map((m) => (
                    <option key={m.member_id} value={m.email}>
                      {m.public_id} - {m.first_name} {m.last_name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Category</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field">
                  <option value="student">Students ({members.filter((m) => m.category === 'student').length})</option>
                  <option value="graduate">Graduates ({members.filter((m) => m.category === 'graduate').length})</option>
                  <option value="individual">Individuals ({members.filter((m) => m.category === 'individual').length})</option>
                  <option value="organization">Organizations ({members.filter((m) => m.category === 'organization').length})</option>
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Subject</label>
              <input
                ref={subjectRef}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onFocus={() => setActiveField('subject')}
                placeholder="Email subject..."
                className={`input-field ${errors.subject ? 'border-destructive' : ''}`}
              />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Message</label>
              <textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onFocus={() => setActiveField('body')}
                rows={8}
                placeholder="Write your message here..."
                className={`input-field resize-none text-sm leading-relaxed ${errors.body ? 'border-destructive' : ''}`}
              />
              {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold">Personalization Fields</p>
                  <p className="text-xs text-muted-foreground">
                    Insert member details into the message. Current target: <span className="font-medium text-foreground capitalize">{activeField}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card w-fit">
                  <button
                    type="button"
                    onClick={() => setActiveField('subject')}
                    className={`px-2 py-1 rounded text-xs ${activeField === 'subject' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'}`}
                  >
                    Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveField('body')}
                    className={`px-2 py-1 rounded text-xs ${activeField === 'body' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'}`}
                  >
                    Message
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {MERGE_FIELDS.map((field) => (
                  <button
                    key={field.token}
                    type="button"
                    onClick={() => insertMergeToken(field.token)}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-medium hover:bg-accent/50 transition-colors"
                  >
                    {field.label}
                    <span className="ml-1 font-mono text-muted-foreground">{field.token}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 mt-2">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject Line Preview</p>
                  <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium shadow-sm break-words [overflow-wrap:anywhere] min-h-11 flex items-center">
                    {previewSubject || <span className="text-muted-foreground italic font-normal text-xs">No subject drafted yet...</span>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Branded Preview</p>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-medium">Desktop View</span>
                  </div>
                  
                  <div className="rounded-xl border border-border bg-[#f9fafb] p-4 sm:p-6 overflow-hidden">
                    <div className="max-w-[100%] mx-auto bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
                      {/* Simulated Header */}
                      <div className="py-4 px-4 text-center border-b-2 border-[#059669] bg-white">
                        <img src={ibmsspLogo} alt="IBMSSP" className="h-10 mx-auto object-contain" />
                      </div>
                      
                      {/* Body */}
                      <div className="p-6 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[150px]">
                        {previewBody || <span className="text-muted-foreground italic">Start typing your message to see the preview...</span>}
                      </div>

                      {/* Simulated Footer */}
                      <div className="p-6 bg-[#fcfcfc] border-t border-slate-100 text-center">
                        <div className="flex justify-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-[#0077b5]/10 flex items-center justify-center text-[#0077b5]">
                            <Linkedin size={16} />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-900/10 flex items-center justify-center text-slate-900">
                            <span className="font-bold text-[10px]">X</span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#25d366]/10 flex items-center justify-center text-[#25d366]">
                            <MessageCircle size={16} fill="currentColor" />
                          </div>
                        </div>
                        <div className="text-[10px] leading-relaxed text-slate-500">
                          <p className="font-bold text-slate-900">© {new Date().getFullYear()} Institute of Business Management Systems Standards Practitioners (IBMSSP).</p>
                          <p className="mt-1">Registered by the CAC in June 12th, 2025.</p>
                          <a href="#" className="text-[#059669] font-medium block mt-2 no-underline">www.ibmssp.org.ng</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={sending || sent}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {sending ? 'Sending...' : sent ? 'Sent!' : <><Send size={14} /> Send Email</>}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Tag size={14} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold">Saved Templates</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Pick a template</label>
                <select value={selectedTemplateId} onChange={(e) => handleTemplateSelect(e.target.value)} className="input-field">
                  <option value="">- Select template -</option>
                  {templates.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {user?.role === 'admin' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Save current as template</label>
                  <div className="flex gap-2">
                    <input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Template name..."
                      className="input-field"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTemplate}
                      className="px-3 rounded-lg border border-border text-xs font-medium hover:bg-accent/50 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                  {templateError && <p className="text-xs text-destructive">{templateError}</p>}
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xs font-medium mb-1">Available placeholders</p>
                <p className="text-xs text-muted-foreground break-words [overflow-wrap:anywhere]">
                  {MERGE_FIELDS.map((f) => f.token).join(', ')}
                </p>
              </div>

              {templates.length === 0 && (
                <p className="text-xs text-muted-foreground">No templates saved yet.</p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Clock size={14} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold">Recent Emails</h3>
            </div>
            <div className="divide-y divide-border overflow-y-auto max-h-[500px]">
              {recentEmails.length === 0 ? (
                <p className="text-sm text-muted-foreground px-4 py-6">No emails sent yet.</p>
              ) : recentEmails.map((e) => (
                <div key={e.id} className="px-4 py-3">
                  <p className="text-xs font-medium truncate">{e.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    To: {e.recipient_name} - {timeAgo(e.sent_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
