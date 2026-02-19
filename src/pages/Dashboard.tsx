import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, Building2, User, UserCheck, Plus, Mail, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { CategoryBadge, formatDateTime, timeAgo } from '@/lib/utils-ui';
import { getTodayRegistrations } from '@/lib/mock-data';

function StatCard({ label, value, icon: Icon, sub, color }: {
  label: string; value: number | string; icon: React.ElementType;
  sub?: string; color: string;
}) {
  return (
    <div className="stat-card flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { users, logs } = useData();
  const navigate = useNavigate();

  const students = users.filter(u => u.category === 'Student').length;
  const graduates = users.filter(u => u.category === 'Graduate').length;
  const orgs = users.filter(u => u.category === 'Organization').length;
  const auditors = users.filter(u => u.category === 'Trained Auditor').length;
  const consultants = users.filter(u => u.category === 'Consultant').length;
  const todayCount = getTodayRegistrations(users);
  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Registry overview and recent activity</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/users/new')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={14} /> Add User
          </button>
          <button onClick={() => navigate('/email-composer')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent/50 transition-colors">
            <Mail size={14} /> Compose Email
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
        <StatCard label="Total Users" value={users.length} icon={Users} color="bg-primary/10 text-primary" />
        <StatCard label="Students" value={students} icon={GraduationCap} color="bg-[hsl(var(--badge-std-bg))] text-[hsl(var(--badge-std))]" />
        <StatCard label="Graduates" value={graduates} icon={UserCheck} color="bg-[hsl(var(--badge-grd-bg))] text-[hsl(var(--badge-grd))]" />
        <StatCard label="Organizations" value={orgs} icon={Building2} color="bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]" />
        <StatCard label="Trained Auditors" value={auditors} icon={User} color="bg-[hsl(var(--badge-ind-bg))] text-[hsl(var(--badge-ind))]" />
        <StatCard label="Consultants" value={consultants} icon={User} color="bg-[hsl(var(--badge-con-bg))] text-[hsl(var(--badge-con))]" />
        <StatCard label="Today" value={todayCount} icon={TrendingUp} color="bg-success/10 text-success" sub="New today" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Registrations */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Registrations</h2>
            <button onClick={() => navigate('/users')} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Public ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id} className="cursor-pointer" onClick={() => navigate(`/users/${u.id}`)}>
                  <td className="font-mono text-xs font-medium text-primary">{u.publicId}</td>
                  <td className="font-medium">{u.fullName}</td>
                  <td><CategoryBadge category={u.category} /></td>
                  <td className="text-muted-foreground text-xs">{timeAgo(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
            <button onClick={() => navigate('/activity-logs')} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-border">
            {logs.slice(0, 8).map(log => (
              <div key={log.id} className="px-5 py-3 flex gap-3 items-start">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  log.action === 'user_created' ? 'bg-[hsl(var(--badge-org))]' :
                  log.action === 'email_sent' ? 'bg-primary' :
                  log.action === 'user_deleted' ? 'bg-destructive' :
                  'bg-muted-foreground'
                }`} />
                <div>
                  <p className="text-sm">{log.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
