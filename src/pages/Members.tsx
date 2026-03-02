import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle, ChevronLeft, ChevronRight, Plus, X, RefreshCw, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryBadge, StatusBadge, formatDate } from '@/lib/utils-ui';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

const PAGE_SIZE = 15;

export default function Members() {
  const { members, stats, isLoading, fetchMembers, approveMember, createMember, deleteMember } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isAdmin = user?.role === 'admin';

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchMembers();
    } finally {
      setRefreshing(false);
    }
  };

  const initialForm = {
    category: 'student',
    first_name: '',
    last_name: '',
    other_name: '',
    gender: '',
    email: '',
    phone: '',
    country: 'Nigeria',
    institution_name: '',
    course_of_study: '',
    level: '',
    matric_number: '',
    expected_graduation_year: '',
    institution: '',
    qualification: '',
    graduation_year: '',
    study_duration: '',
    ny_sc_status: '',
    profession: '',
    specialization: '',
    years_of_experience: '',
    current_company: '',
    professional_certifications: '',
    license_number: '',
    organization_name: '',
    rc_number: '',
    organization_type: '',
    industry: '',
    iso_start_year: '',
    contact_person: '',
    contact_person_role: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    number_of_staff: '',
  };

  const [form, setForm] = useState(initialForm);

  const filtered = useMemo(() => {
    let res = [...members];
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(m =>
        m.public_id?.toLowerCase().includes(q) ||
        m.first_name?.toLowerCase().includes(q) ||
        m.last_name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone?.includes(q)
      );
    }
    if (category) res = res.filter(m => m.category === category);
    return res;
  }, [members, search, category]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleApprove = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setApprovingId(id);
    try { await approveMember(id); } finally { setApprovingId(null); }
  };

  const requestDelete = (id: number, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemberToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    setDeleting(true);
    try {
      await deleteMember(memberToDelete.id);
      setMemberToDelete(null);
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete member.';
      setError(msg);
      window.alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  const openAdd = () => {
    setError('');
    setForm(initialForm);
    setShowAdd(true);
  };

  const closeAdd = () => {
    if (isSaving) return;
    setShowAdd(false);
    setError('');
  };

  const validateForm = () => {
    const missingBase = ['first_name', 'last_name', 'email', 'phone', 'category']
      .filter((k) => !form[k as keyof typeof form]);

    if (missingBase.length > 0) return 'Please fill in all required basic fields.';

    if (form.category === 'student') {
      if (!form.institution_name || !form.course_of_study) return 'Student details are required.';
    } else if (form.category === 'graduate') {
      if (!form.institution || !form.qualification || !form.graduation_year) return 'Graduate details are required.';
    } else if (form.category === 'individual') {
      if (!form.profession) return 'Profession is required for individuals.';
    } else if (form.category === 'organization') {
      if (!form.organization_name || !form.company_email || !form.company_phone) return 'Organization name, email, and phone are required.';
    }

    return '';
  };

  const handleCreate = async () => {
    const msg = validateForm();
    if (msg) {
      setError(msg);
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await createMember(form);
      setShowAdd(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to add member.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-28">
      <div className="page-header flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Members Registry</h1>
          <p className="page-subtitle">{stats.total} total registered members</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent/50 transition-colors">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, ID, email…" className="input-field pl-8" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input-field pl-8 pr-8 appearance-none cursor-pointer">
            <option value="">All categories</option>
            <option value="student">Student</option>
            <option value="graduate">Graduate</option>
            <option value="individual">Individual</option>
            <option value="organization">Organization</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Loading members…</div>
        ) : paged.length === 0 ? (
          <div className="py-16 text-center"><p className="text-muted-foreground text-sm">No members found matching your filters.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Registration ID</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Category</th><th>Reg. Status</th><th>Payment</th><th>Registered</th><th>Actions</th></tr></thead>
              <tbody>
                {paged.map(m => (
                  <tr key={m.member_id}>
                    <td className="font-mono text-xs font-medium text-primary">{m.public_id || 'PENDING'}</td>
                    <td className="font-medium">{m.first_name} {m.last_name}</td>
                    <td className="text-muted-foreground text-xs">{m.email}</td>
                    <td className="text-muted-foreground text-xs">{m.phone}</td>
                    <td><CategoryBadge category={m.category} /></td>
                    <td><StatusBadge status={m.registration_status} /></td>
                    <td><span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${m.payment_status === 'paid' ? 'bg-success/10 text-success' : 'bg-yellow-500/10 text-yellow-600'}`}>{m.payment_status}</span></td>
                    <td className="text-xs text-muted-foreground">{formatDate(m.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/members/${m.member_id}`)} className="p-1.5 rounded hover:bg-accent transition-colors" title="View profile"><Eye size={13} className="text-muted-foreground" /></button>
                        {m.registration_status !== 'approved' && (
                          <button onClick={(e) => handleApprove(m.member_id, e)} disabled={approvingId === m.member_id} className="p-1.5 rounded hover:bg-success/10 transition-colors" title="Approve">
                            <CheckCircle size={13} className="text-success" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={(e) => requestDelete(m.member_id, `${m.first_name} ${m.last_name}`.trim(), e)}
                            className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                            title="Delete member"
                          >
                            <Trash2 size={13} className="text-destructive" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded hover:bg-accent disabled:opacity-40 transition-colors"><ChevronLeft size={14} /></button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs font-medium transition-colors ${p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>{p}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded hover:bg-accent disabled:opacity-40 transition-colors"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={openAdd}
        className="fixed bottom-20 left-4 right-4 sm:bottom-24 sm:left-auto sm:right-4 z-40 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold shadow-lg hover:bg-primary/90"
      >
        <Plus size={16} /> Add Member
      </button>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeAdd} />
          <div className="relative w-[min(92vw,720px)] max-h-[90vh] overflow-y-auto rounded-xl bg-card border border-border shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold">Add Member</h2>
                <p className="text-xs text-muted-foreground">Member ID is generated automatically after save.</p>
              </div>
              <button onClick={closeAdd} className="p-1.5 rounded hover:bg-accent">
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    <option value="student">Student</option>
                    <option value="graduate">Graduate</option>
                    <option value="individual">Individual</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Gender</label>
                  <input value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="input-field" placeholder="Male/Female" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">First Name *</label>
                  <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="input-field" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Last Name *</label>
                  <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="input-field" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Other Name</label>
                  <input value={form.other_name} onChange={e => setForm(f => ({ ...f, other_name: e.target.value }))} className="input-field" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Phone *</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Country</label>
                  <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="input-field" />
                </div>
              </div>

              {form.category === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium">Institution Name *</label>
                    <input value={form.institution_name} onChange={e => setForm(f => ({ ...f, institution_name: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium">Course of Study *</label>
                    <input value={form.course_of_study} onChange={e => setForm(f => ({ ...f, course_of_study: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Level</label>
                    <input value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Matric Number</label>
                    <input value={form.matric_number} onChange={e => setForm(f => ({ ...f, matric_number: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Expected Graduation Year</label>
                    <input value={form.expected_graduation_year} onChange={e => setForm(f => ({ ...f, expected_graduation_year: e.target.value }))} className="input-field" />
                  </div>
                </div>
              )}

              {form.category === 'graduate' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium">Institution *</label>
                    <input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Qualification *</label>
                    <input value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Graduation Year *</label>
                    <input value={form.graduation_year} onChange={e => setForm(f => ({ ...f, graduation_year: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Study Duration</label>
                    <input value={form.study_duration} onChange={e => setForm(f => ({ ...f, study_duration: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">NYSC Status</label>
                    <input value={form.ny_sc_status} onChange={e => setForm(f => ({ ...f, ny_sc_status: e.target.value }))} className="input-field" />
                  </div>
                </div>
              )}

              {form.category === 'individual' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium">Profession *</label>
                    <input value={form.profession} onChange={e => setForm(f => ({ ...f, profession: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Specialization</label>
                    <input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Years of Experience</label>
                    <input value={form.years_of_experience} onChange={e => setForm(f => ({ ...f, years_of_experience: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Current Company</label>
                    <input value={form.current_company} onChange={e => setForm(f => ({ ...f, current_company: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium">Professional Certifications</label>
                    <input value={form.professional_certifications} onChange={e => setForm(f => ({ ...f, professional_certifications: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">License Number</label>
                    <input value={form.license_number} onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))} className="input-field" />
                  </div>
                </div>
              )}

              {form.category === 'organization' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium">Organization Name *</label>
                    <input value={form.organization_name} onChange={e => setForm(f => ({ ...f, organization_name: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Company Email *</label>
                    <input type="email" value={form.company_email} onChange={e => setForm(f => ({ ...f, company_email: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Company Phone *</label>
                    <input value={form.company_phone} onChange={e => setForm(f => ({ ...f, company_phone: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">RC Number</label>
                    <input value={form.rc_number} onChange={e => setForm(f => ({ ...f, rc_number: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Organization Type</label>
                    <input value={form.organization_type} onChange={e => setForm(f => ({ ...f, organization_type: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Industry</label>
                    <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">ISO Start Year</label>
                    <input value={form.iso_start_year} onChange={e => setForm(f => ({ ...f, iso_start_year: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Contact Person</label>
                    <input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Contact Role</label>
                    <input value={form.contact_person_role} onChange={e => setForm(f => ({ ...f, contact_person_role: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium">Company Address</label>
                    <input value={form.company_address} onChange={e => setForm(f => ({ ...f, company_address: e.target.value }))} className="input-field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Number of Staff</label>
                    <input value={form.number_of_staff} onChange={e => setForm(f => ({ ...f, number_of_staff: e.target.value }))} className="input-field" />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={closeAdd}
                  className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium hover:bg-accent/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        open={!!memberToDelete}
        name={memberToDelete?.name || 'member'}
        onCancel={() => !deleting && setMemberToDelete(null)}
        onConfirm={confirmDelete}
        message="This will permanently delete this member and all associated records. This action cannot be undone."
      />
    </div>
  );
}
