import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { CategoryBadge, StatusBadge, formatDate } from '@/lib/utils-ui';
import { Category } from '@/lib/mock-data';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

const PAGE_SIZE = 10;

export default function Users() {
  const { users, deleteUser } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const filtered = useMemo(() => {
    let res = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(u => u.publicId.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
    }
    if (category) res = res.filter(u => u.category === category);
    return res;
  }, [users, search, category]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = () => {
    if (deleteTarget) { deleteUser(deleteTarget.id); setDeleteTarget(null); }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
        <button onClick={() => navigate('/users/new')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={14} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users…" className="input-field pl-8" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select value={category} onChange={e => { setCategory(e.target.value as Category | ''); setPage(1); }} className="input-field pl-8 pr-8 appearance-none cursor-pointer">
            <option value="">All categories</option>
            <option value="Student">Student</option>
            <option value="Organization">Organization</option>
            <option value="Graduate">Graduate</option>
            <option value="Individual">Individual</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {paged.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-sm">No users found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Public ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(u => (
                  <tr key={u.id}>
                    <td className="font-mono text-xs font-medium text-primary">{u.publicId}</td>
                    <td className="font-medium">{u.fullName}</td>
                    <td className="text-muted-foreground text-xs">{u.email}</td>
                    <td className="text-muted-foreground text-xs">{u.phone}</td>
                    <td><CategoryBadge category={u.category} /></td>
                    <td><StatusBadge status={u.status} /></td>
                    <td className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/users/${u.id}`)} className="p-1.5 rounded hover:bg-accent transition-colors" title="View">
                          <Eye size={13} className="text-muted-foreground" />
                        </button>
                        <button onClick={() => navigate(`/users/${u.id}/edit`)} className="p-1.5 rounded hover:bg-accent transition-colors" title="Edit">
                          <Pencil size={13} className="text-muted-foreground" />
                        </button>
                        <button onClick={() => setDeleteTarget({ id: u.id, name: u.fullName })} className="p-1.5 rounded hover:bg-destructive/10 transition-colors" title="Delete">
                          <Trash2 size={13} className="text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded hover:bg-accent disabled:opacity-40 transition-colors">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs font-medium transition-colors ${p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded hover:bg-accent disabled:opacity-40 transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={!!deleteTarget}
        name={deleteTarget?.name || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
