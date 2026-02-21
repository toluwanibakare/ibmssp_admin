import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, Building2, User, UserCheck, Mail, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { CategoryBadge, timeAgo } from '@/lib/utils-ui';

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
  const { members, logs, stats, isLoading } = useData();
  const navigate = useNavigate();

  if (isLoading && members.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">IBMSSP ADMIN Registry overview and recent activity</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/email-composer')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent/50 transition-colors">
            <Mail size={14} /> Send Announcement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Members" value={stats.total} icon={Users} color="bg-primary/10 text-primary" />
        <StatCard label="Students" value={stats.student} icon={GraduationCap} color="bg-[hsl(var(--badge-std-bg))] text-[hsl(var(--badge-std))]" />
        <StatCard label="Graduates" value={stats.graduate} icon={UserCheck} color="bg-[hsl(var(--badge-grd-bg))] text-[hsl(var(--badge-grd))]" />
        <StatCard label="Organizations" value={stats.organization} icon={Building2} color="bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]" />
        <StatCard label="Individuals" value={stats.individual} icon={User} color="bg-[hsl(var(--badge-ind-bg))] text-[hsl(var(--badge-ind))]" />
        <StatCard label="Today" value={stats.today} icon={TrendingUp} color="bg-success/10 text-success" sub="New registrations" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Registrations</h2>
            <button onClick={() => navigate('/members')} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <table className="data-table">
            <thead><tr><th>Registration ID</th><th>Name</th><th>Category</th><th>Status</th><th>Registered</th></tr></thead>
            <tbody>
              {members.slice(0, 8).map(m => (
                <tr key={m.member_id} className="cursor-pointer" onClick={() => navigate(`/members/${m.member_id}`)}>
                  <td className="font-mono text-xs font-medium text-primary">{m.public_id || 'PENDING'}</td>
                  <td className="font-medium">{m.first_name} {m.last_name}</td>
                  <td><CategoryBadge category={m.category} /></td>
                  <td><span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${m.registration_status === 'approved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{m.registration_status}</span></td>
                  <td className="text-muted-foreground text-xs">{timeAgo(m.created_at)}</td>
                </tr>
              ))}
              {members.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No registrations found</td></tr>}
            </tbody>
          </table>
        </div>

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
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${log.action === 'REGISTRATION' ? 'bg-success' : log.action === 'APPROVAL' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                <div>
                  <p className="text-sm">{log.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(log.created_at)}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && <div className="px-5 py-8 text-center text-muted-foreground text-sm">No activity logs</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
