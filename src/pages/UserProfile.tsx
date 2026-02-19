import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Pencil, Trash2, Clock, FileText, Phone, Tag } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { CategoryBadge, StatusBadge, formatDateTime, timeAgo } from '@/lib/utils-ui';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, updateUser, deleteUser, emails, logs } = useData();
  const user = users.find(u => u.id === Number(id));
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(user?.notes || '');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => { if (user) setNotes(user.notes); }, [user]);

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">User not found.</p>
        <button onClick={() => navigate('/users')} className="mt-3 text-sm text-primary hover:underline">Back to Users</button>
      </div>
    );
  }

  const userEmails = emails.filter(e => e.recipientId === user.id);
  const userLogs = logs.filter(l => l.userId === user.id);

  const handleSaveNotes = () => { updateUser(user.id, { notes }); setEditingNotes(false); };
  const handleDelete = () => { deleteUser(user.id); navigate('/users'); };

  return (
    <div className="space-y-5">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/users')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back to Users
        </button>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/email-composer?to=${user.id}`)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent/50 transition-colors">
            <Mail size={13} /> Email
          </button>
          <button onClick={() => navigate(`/users/${user.id}/edit`)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent/50 transition-colors">
            <Pencil size={13} /> Edit
          </button>
          <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Left: Identity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <div className="flex flex-col items-center text-center pb-4 border-b border-border mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-3">
                {user.fullName.charAt(0)}
              </div>
              <h2 className="text-base font-semibold">{user.fullName}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <CategoryBadge category={user.category} />
                <StatusBadge status={user.status} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Public ID</span>
                <span className="font-mono text-sm font-semibold text-primary">{user.publicId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Registered</span>
                <span className="text-xs">{formatDateTime(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tag size={14} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm">{user.category}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Notes + Timeline */}
        <div className="lg:col-span-3 space-y-4">
          {/* Notes */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><FileText size={14} /> Notes</h3>
              {!editingNotes
                ? <button onClick={() => setEditingNotes(true)} className="text-xs text-primary hover:text-primary/80 transition-colors">Edit</button>
                : (
                  <div className="flex gap-2">
                    <button onClick={() => { setNotes(user.notes); setEditingNotes(false); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    <button onClick={handleSaveNotes} className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">Save</button>
                  </div>
                )
              }
            </div>
            {editingNotes ? (
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="input-field resize-none text-sm" placeholder="Add notes about this user…" />
            ) : (
              <p className="text-sm text-muted-foreground">{user.notes || 'No notes added.'}</p>
            )}
          </div>

          {/* Email History */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Mail size={14} /> Email History</h3>
            {userEmails.length === 0 ? (
              <p className="text-sm text-muted-foreground">No emails sent to this user.</p>
            ) : (
              <div className="space-y-2">
                {userEmails.map(e => (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <div>
                      <p className="text-sm font-medium">{e.subject}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(e.sentAt)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${e.status === 'sent' ? 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]' : 'bg-destructive/10 text-destructive'}`}>
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Clock size={14} /> Activity Timeline</h3>
            {userLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded.</p>
            ) : (
              <div className="relative pl-4 border-l border-border space-y-4">
                {userLogs.map(log => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-[17px] w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <p className="text-sm">{log.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(log.timestamp)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal open={deleteOpen} name={user.fullName} onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)} />
    </div>
  );
}
