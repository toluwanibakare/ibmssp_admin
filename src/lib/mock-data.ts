export type Category = 'Student' | 'Organization' | 'Graduate' | 'Trained Auditor' | 'Consultant';

export interface User {
  id: number;
  publicId: string;
  fullName: string;
  email: string;
  phone: string;
  category: Category;
  notes: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface EmailMessage {
  id: number;
  recipientId: number | null;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
}

export interface ActivityLog {
  id: number;
  action: 'user_created' | 'user_updated' | 'user_deleted' | 'email_sent' | 'login' | 'category_created';
  description: string;
  userId: number | null;
  publicId: string | null;
  performedBy: string;
  timestamp: string;
}

export interface CategoryDef {
  id: number;
  name: Category;
  prefix: string;
  description: string;
  color: string;
  count: number;
}

// ID counters per category
export const categoryCounters: Record<string, number> = {
  STD: 12,
  ORG: 5,
  GRD: 8,
  TAU: 10,
  CON: 7,
};

export const categoryDefs: CategoryDef[] = [
  { id: 1, name: 'Student', prefix: 'STD', description: 'Enrolled students from partner institutions', color: 'blue', count: 12 },
  { id: 2, name: 'Organization', prefix: 'ORG', description: 'Registered organizations and companies', color: 'green', count: 5 },
  { id: 3, name: 'Graduate', prefix: 'GRD', description: 'Graduated alumni members', color: 'amber', count: 8 },
  { id: 4, name: 'Trained Auditor', prefix: 'TAU', description: 'Certified and trained auditing professionals', color: 'violet', count: 10 },
  { id: 5, name: 'Consultant', prefix: 'CON', description: 'Independent consultants and advisory professionals', color: 'teal', count: 7 },
];

export function getPrefixForCategory(cat: Category): string {
  const map: Record<Category, string> = {
    Student: 'STD', Organization: 'ORG', Graduate: 'GRD',
    'Trained Auditor': 'TAU', Consultant: 'CON',
  };
  return map[cat];
}

export function formatPublicId(prefix: string, num: number): string {
  return `${prefix}${String(num).padStart(5, '0')}`;
}

export const mockUsers: User[] = [
  { id: 1, publicId: 'STD00001', fullName: 'Alice Johnson', email: 'alice@example.com', phone: '+1 555-0101', category: 'Student', notes: 'Engineering department. Dean\'s list student.', createdAt: '2024-11-01T09:00:00Z', status: 'active' },
  { id: 2, publicId: 'ORG00001', fullName: 'Greenway Solutions Inc.', email: 'contact@greenway.com', phone: '+1 555-0202', category: 'Organization', notes: 'Corporate partner. Registered for the annual summit.', createdAt: '2024-11-03T11:30:00Z', status: 'active' },
  { id: 3, publicId: 'GRD00001', fullName: 'Marcus Lee', email: 'marcus.lee@email.com', phone: '+1 555-0303', category: 'Graduate', notes: 'Class of 2022. Currently working in finance.', createdAt: '2024-11-05T14:00:00Z', status: 'active' },
  { id: 4, publicId: 'TAU00001', fullName: 'Priya Sharma', email: 'priya.s@email.com', phone: '+1 555-0404', category: 'Trained Auditor', notes: 'ISO 9001 certified auditor.', createdAt: '2024-11-08T10:15:00Z', status: 'active' },
  { id: 5, publicId: 'STD00002', fullName: 'Carlos Mendez', email: 'c.mendez@university.edu', phone: '+1 555-0505', category: 'Student', notes: 'MBA program, year 2.', createdAt: '2024-11-10T09:45:00Z', status: 'active' },
  { id: 6, publicId: 'CON00001', fullName: 'Sarah Chen', email: 'sarah.chen@email.com', phone: '+1 555-0606', category: 'Consultant', notes: 'Independent strategy consultant.', createdAt: '2024-11-12T16:00:00Z', status: 'active' },
  { id: 7, publicId: 'GRD00002', fullName: 'David Okafor', email: 'david.o@alumni.org', phone: '+1 555-0707', category: 'Graduate', notes: 'Spoke at 2023 conference.', createdAt: '2024-11-15T08:30:00Z', status: 'inactive' },
  { id: 8, publicId: 'ORG00002', fullName: 'TechBridge Foundation', email: 'info@techbridge.org', phone: '+1 555-0808', category: 'Organization', notes: 'Non-profit. Needs annual membership renewal.', createdAt: '2024-11-18T13:00:00Z', status: 'active' },
  { id: 9, publicId: 'TAU00002', fullName: 'Emma Wilson', email: 'emma.w@email.com', phone: '+1 555-0909', category: 'Trained Auditor', notes: 'Lead auditor, energy sector.', createdAt: '2024-11-20T11:00:00Z', status: 'active' },
  { id: 10, publicId: 'STD00003', fullName: 'James Park', email: 'j.park@university.edu', phone: '+1 555-1010', category: 'Student', notes: 'Computer Science, year 3.', createdAt: '2024-11-22T10:00:00Z', status: 'active' },
  { id: 11, publicId: 'TAU00003', fullName: 'Amara Diallo', email: 'amara.d@email.com', phone: '+1 555-1111', category: 'Trained Auditor', notes: 'Referral from conference. IATF 16949 qualified.', createdAt: '2024-12-01T09:00:00Z', status: 'active' },
  { id: 12, publicId: 'GRD00003', fullName: 'Robert Kim', email: 'r.kim@alumni.org', phone: '+1 555-1212', category: 'Graduate', notes: 'Interested in mentorship program.', createdAt: '2024-12-03T14:30:00Z', status: 'active' },
  { id: 13, publicId: 'ORG00003', fullName: 'Apex Ventures LLC', email: 'admin@apexventures.com', phone: '+1 555-1313', category: 'Organization', notes: 'Investment firm. VIP status.', createdAt: '2024-12-05T10:00:00Z', status: 'active' },
  { id: 14, publicId: 'STD00004', fullName: 'Lena Fischer', email: 'lena.f@university.edu', phone: '+49 555-1414', category: 'Student', notes: 'Exchange student from Germany.', createdAt: '2024-12-07T08:00:00Z', status: 'active' },
  { id: 15, publicId: 'CON00002', fullName: 'Tom Bradley', email: 'tom.b@email.com', phone: '+1 555-1515', category: 'Consultant', notes: 'Digital transformation specialist.', createdAt: '2025-01-02T09:30:00Z', status: 'active' },
  { id: 16, publicId: 'GRD00004', fullName: 'Yuki Tanaka', email: 'y.tanaka@alumni.org', phone: '+81 555-1616', category: 'Graduate', notes: 'Based in Tokyo. Active in international chapter.', createdAt: '2025-01-04T12:00:00Z', status: 'active' },
  { id: 17, publicId: 'CON00003', fullName: 'Isabella Torres', email: 'i.torres@email.com', phone: '+1 555-1717', category: 'Consultant', notes: 'Healthcare management consultant.', createdAt: '2025-01-06T11:00:00Z', status: 'active' },
  { id: 18, publicId: 'STD00005', fullName: 'Noah Williams', email: 'n.williams@university.edu', phone: '+1 555-1818', category: 'Student', notes: 'Psychology major.', createdAt: '2025-01-08T09:00:00Z', status: 'active' },
  { id: 19, publicId: 'ORG00004', fullName: 'EduPath Network', email: 'contact@edupathnetwork.org', phone: '+1 555-1919', category: 'Organization', notes: 'Education-focused NGO.', createdAt: '2025-01-10T10:30:00Z', status: 'active' },
  { id: 20, publicId: 'TAU00004', fullName: 'Oliver Brown', email: 'o.brown@email.com', phone: '+1 555-2020', category: 'Trained Auditor', notes: 'Registered today. Environmental auditor.', createdAt: new Date().toISOString(), status: 'active' },
];

export const mockEmails: EmailMessage[] = [
  { id: 1, recipientId: 1, recipientName: 'Alice Johnson', recipientEmail: 'alice@example.com', subject: 'Welcome to the Registry', body: '<p>Dear Alice,</p><p>Welcome to our registry system. Your account has been created successfully.</p><p>Your Public ID is <strong>STD00001</strong>.</p><p>Best regards,<br/>Admin Team</p>', status: 'sent', sentAt: '2024-11-01T09:30:00Z' },
  { id: 2, recipientId: null, recipientName: 'All Students (12)', recipientEmail: 'multiple', subject: 'Important Announcement - Q1 2025', body: '<p>Dear Students,</p><p>Please review the updated registration guidelines for Q1 2025.</p>', status: 'sent', sentAt: '2025-01-15T10:00:00Z' },
  { id: 3, recipientId: 3, recipientName: 'Marcus Lee', recipientEmail: 'marcus.lee@email.com', subject: 'Profile Update Confirmation', body: '<p>Dear Marcus,</p><p>Your profile information has been updated.</p>', status: 'sent', sentAt: '2024-12-10T14:00:00Z' },
  { id: 4, recipientId: 2, recipientName: 'Greenway Solutions Inc.', recipientEmail: 'contact@greenway.com', subject: 'Membership Renewal Notice', body: '<p>Dear Greenway Solutions,</p><p>Your membership is due for renewal on January 31, 2025.</p>', status: 'sent', sentAt: '2025-01-05T09:00:00Z' },
  { id: 5, recipientId: 8, recipientName: 'TechBridge Foundation', recipientEmail: 'info@techbridge.org', subject: 'Annual Summit Invitation', body: '<p>Dear TechBridge Foundation,</p><p>You are cordially invited to our Annual Summit 2025.</p>', status: 'failed', sentAt: '2025-01-20T11:00:00Z' },
];

export const mockLogs: ActivityLog[] = [
  { id: 1, action: 'login', description: 'Admin logged in', userId: null, publicId: null, performedBy: 'admin@registry.com', timestamp: new Date().toISOString() },
  { id: 2, action: 'user_created', description: 'New user registered: Oliver Brown (TAU00004)', userId: 20, publicId: 'TAU00004', performedBy: 'admin@registry.com', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, action: 'email_sent', description: 'Email sent to All Students (12 recipients)', userId: null, publicId: null, performedBy: 'admin@registry.com', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 4, action: 'user_updated', description: 'Profile updated: Marcus Lee (GRD00001)', userId: 3, publicId: 'GRD00001', performedBy: 'admin@registry.com', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 5, action: 'user_created', description: 'New user registered: EduPath Network (ORG00004)', userId: 19, publicId: 'ORG00004', performedBy: 'admin@registry.com', timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: 6, action: 'email_sent', description: 'Email sent to Greenway Solutions Inc.', userId: 2, publicId: 'ORG00001', performedBy: 'admin@registry.com', timestamp: new Date(Date.now() - 259200000).toISOString() },
  { id: 7, action: 'user_created', description: 'New user registered: Isabella Torres (CON00003)', userId: 17, publicId: 'CON00003', performedBy: 'admin@registry.com', timestamp: new Date(Date.now() - 432000000).toISOString() },
  { id: 8, action: 'user_deleted', description: 'User removed: (inactive account)', userId: null, publicId: 'STD00006', performedBy: 'admin@registry.com', timestamp: new Date(Date.now() - 518400000).toISOString() },
  { id: 9, action: 'category_created', description: 'Category reviewed: Trained Auditor', userId: null, publicId: null, performedBy: 'admin@registry.com', timestamp: new Date(Date.now() - 604800000).toISOString() },
  { id: 10, action: 'user_updated', description: 'Status changed: David Okafor (GRD00002) → inactive', userId: 7, publicId: 'GRD00002', performedBy: 'admin@registry.com', timestamp: new Date(Date.now() - 691200000).toISOString() },
];

export function getTodayRegistrations(users: User[]): number {
  const today = new Date().toDateString();
  return users.filter(u => new Date(u.createdAt).toDateString() === today).length;
}
