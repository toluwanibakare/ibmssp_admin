import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Category } from '@/lib/mock-data';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  category: Category;
  notes: string;
}

interface Errors {
  fullName?: string;
  email?: string;
  phone?: string;
  category?: string;
}

const CATEGORIES: Category[] = ['Student', 'Organization', 'Graduate', 'Individual'];

export default function AddEditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { users, addUser, updateUser } = useData();
  const isEdit = !!id;
  const existing = isEdit ? users.find(u => u.id === Number(id)) : null;

  const [form, setForm] = useState<FormData>({
    fullName: existing?.fullName || '',
    email: existing?.email || '',
    phone: existing?.phone || '',
    category: existing?.category || 'Student',
    notes: existing?.notes || '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (isEdit && existing) {
      updateUser(existing.id, form);
    } else {
      const newUser = addUser(form);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate(`/users/${newUser.id}`), 1500);
      return;
    }
    setLoading(false);
    navigate(`/users/${existing!.id}`);
  };

  const field = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      if (errors[key as keyof Errors]) setErrors(er => ({ ...er, [key]: undefined }));
    },
  });

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <button onClick={() => navigate(isEdit && existing ? `/users/${existing.id}` : '/users')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="page-title">{isEdit ? 'Edit User' : 'Add New User'}</h1>
        <p className="page-subtitle">{isEdit ? `Editing ${existing?.publicId}` : 'Create a new registry entry'}</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[hsl(var(--badge-org-bg))] border border-[hsl(var(--badge-org)/0.3)] text-[hsl(var(--badge-org))]">
          <Check size={16} /> User created successfully! Redirecting…
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Full Name <span className="text-destructive">*</span></label>
          <input type="text" placeholder="e.g. Alice Johnson" className={`input-field ${errors.fullName ? 'border-destructive focus:ring-destructive/30' : ''}`} {...field('fullName')} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Email <span className="text-destructive">*</span></label>
            <input type="email" placeholder="email@example.com" className={`input-field ${errors.email ? 'border-destructive focus:ring-destructive/30' : ''}`} {...field('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Phone <span className="text-destructive">*</span></label>
            <input type="tel" placeholder="+1 555-0000" className={`input-field ${errors.phone ? 'border-destructive focus:ring-destructive/30' : ''}`} {...field('phone')} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">Category <span className="text-destructive">*</span></label>
          <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">Notes</label>
          <textarea rows={3} placeholder="Optional notes about this registrant…" className="input-field resize-none" {...field('notes')} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent/50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading || success} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}
