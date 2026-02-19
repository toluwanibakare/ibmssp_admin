import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { formatPublicId } from '@/lib/mock-data';

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-[hsl(var(--badge-std-bg))] text-[hsl(var(--badge-std))]',
  green: 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]',
  amber: 'bg-[hsl(var(--badge-grd-bg))] text-[hsl(var(--badge-grd))]',
  violet: 'bg-[hsl(var(--badge-ind-bg))] text-[hsl(var(--badge-ind))]',
};

export default function Categories() {
  const { categories, updateCategory, deleteCategory } = useData();
  const [editing, setEditing] = useState<number | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const handleEdit = (id: number, desc: string) => { setEditing(id); setEditDesc(desc); };
  const handleSave = () => {
    if (editing) { updateCategory(editing, { description: editDesc }); setEditing(null); }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Registry categories and ID prefix configuration</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Prefix</th>
              <th>Description</th>
              <th>Members</th>
              <th>Next ID Preview</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${COLOR_MAP[cat.color]}`}>
                    <Tag size={11} /> {cat.name}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-xs font-semibold bg-muted px-2 py-0.5 rounded">{cat.prefix}</span>
                </td>
                <td className="max-w-xs">
                  {editing === cat.id ? (
                    <div className="flex items-center gap-2">
                      <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="input-field text-xs py-1 flex-1" />
                      <button onClick={handleSave} className="text-xs text-primary font-medium hover:text-primary/80">Save</button>
                      <button onClick={() => setEditing(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">{cat.description}</span>
                  )}
                </td>
                <td>
                  <span className="font-semibold text-sm">{cat.count}</span>
                </td>
                <td>
                  <span className="font-mono text-xs text-primary">{formatPublicId(cat.prefix, cat.count + 1)}</span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(cat.id, cat.description)} className="p-1.5 rounded hover:bg-accent transition-colors" title="Edit description">
                      <Pencil size={13} className="text-muted-foreground" />
                    </button>
                    <button onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })} className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                      <Trash2 size={13} className="text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmModal
        open={!!deleteTarget}
        name={deleteTarget?.name || ''}
        message={`Deleting the "${deleteTarget?.name}" category will not remove existing users, but new registrations will not be possible under this category.`}
        onConfirm={() => { if (deleteTarget) deleteCategory(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
