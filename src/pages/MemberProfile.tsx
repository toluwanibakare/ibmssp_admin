import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, Clock, FileText, Phone, Tag, MapPin, Pencil, Save, X, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryBadge, StatusBadge, formatDateTime, formatDate, timeAgo } from '@/lib/utils-ui';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-border last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function EditRow({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border last:border-b-0 gap-3">
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="input-field text-sm max-w-[60%] py-1 px-2 h-8" />
    </div>
  );
}

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { approveMember, logs, getMemberById, updateMember, deleteMember } = useData();
  const { user } = useAuth();
  const [member, setMember] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getMemberById(Number(id));
        setMember(data);
      } catch {
        setError('Failed to load member');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, getMemberById]);

  const memberLogs = logs.filter(l => l.member_id === Number(id));

  const handleApprove = async () => {
    if (!member) return;
    setApproving(true);
    try {
      await approveMember(member.member_id);
      setMember((prev: any) => prev ? { ...prev, registration_status: 'approved' } : null);
    } finally {
      setApproving(false);
    }
  };

  const startEdit = () => {
    setEditForm({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      other_name: member.other_name || '',
      gender: member.gender || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      state: member.state || '',
      country: member.country || '',
      date_of_birth: member.date_of_birth || '',
      registration_status: member.registration_status || 'pending',
      payment_status: member.payment_status || 'unpaid',
      // Category-specific
      ...(member.studentDetails ? {
        institution_name: member.studentDetails.institution_name || '',
        course_of_study: member.studentDetails.course_of_study || '',
        level: member.studentDetails.level || '',
        matric_number: member.studentDetails.matric_number || '',
        expected_graduation_year: member.studentDetails.expected_graduation_year?.toString() || '',
      } : {}),
      ...(member.graduateDetails ? {
        institution: member.graduateDetails.institution || '',
        qualification: member.graduateDetails.qualification || '',
        graduation_year: member.graduateDetails.graduation_year?.toString() || '',
        study_duration: member.graduateDetails.study_duration || '',
        ny_sc_status: member.graduateDetails.ny_sc_status || '',
      } : {}),
      ...(member.professionalDetails ? {
        profession: member.professionalDetails.profession || '',
        specialization: member.professionalDetails.specialization || '',
        years_of_experience: member.professionalDetails.years_of_experience?.toString() || '',
        current_company: member.professionalDetails.current_company || '',
        license_number: member.professionalDetails.license_number || '',
        professional_certifications: member.professionalDetails.professional_certifications || '',
      } : {}),
      ...(member.organizationDetails ? {
        organization_name: member.organizationDetails.organization_name || '',
        rc_number: member.organizationDetails.rc_number || '',
        organization_type: member.organizationDetails.organization_type || '',
        industry: member.organizationDetails.industry || '',
        iso_start_year: member.organizationDetails.iso_start_year || '',
        contact_person: member.organizationDetails.contact_person || '',
        contact_person_role: member.organizationDetails.contact_person_role || '',
        company_email: member.organizationDetails.company_email || '',
        company_phone: member.organizationDetails.company_phone || '',
        company_address: member.organizationDetails.company_address || '',
        number_of_staff: member.organizationDetails.number_of_staff?.toString() || '',
      } : {}),
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditForm({});
  };

  const ef = (key: string) => editForm[key] || '';
  const setEf = (key: string, val: string) => setEditForm((f: any) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        category: member.category,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        other_name: editForm.other_name,
        gender: editForm.gender,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        state: editForm.state,
        country: editForm.country,
        date_of_birth: editForm.date_of_birth || null,
        registration_status: editForm.registration_status,
        payment_status: editForm.payment_status,
      };

      if (member.category === 'student') {
        payload.studentDetails = {
          institution_name: editForm.institution_name,
          course_of_study: editForm.course_of_study,
          level: editForm.level || null,
          matric_number: editForm.matric_number || null,
          expected_graduation_year: editForm.expected_graduation_year ? Number(editForm.expected_graduation_year) : null,
        };
      } else if (member.category === 'graduate') {
        payload.graduateDetails = {
          institution: editForm.institution,
          qualification: editForm.qualification,
          graduation_year: editForm.graduation_year ? Number(editForm.graduation_year) : null,
          study_duration: editForm.study_duration || null,
          ny_sc_status: editForm.ny_sc_status || null,
        };
      } else if (member.category === 'individual') {
        payload.professionalDetails = {
          profession: editForm.profession,
          specialization: editForm.specialization || null,
          years_of_experience: editForm.years_of_experience ? Number(editForm.years_of_experience) : null,
          current_company: editForm.current_company || null,
          license_number: editForm.license_number || null,
          professional_certifications: editForm.professional_certifications || null,
        };
      } else if (member.category === 'organization') {
        payload.organizationDetails = {
          organization_name: editForm.organization_name,
          rc_number: editForm.rc_number || null,
          organization_type: editForm.organization_type || null,
          industry: editForm.industry || null,
          iso_start_year: editForm.iso_start_year || null,
          contact_person: editForm.contact_person || null,
          contact_person_role: editForm.contact_person_role || null,
          company_email: editForm.company_email,
          company_phone: editForm.company_phone,
          company_address: editForm.company_address || null,
          number_of_staff: editForm.number_of_staff ? Number(editForm.number_of_staff) : null,
        };
      }

      await updateMember(member.member_id, payload);
      const refreshed = await getMemberById(member.member_id);
      setMember(refreshed);
      setEditing(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!member) return;
    setDeleting(true);
    try {
      await deleteMember(member.member_id);
      navigate('/members');
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete member.';
      setError(msg);
      window.alert(msg);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) return <div className="py-20 text-center text-muted-foreground">Loading member profile…</div>;
  if (error && !member) return (
    <div className="py-20 text-center">
      <p className="text-muted-foreground">{error || 'Member not found.'}</p>
      <button onClick={() => navigate('/members')} className="mt-3 text-sm text-primary hover:underline">Back to Members</button>
    </div>
  );

  const details = member.studentDetails || member.graduateDetails || member.professionalDetails || member.organizationDetails;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={() => navigate('/members')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back to Members
        </button>
        <div className="flex gap-2 flex-wrap">
          {!editing ? (
            <>
              <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent/50 transition-colors">
                <Pencil size={13} /> Edit
              </button>
              <button
                onClick={() => navigate(`/email-composer?email=${encodeURIComponent(member.email)}&name=${encodeURIComponent(member.first_name + ' ' + member.last_name)}`)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent/50 transition-colors">
                <Mail size={13} /> Email Member
              </button>
              {member.registration_status !== 'approved' && (
                <button onClick={handleApprove} disabled={approving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-success/40 bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors disabled:opacity-60">
                  <CheckCircle size={13} /> {approving ? 'Approving…' : 'Approve Registration'}
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors disabled:opacity-60"
                >
                  <Trash2 size={13} /> {deleting ? 'Deleting...' : 'Delete Member'}
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={cancelEdit} disabled={saving} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent/50 transition-colors">
                <X size={13} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
                <Save size={13} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && editing && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <div className="flex flex-col items-center text-center pb-4 border-b border-border mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-3">
                {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
              </div>
              {!editing ? (
                <>
                  <h2 className="text-base font-semibold">{member.first_name} {member.other_name} {member.last_name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{member.email}</p>
                </>
              ) : (
                <div className="w-full space-y-2 text-left mt-2">
                  <EditRow label="First Name" value={ef('first_name')} onChange={v => setEf('first_name', v)} />
                  <EditRow label="Last Name" value={ef('last_name')} onChange={v => setEf('last_name', v)} />
                  <EditRow label="Other Name" value={ef('other_name')} onChange={v => setEf('other_name', v)} />
                </div>
              )}
              <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                <CategoryBadge category={member.category} />
                {!editing ? (
                  <>
                    <StatusBadge status={member.registration_status} />
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${member.payment_status === 'paid' ? 'bg-success/10 text-success' : 'bg-yellow-500/10 text-yellow-600'}`}>
                      {member.payment_status}
                    </span>
                  </>
                ) : (
                  <>
                    <select value={ef('registration_status')} onChange={e => setEf('registration_status', e.target.value)} className="input-field text-xs py-0.5 px-1.5 h-7">
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <select value={ef('payment_status')} onChange={e => setEf('payment_status', e.target.value)} className="input-field text-xs py-0.5 px-1.5 h-7">
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                    </select>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-0">
              <InfoRow label="Registration ID" value={member.public_id || 'PENDING'} />
              <InfoRow label="Registered" value={formatDateTime(member.created_at)} />
              <InfoRow label="Last Updated" value={formatDateTime(member.updated_at)} />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
            {!editing ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3"><Mail size={14} className="text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{member.email}</p></div></div>
                <div className="flex items-start gap-3"><Phone size={14} className="text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm">{member.phone}</p></div></div>
                {member.address && <div className="flex items-start gap-3"><MapPin size={14} className="text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground">Address</p><p className="text-sm">{member.address}, {member.state}, {member.country}</p></div></div>}
                <div className="flex items-start gap-3"><Tag size={14} className="text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground">Gender</p><p className="text-sm capitalize">{member.gender || '—'}</p></div></div>
              </div>
            ) : (
              <div className="space-y-0">
                <EditRow label="Email" value={ef('email')} onChange={v => setEf('email', v)} type="email" />
                <EditRow label="Phone" value={ef('phone')} onChange={v => setEf('phone', v)} />
                <EditRow label="Gender" value={ef('gender')} onChange={v => setEf('gender', v)} />
                <EditRow label="Date of Birth" value={ef('date_of_birth')} onChange={v => setEf('date_of_birth', v)} type="date" />
                <EditRow label="Address" value={ef('address')} onChange={v => setEf('address', v)} />
                <EditRow label="State" value={ef('state')} onChange={v => setEf('state', v)} />
                <EditRow label="Country" value={ef('country')} onChange={v => setEf('country', v)} />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {(details || editing) && (
            <div className="bg-card rounded-xl border border-border shadow-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText size={14} /> {member.category.charAt(0).toUpperCase() + member.category.slice(1)} Details
              </h3>
              <div className="space-y-0">
                {member.category === 'student' && (!editing ? (
                  <>
                    <InfoRow label="Institution" value={member.studentDetails?.institution_name} />
                    <InfoRow label="Course of Study" value={member.studentDetails?.course_of_study} />
                    <InfoRow label="Level" value={member.studentDetails?.level} />
                    <InfoRow label="Matric Number" value={member.studentDetails?.matric_number} />
                    <InfoRow label="Expected Graduation" value={member.studentDetails?.expected_graduation_year?.toString()} />
                  </>
                ) : (
                  <>
                    <EditRow label="Institution" value={ef('institution_name')} onChange={v => setEf('institution_name', v)} />
                    <EditRow label="Course of Study" value={ef('course_of_study')} onChange={v => setEf('course_of_study', v)} />
                    <EditRow label="Level" value={ef('level')} onChange={v => setEf('level', v)} />
                    <EditRow label="Matric Number" value={ef('matric_number')} onChange={v => setEf('matric_number', v)} />
                    <EditRow label="Expected Graduation Year" value={ef('expected_graduation_year')} onChange={v => setEf('expected_graduation_year', v)} />
                  </>
                ))}
                {member.category === 'graduate' && (!editing ? (
                  <>
                    <InfoRow label="Institution" value={member.graduateDetails?.institution} />
                    <InfoRow label="Qualification" value={member.graduateDetails?.qualification} />
                    <InfoRow label="Graduation Year" value={member.graduateDetails?.graduation_year?.toString()} />
                    <InfoRow label="Duration of Study" value={member.graduateDetails?.study_duration} />
                    <InfoRow label="NYSC Status" value={member.graduateDetails?.ny_sc_status} />
                  </>
                ) : (
                  <>
                    <EditRow label="Institution" value={ef('institution')} onChange={v => setEf('institution', v)} />
                    <EditRow label="Qualification" value={ef('qualification')} onChange={v => setEf('qualification', v)} />
                    <EditRow label="Graduation Year" value={ef('graduation_year')} onChange={v => setEf('graduation_year', v)} />
                    <EditRow label="Study Duration" value={ef('study_duration')} onChange={v => setEf('study_duration', v)} />
                    <EditRow label="NYSC Status" value={ef('ny_sc_status')} onChange={v => setEf('ny_sc_status', v)} />
                  </>
                ))}
                {member.category === 'individual' && (!editing ? (
                  <>
                    <InfoRow label="Profession" value={member.professionalDetails?.profession} />
                    <InfoRow label="Specialization" value={member.professionalDetails?.specialization} />
                    <InfoRow label="Years of Experience" value={member.professionalDetails?.years_of_experience?.toString()} />
                    <InfoRow label="Current Company" value={member.professionalDetails?.current_company} />
                    <InfoRow label="License Number" value={member.professionalDetails?.license_number} />
                    <InfoRow label="Certifications" value={member.professionalDetails?.professional_certifications} />
                  </>
                ) : (
                  <>
                    <EditRow label="Profession" value={ef('profession')} onChange={v => setEf('profession', v)} />
                    <EditRow label="Specialization" value={ef('specialization')} onChange={v => setEf('specialization', v)} />
                    <EditRow label="Years of Experience" value={ef('years_of_experience')} onChange={v => setEf('years_of_experience', v)} />
                    <EditRow label="Current Company" value={ef('current_company')} onChange={v => setEf('current_company', v)} />
                    <EditRow label="License Number" value={ef('license_number')} onChange={v => setEf('license_number', v)} />
                    <EditRow label="Certifications" value={ef('professional_certifications')} onChange={v => setEf('professional_certifications', v)} />
                  </>
                ))}
                {member.category === 'organization' && (!editing ? (
                  <>
                    <InfoRow label="Organization" value={member.organizationDetails?.organization_name} />
                    <InfoRow label="RC Number" value={member.organizationDetails?.rc_number} />
                    <InfoRow label="Type" value={member.organizationDetails?.organization_type} />
                    <InfoRow label="Industry" value={member.organizationDetails?.industry} />
                    <InfoRow label="ISO Start Year" value={member.organizationDetails?.iso_start_year} />
                    <InfoRow label="Contact Person" value={member.organizationDetails?.contact_person} />
                    <InfoRow label="Contact Role" value={member.organizationDetails?.contact_person_role} />
                    <InfoRow label="Company Email" value={member.organizationDetails?.company_email} />
                    <InfoRow label="Company Phone" value={member.organizationDetails?.company_phone} />
                    <InfoRow label="Number of Staff" value={member.organizationDetails?.number_of_staff?.toString()} />
                  </>
                ) : (
                  <>
                    <EditRow label="Organization Name" value={ef('organization_name')} onChange={v => setEf('organization_name', v)} />
                    <EditRow label="RC Number" value={ef('rc_number')} onChange={v => setEf('rc_number', v)} />
                    <EditRow label="Type" value={ef('organization_type')} onChange={v => setEf('organization_type', v)} />
                    <EditRow label="Industry" value={ef('industry')} onChange={v => setEf('industry', v)} />
                    <EditRow label="ISO Start Year" value={ef('iso_start_year')} onChange={v => setEf('iso_start_year', v)} />
                    <EditRow label="Contact Person" value={ef('contact_person')} onChange={v => setEf('contact_person', v)} />
                    <EditRow label="Contact Role" value={ef('contact_person_role')} onChange={v => setEf('contact_person_role', v)} />
                    <EditRow label="Company Email" value={ef('company_email')} onChange={v => setEf('company_email', v)} />
                    <EditRow label="Company Phone" value={ef('company_phone')} onChange={v => setEf('company_phone', v)} />
                    <EditRow label="Company Address" value={ef('company_address')} onChange={v => setEf('company_address', v)} />
                    <EditRow label="Number of Staff" value={ef('number_of_staff')} onChange={v => setEf('number_of_staff', v)} />
                  </>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Clock size={14} /> Activity Timeline</h3>
            {memberLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded for this member.</p>
            ) : (
              <div className="relative pl-4 border-l border-border space-y-4">
                {memberLogs.map(log => (
                  <div key={log.id} className="relative">
                    <div className={`absolute -left-[17px] w-2 h-2 rounded-full mt-1.5 ${log.action === 'APPROVAL' ? 'bg-success' : 'bg-primary'}`} />
                    <p className="text-sm">{log.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(log.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        open={showDeleteConfirm}
        name={`${member?.first_name || ''} ${member?.last_name || ''}`.trim() || 'member'}
        onCancel={() => !deleting && setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        message="This will permanently delete this member and all associated records. This action cannot be undone."
      />
    </div>
  );
}
