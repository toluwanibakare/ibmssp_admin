import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { CategoryBadge, StatusBadge, formatDate } from '@/lib/utils-ui';

const PAGE_SIZE = 15;

export default function Members() {
  const { members, stats, isLoading, fetchMembers, approveMember } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [approvingId, setApprovingId] = useState<number | null>(null);

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

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Members Registry</h1>
          <p className="page-subtitle">{stats.total} total registered members</p>
        </div>
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
    </div>
  );
}
