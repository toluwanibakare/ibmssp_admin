import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  Users, GraduationCap, Building2, User, UserCheck, Mail,
  ArrowUpRight, TrendingUp, RefreshCw, Download
} from 'lucide-react';
import { useData, Member } from '@/contexts/DataContext';
import { CategoryBadge, timeAgo } from '@/lib/utils-ui';

function StatCard({ label, value, icon: Icon, sub, color }: {
  label: string; value: number | string; icon: React.ElementType;
  sub?: string; color: string;
}) {
  return (
    <div className="stat-card flex items-start gap-3 sm:gap-4 min-w-0 h-full">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight break-words [overflow-wrap:anywhere]">{value}</p>
        <p className="text-sm text-muted-foreground leading-snug break-words [overflow-wrap:anywhere]">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 leading-snug break-words [overflow-wrap:anywhere]">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { members, logs, stats, isLoading, fetchMembers, fetchLogs } = useData();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchMembers(), fetchLogs()]);
    } finally {
      setRefreshing(false);
    }
  };
  const navigate = useNavigate();

  const categoryData = React.useMemo(() => [
    { name: 'Students', value: stats.student, color: 'hsl(var(--badge-std))' },
    { name: 'Graduates', value: stats.graduate, color: 'hsl(var(--badge-grd))' },
    { name: 'Organizations', value: stats.organization, color: 'hsl(var(--badge-org))' },
    { name: 'Individuals', value: stats.individual, color: 'hsl(var(--badge-ind))' },
  ].filter(d => d.value > 0), [stats]);

  const statusData = React.useMemo(() => [
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
  ], [stats]);

  const paymentData = React.useMemo(() => [
    { name: 'Paid', value: stats.paid, color: '#10b981' },
    { name: 'Unpaid', value: stats.unpaid, color: '#6366f1' },
  ], [stats]);

  const trendData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toDateString();
    }).reverse();

    return last7Days.map(dateStr => {
      const count = members.filter((m: Member) => new Date(m.created_at).toDateString() === dateStr).length;
      return {
        name: dateStr.split(' ').slice(1, 3).join(' '),
        value: count,
      };
    });
  }, [members]);

  const handleExportStats = () => {
    const sections = [
      { title: 'CATEGORY BREAKDOWN', data: categoryData },
      { title: 'REGISTRATION STATUS', data: statusData },
      { title: 'PAYMENT OVERVIEW', data: paymentData },
    ];

    let csvContent = `IBMSSP Registry Stats Summary - ${new Date().toLocaleDateString()}\n\n`;

    sections.forEach(section => {
      csvContent += `${section.title}\nLabel,Count\n`;
      section.data.forEach(item => {
        csvContent += `${item.name},${item.value}\n`;
      });
      csvContent += '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registry_summary_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && members.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="page-header flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">IBMSSP ADMIN Registry overview and recent activity</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={handleExportStats} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent/50 transition-colors">
            <Download size={14} /> Export Stats
          </button>
          <button onClick={handleRefresh} disabled={refreshing} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent/50 transition-colors">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => navigate('/email-composer')} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent/50 transition-colors w-full sm:w-auto">
            <Mail size={14} /> Send Announcement
          </button>
        </div>
      </div>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <StatCard label="Total Members" value={stats.total} icon={Users} color="bg-primary/10 text-primary" />
        <StatCard label="Approved Members" value={stats.approved} icon={UserCheck} color="bg-success/10 text-success" />
        <StatCard label="Paid Members" value={stats.paid} icon={TrendingUp} color="bg-indigo-500/10 text-indigo-600" />
        <StatCard label="New Registrations" value={stats.today} icon={RefreshCw} color="bg-warning/10 text-warning" sub="Joined today" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="text-sm font-semibold mb-6">Category Distribution</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="text-sm font-semibold mb-6">Recent Registration Trend</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="text-sm font-semibold mb-6">Registration Status</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="text-sm font-semibold mb-6">Payment Overview</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="rect" verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
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
