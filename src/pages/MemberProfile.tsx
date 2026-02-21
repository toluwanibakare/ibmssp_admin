import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, Clock, FileText, Phone, Tag, MapPin } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { CategoryBadge, StatusBadge, formatDateTime, formatDate, timeAgo } from '@/lib/utils-ui';

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-border last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { approveMember, logs, getMemberById } = useData();
  const [member, setMember] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');

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

  if (isLoading) return <div className="py-20 text-center text-muted-foreground">Loading member profile…</div>;
  if (error || !member) return (
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
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <div className="flex flex-col items-center text-center pb-4 border-b border-border mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-3">
                {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
              </div>
              <h2 className="text-base font-semibold">{member.first_name} {member.other_name} {member.last_name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{member.email}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                <CategoryBadge category={member.category} />
                <StatusBadge status={member.registration_status} />
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${member.payment_status === 'paid' ? 'bg-success/10 text-success' : 'bg-yellow-500/10 text-yellow-600'}`}>
                  {member.payment_status}
                </span>
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
            <div className="space-y-3">
              <div className="flex items-start gap-3"><Mail size={14} className="text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{member.email}</p></div></div>
              <div className="flex items-start gap-3"><Phone size={14} className="text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm">{member.phone}</p></div></div>
              {member.address && <div className="flex items-start gap-3"><MapPin size={14} className="text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground">Address</p><p className="text-sm">{member.address}, {member.state}, {member.country}</p></div></div>}
              <div className="flex items-start gap-3"><Tag size={14} className="text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-xs text-muted-foreground">Category</p><p className="text-sm capitalize">{member.category}</p></div></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {details && (
            <div className="bg-card rounded-xl border border-border shadow-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText size={14} /> {member.category.charAt(0).toUpperCase() + member.category.slice(1)} Details
              </h3>
              <div className="space-y-0">
                {member.studentDetails && (<>
                  <InfoRow label="Institution" value={member.studentDetails.institution_name} />
                  <InfoRow label="Course of Study" value={member.studentDetails.course_of_study} />
                  <InfoRow label="Level" value={member.studentDetails.level} />
                  <InfoRow label="Matric Number" value={member.studentDetails.matric_number} />
                  <InfoRow label="Expected Graduation" value={member.studentDetails.expected_graduation_year?.toString()} />
                </>)}
                {member.graduateDetails && (<>
                  <InfoRow label="Institution" value={member.graduateDetails.institution} />
                  <InfoRow label="Qualification" value={member.graduateDetails.qualification} />
                  <InfoRow label="Graduation Year" value={member.graduateDetails.graduation_year?.toString()} />
                  <InfoRow label="Duration of Study" value={member.graduateDetails.study_duration} />
                  <InfoRow label="NYSC Status" value={member.graduateDetails.ny_sc_status} />
                </>)}
                {member.professionalDetails && (<>
                  <InfoRow label="Profession" value={member.professionalDetails.profession} />
                  <InfoRow label="Specialization" value={member.professionalDetails.specialization} />
                  <InfoRow label="Years of Experience" value={member.professionalDetails.years_of_experience?.toString()} />
                  <InfoRow label="Current Company" value={member.professionalDetails.current_company} />
                  <InfoRow label="License Number" value={member.professionalDetails.license_number} />
                  <InfoRow label="Certifications" value={member.professionalDetails.professional_certifications} />
                </>)}
                {member.organizationDetails && (<>
                  <InfoRow label="Organization" value={member.organizationDetails.organization_name} />
                  <InfoRow label="RC Number" value={member.organizationDetails.rc_number} />
                  <InfoRow label="Type" value={member.organizationDetails.organization_type} />
                  <InfoRow label="Industry" value={member.organizationDetails.industry} />
                  <InfoRow label="ISO Start Year" value={member.organizationDetails.iso_start_year} />
                  <InfoRow label="Contact Person" value={member.organizationDetails.contact_person} />
                  <InfoRow label="Contact Role" value={member.organizationDetails.contact_person_role} />
                  <InfoRow label="Company Email" value={member.organizationDetails.company_email} />
                  <InfoRow label="Company Phone" value={member.organizationDetails.company_phone} />
                  <InfoRow label="Number of Staff" value={member.organizationDetails.number_of_staff?.toString()} />
                </>)}
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
    </div>
  );
}
