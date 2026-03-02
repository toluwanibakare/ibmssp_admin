import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Member {
  member_id: number;
  public_id: string;
  category: string;
  first_name: string;
  last_name: string;
  other_name?: string;
  gender?: string;
  date_of_birth?: string;
  email: string;
  phone: string;
  address?: string;
  state?: string;
  country?: string;
  registration_status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  member_id: number | null;
  action: string;
  description: string;
  performed_by: string | null;
  created_at: string;
}

export interface SentEmail {
  id: number;
  recipient_email: string;
  recipient_name: string;
  member_id: number | null;
  subject: string;
  body: string;
  status: string;
  sent_by: string | null;
  sent_at: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  student: number;
  graduate: number;
  individual: number;
  organization: number;
  today: number;
}

interface DataContextType {
  members: Member[];
  logs: ActivityLog[];
  emails: SentEmail[];
  templates: EmailTemplate[];
  stats: Stats;
  isLoading: boolean;
  fetchMembers: (params?: any) => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchEmails: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  clearEmailHistory: () => Promise<void>;
  clearActivityLogs: () => Promise<void>;
  deleteMember: (id: number) => Promise<void>;
  approveMember: (id: number) => Promise<void>;
  createMember: (data: any) => Promise<Member>;
  sendEmail: (data: any) => Promise<void>;
  createTemplate: (data: { name: string; subject: string; body: string }) => Promise<void>;
  getMemberById: (id: number) => Promise<any>;
  updateMember: (id: number, data: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

const initialStats: Stats = { total: 0, student: 0, graduate: 0, individual: 0, organization: 0, today: 0 };
const EMAIL_FOOTER_TEXT = 'For more information visit our website: www.ibmssp.org.ng or contact us on: +2348023644148';
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;
const EMAIL_REQUEST_TIMEOUT_MS = 15000;

function appendEmailFooter(content?: string | null) {
  const value = content || '';
  if (value.includes('www.ibmssp.org.ng') || value.includes('+2348023644148')) return value;
  return `${value}${value ? '\n\n' : ''}${EMAIL_FOOTER_TEXT}`;
}

function getEmailApiCandidates() {
  const candidates = [API_URL, `${window.location.origin}/api`]
    .map((url) => url.replace(/\/$/, ''))
    .filter(Boolean);
  return [...new Set(candidates)];
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = useCallback(async (params: any = {}) => {
    setIsLoading(true);
    try {
      let query = supabase.from('members').select('*').order('created_at', { ascending: false });
      if (params.category) query = query.eq('category', params.category);
      if (params.search) {
        query = query.or(`public_id.ilike.%${params.search}%,first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      const m = (data || []) as unknown as Member[];
      setMembers(m);

      const today = new Date().toDateString();
      const counts = m.reduce((acc: any, member) => {
        acc[member.category] = (acc[member.category] || 0) + 1;
        if (new Date(member.created_at).toDateString() === today) acc.today++;
        return acc;
      }, { student: 0, graduate: 0, individual: 0, organization: 0, today: 0 });

      setStats({ total: m.length, ...counts });
    } catch (error) {
      console.error('Fetch members error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setLogs((data || []) as unknown as ActivityLog[]);
    } catch (error) {
      console.error('Fetch logs error:', error);
    }
  }, []);

  const fetchEmails = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sent_emails')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setEmails((data || []) as unknown as SentEmail[]);
    } catch (error) {
      console.error('Fetch emails error:', error);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    // email_templates table not yet created - stub for future use
    setTemplates([]);
  }, []);

  const clearEmailHistory = async () => {
    if (user?.role !== 'admin') {
      throw new Error('Only admins can clear message history.');
    }
    const { error } = await supabase
      .from('sent_emails')
      .delete()
      .not('id', 'is', null);
    if (error) throw error;
    setEmails([]);
  };

  const clearActivityLogs = async () => {
    if (user?.role !== 'admin') {
      throw new Error('Only admins can clear activity logs.');
    }
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .not('id', 'is', null);
    if (error) throw error;
    setLogs([]);
  };

  const deleteMember = async (id: number) => {
    if (user?.role !== 'admin') {
      throw new Error('Only admins can delete members.');
    }

    const memberToDelete = members.find((m) => m.member_id === id) || null;
    const fullName = memberToDelete
      ? `${memberToDelete.first_name} ${memberToDelete.last_name}`.trim()
      : `Member #${id}`;
    const publicId = memberToDelete?.public_id || `ID:${id}`;

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('member_id', id);
    if (error) throw error;

    await supabase.from('activity_logs').insert({
      member_id: null,
      action: 'MEMBER_DELETED',
      description: `Member deleted: ${fullName} (${publicId})`,
      performed_by: user?.id || null,
    });

    setMembers((prev) => prev.filter((m) => m.member_id !== id));
    fetchMembers();
    fetchLogs();
  };

  const getMemberById = async (id: number) => {
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('member_id', id)
      .single();
    if (error) throw error;

    // Fetch category-specific details
    let studentDetails = null, graduateDetails = null, professionalDetails = null, organizationDetails = null;
    const cat = (member as any).category;
    if (cat === 'student') {
      const { data } = await supabase.from('student_details').select('*').eq('member_id', id).single();
      studentDetails = data;
    } else if (cat === 'graduate') {
      const { data } = await supabase.from('graduate_details').select('*').eq('member_id', id).single();
      graduateDetails = data;
    } else if (cat === 'individual') {
      const { data } = await supabase.from('professional_details').select('*').eq('member_id', id).single();
      professionalDetails = data;
    } else if (cat === 'organization') {
      const { data } = await supabase.from('organization_details').select('*').eq('member_id', id).single();
      organizationDetails = data;
    }

    return { ...member, studentDetails, graduateDetails, professionalDetails, organizationDetails };
  };

  const approveMember = async (id: number) => {
    const { error } = await supabase
      .from('members')
      .update({ registration_status: 'approved' })
      .eq('member_id', id);
    if (error) throw error;

    // Log the action
    const member = members.find(m => m.member_id === id);
    await supabase.from('activity_logs').insert({
      member_id: id,
      action: 'APPROVAL',
      description: `Registration approved: ${member?.first_name} ${member?.last_name} (${member?.public_id})`,
      performed_by: user?.id || null,
    });

    setMembers(prev => prev.map(m => m.member_id === id ? { ...m, registration_status: 'approved' } : m));
    fetchLogs();
  };

  const createMember = async (data: any) => {
    const { data: member, error } = await supabase
      .from('members')
      .insert([{
        category: data.category,
        first_name: data.first_name,
        last_name: data.last_name,
        other_name: data.other_name || null,
        gender: data.gender || null,
        date_of_birth: data.date_of_birth || null,
        email: data.email,
        phone: data.phone,
        address: data.address || null,
        state: data.state || null,
        country: data.country || null,
        registration_status: data.registration_status || 'pending',
        payment_status: data.payment_status || 'unpaid',
      }])
      .select('*')
      .single();
    if (error) throw error;

    try {
      if (data.category === 'student') {
        const { error: dError } = await supabase.from('student_details').insert([{
          member_id: member.member_id,
          institution_name: data.institution_name,
          course_of_study: data.course_of_study,
          level: data.level || null,
          matric_number: data.matric_number || null,
          expected_graduation_year: data.expected_graduation_year ? Number(data.expected_graduation_year) : null,
          student_id_card_file: data.student_id_card_file || null,
        }]);
        if (dError) throw dError;
      } else if (data.category === 'graduate') {
        const { error: dError } = await supabase.from('graduate_details').insert([{
          member_id: member.member_id,
          institution: data.institution,
          qualification: data.qualification,
          graduation_year: data.graduation_year ? Number(data.graduation_year) : null,
          study_duration: data.study_duration || null,
          ny_sc_status: data.ny_sc_status || null,
          certificate_file: data.certificate_file || null,
          cv_file: data.cv_file || null,
        }]);
        if (dError) throw dError;
      } else if (data.category === 'individual') {
        const { error: dError } = await supabase.from('professional_details').insert([{
          member_id: member.member_id,
          profession: data.profession,
          specialization: data.specialization || null,
          years_of_experience: data.years_of_experience ? Number(data.years_of_experience) : null,
          current_company: data.current_company || null,
          professional_certifications: data.professional_certifications || null,
          license_number: data.license_number || null,
          cv_file: data.cv_file || null,
        }]);
        if (dError) throw dError;
      } else if (data.category === 'organization') {
        const { error: dError } = await supabase.from('organization_details').insert([{
          member_id: member.member_id,
          organization_name: data.organization_name,
          rc_number: data.rc_number || null,
          organization_type: data.organization_type || null,
          industry: data.industry || null,
          iso_start_year: data.iso_start_year || null,
          contact_person: data.contact_person || null,
          contact_person_role: data.contact_person_role || null,
          company_email: data.company_email,
          company_phone: data.company_phone,
          company_address: data.company_address || null,
          number_of_staff: data.number_of_staff ? Number(data.number_of_staff) : null,
          company_certificate_file: data.company_certificate_file || null,
        }]);
        if (dError) throw dError;
      }

      await supabase.from('activity_logs').insert({
        member_id: member.member_id,
        action: 'ADMIN_CREATE',
        description: `Member added by admin: ${member.first_name} ${member.last_name}`,
        performed_by: user?.id || null,
      });

      await fetchMembers();
      await fetchLogs();
      return member as Member;
    } catch (detailError) {
      await supabase.from('members').delete().eq('member_id', member.member_id);
      throw detailError;
    }
  };

  const updateMember = async (id: number, data: any) => {
    // Update base member fields
    const baseFields: any = {};
    const baseKeys = ['first_name', 'last_name', 'other_name', 'gender', 'date_of_birth', 'email', 'phone', 'address', 'state', 'country', 'registration_status', 'payment_status'];
    baseKeys.forEach(k => { if (data[k] !== undefined) baseFields[k] = data[k] || null; });
    // Ensure required fields aren't nulled
    ['first_name', 'last_name', 'email', 'phone'].forEach(k => { if (data[k]) baseFields[k] = data[k]; });

    const { error } = await supabase.from('members').update(baseFields).eq('member_id', id);
    if (error) throw error;

    // Update category-specific details
    const cat = data.category;
    if (cat === 'student' && data.studentDetails) {
      await supabase.from('student_details').update(data.studentDetails).eq('member_id', id);
    } else if (cat === 'graduate' && data.graduateDetails) {
      await supabase.from('graduate_details').update(data.graduateDetails).eq('member_id', id);
    } else if (cat === 'individual' && data.professionalDetails) {
      await supabase.from('professional_details').update(data.professionalDetails).eq('member_id', id);
    } else if (cat === 'organization' && data.organizationDetails) {
      await supabase.from('organization_details').update(data.organizationDetails).eq('member_id', id);
    }

    await supabase.from('activity_logs').insert({
      member_id: id,
      action: 'MEMBER_UPDATED',
      description: `Member details updated: ${data.first_name} ${data.last_name}`,
      performed_by: user?.id || null,
    });

    await fetchMembers();
    await fetchLogs();
  };

  const sendEmail = async (data: any) => {
    const finalText = appendEmailFooter(data.text);
    const finalHtml = appendEmailFooter(data.html);
    const bodyForStorage = finalHtml || finalText;
    const apiCandidates = getEmailApiCandidates();
    if (apiCandidates.length === 0) throw new Error('Email API is not configured.');

    try {
      let delivered = false;
      let lastError: string | null = null;

      for (const baseUrl of apiCandidates) {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), EMAIL_REQUEST_TIMEOUT_MS);
        try {
          const response = await fetch(`${baseUrl}/email/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
            },
            body: JSON.stringify({
              to: data.to,
              subject: data.subject,
              text: finalText,
              html: finalHtml,
            }),
            signal: controller.signal,
          });

          const result = await response.json().catch(() => ({}));
          if (!response.ok || result?.success === false) {
            lastError = result?.message || `Email API error (${response.status})`;
            continue;
          }

          delivered = true;
          break;
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            lastError = `Email API timeout at ${baseUrl}`;
          } else if (err instanceof Error) {
            lastError = `Network error reaching ${baseUrl}: ${err.message}`;
          } else {
            lastError = `Network error reaching ${baseUrl}`;
          }
        } finally {
          window.clearTimeout(timer);
        }
      }

      if (!delivered) throw new Error(lastError || 'Failed to send email');

      await supabase.from('sent_emails').insert({
        recipient_email: data.to,
        recipient_name: data.recipientName || data.to,
        subject: data.subject,
        body: bodyForStorage,
        status: 'sent',
        sent_by: user?.id || null,
      });

      await supabase.from('activity_logs').insert({
        action: 'EMAIL_SENT',
        description: `Email sent to ${data.to}: "${data.subject}"`,
        performed_by: user?.id || null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send email';

      await supabase.from('sent_emails').insert({
        recipient_email: data.to,
        recipient_name: data.recipientName || data.to,
        subject: data.subject,
        body: bodyForStorage,
        status: 'failed',
        sent_by: user?.id || null,
      });

      await supabase.from('activity_logs').insert({
        action: 'EMAIL_FAILED',
        description: `Email failed for ${data.to}: "${data.subject}" (${message})`,
        performed_by: user?.id || null,
      });

      throw new Error(message);
    } finally {
      fetchEmails();
      fetchLogs();
    }
  };

  const createTemplate = async (data: { name: string; subject: string; body: string }) => {
    // email_templates table not yet created - stub for future use
    console.warn('email_templates table not available yet');
  };

  useEffect(() => {
    if (user) {
      fetchMembers();
      fetchLogs();
      fetchEmails();
      fetchTemplates();
    }
  }, [user, fetchMembers, fetchLogs, fetchEmails, fetchTemplates]);

  return (
    <DataContext.Provider value={{
      members, logs, emails, templates, stats, isLoading,
      fetchMembers, fetchLogs, fetchEmails, fetchTemplates, clearEmailHistory, clearActivityLogs, deleteMember, approveMember, createMember, sendEmail, createTemplate, getMemberById, updateMember,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
