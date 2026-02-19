import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  User, EmailMessage, ActivityLog, CategoryDef,
  mockUsers, mockEmails, mockLogs, categoryDefs, categoryCounters,
  getPrefixForCategory, formatPublicId, Category
} from '@/lib/mock-data';

interface DataContextType {
  users: User[];
  emails: EmailMessage[];
  logs: ActivityLog[];
  categories: CategoryDef[];
  addUser: (data: Omit<User, 'id' | 'publicId' | 'createdAt' | 'status'>) => User;
  updateUser: (id: number, data: Partial<User>) => void;
  deleteUser: (id: number) => void;
  sendEmail: (email: Omit<EmailMessage, 'id' | 'sentAt'>) => void;
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  updateCategory: (id: number, data: Partial<CategoryDef>) => void;
  deleteCategory: (id: number) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [emails, setEmails] = useState<EmailMessage[]>(mockEmails);
  const [logs, setLogs] = useState<ActivityLog[]>(mockLogs);
  const [categories, setCategories] = useState<CategoryDef[]>(categoryDefs);
  const [counters, setCounters] = useState<Record<string, number>>(categoryCounters);

  const addUser = (data: Omit<User, 'id' | 'publicId' | 'createdAt' | 'status'>): User => {
    const prefix = getPrefixForCategory(data.category);
    const nextNum = (counters[prefix] || 0) + 1;
    const publicId = formatPublicId(prefix, nextNum);
    const newUser: User = {
      ...data,
      id: users.length + 1,
      publicId,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setCounters(c => ({ ...c, [prefix]: nextNum }));
    setUsers(u => [...u, newUser]);
    setCategories(cats => cats.map(c => c.prefix === prefix ? { ...c, count: c.count + 1 } : c));
    addLog({ action: 'user_created', description: `New user registered: ${data.fullName} (${publicId})`, userId: newUser.id, publicId, performedBy: 'admin@registry.com' });
    return newUser;
  };

  const updateUser = (id: number, data: Partial<User>) => {
    setUsers(u => u.map(user => user.id === id ? { ...user, ...data } : user));
  };

  const deleteUser = (id: number) => {
    const user = users.find(u => u.id === id);
    const prefix = user ? getPrefixForCategory(user.category) : '';
    setUsers(u => u.filter(user => user.id !== id));
    if (user && prefix) {
      setCategories(cats => cats.map(c => c.prefix === prefix ? { ...c, count: Math.max(0, c.count - 1) } : c));
    }
    if (user) addLog({ action: 'user_deleted', description: `User removed: ${user.fullName} (${user.publicId})`, userId: id, publicId: user.publicId, performedBy: 'admin@registry.com' });
  };

  const sendEmail = (email: Omit<EmailMessage, 'id' | 'sentAt'>) => {
    const newEmail: EmailMessage = { ...email, id: emails.length + 1, sentAt: new Date().toISOString() };
    setEmails(e => [newEmail, ...e]);
    addLog({ action: 'email_sent', description: `Email sent to ${email.recipientName}`, userId: email.recipientId, publicId: null, performedBy: 'admin@registry.com' });
  };

  const addLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = { ...log, id: Date.now(), timestamp: new Date().toISOString() };
    setLogs(l => [newLog, ...l]);
  };

  const updateCategory = (id: number, data: Partial<CategoryDef>) => {
    setCategories(cats => cats.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCategory = (id: number) => {
    setCategories(cats => cats.filter(c => c.id !== id));
  };

  return (
    <DataContext.Provider value={{ users, emails, logs, categories, addUser, updateUser, deleteUser, sendEmail, addLog, updateCategory, deleteCategory }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
