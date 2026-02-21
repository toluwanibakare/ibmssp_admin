import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../lib/api';

export interface Member {
  member_id: number;
  public_id: string;
  category: 'student' | 'graduate' | 'individual' | 'organization';
  first_name: string;
  last_name: string;
  other_name?: string;
  email: string;
  phone: string;
  registration_status: string;
  payment_status: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  member_id: number;
  action: string;
  description: string;
  created_at: string;
  Member?: {
    first_name: string;
    last_name: string;
    public_id: string;
  }
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
  stats: Stats;
  isLoading: boolean;
  fetchMembers: (params?: any) => Promise<void>;
  fetchLogs: () => Promise<void>;
  approveMember: (id: number) => Promise<void>;
  sendEmail: (data: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

const initialStats: Stats = {
  total: 0,
  student: 0,
  graduate: 0,
  individual: 0,
  organization: 0,
  today: 0
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = async (params = {}) => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/members', { params });
      if (res.success) {
        setMembers(res.data.members);

        // Calculate basic stats for now (Ideally backend provides this)
        const counts = res.data.members.reduce((acc: any, m: Member) => {
          acc[m.category] = (acc[m.category] || 0) + 1;
          const isToday = new Date(m.created_at).toDateString() === new Date().toDateString();
          if (isToday) acc.today++;
          return acc;
        }, { student: 0, graduate: 0, individual: 0, organization: 0, today: 0 });

        setStats({
          total: res.data.total,
          ...counts
        });
      }
    } catch (error) {
      console.error('Fetch members error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res: any = await api.get('/logs');
      if (res.success) {
        setLogs(res.data);
      }
    } catch (error) {
      console.error('Fetch logs error:', error);
    }
  };

  const approveMember = async (id: number) => {
    try {
      const res: any = await api.patch(`/members/${id}/approve`);
      if (res.success) {
        setMembers(prev => prev.map(m => m.member_id === id ? { ...m, registration_status: 'approved' } : m));
        fetchLogs();
      }
    } catch (error) {
      console.error('Approve error:', error);
      throw error;
    }
  };

  const sendEmail = async (data: any) => {
    try {
      await api.post('/email/send', data);
      fetchLogs();
    } catch (error) {
      console.error('Send email error:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchLogs();
  }, []);

  return (
    <DataContext.Provider value={{
      members, logs, stats, isLoading,
      fetchMembers, fetchLogs, approveMember, sendEmail
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
