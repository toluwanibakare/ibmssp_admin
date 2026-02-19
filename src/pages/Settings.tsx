import React, { useState } from 'react';
import { Save, User, Bell, Shield, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Admin User');
  const [email, setEmail] = useState(user?.email || 'admin@registry.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your admin account and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Profile</h2>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          {saved && (
            <div className="px-3 py-2 rounded-lg bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))] text-sm">
              Settings saved successfully.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Role</label>
            <input value="Super Admin" readOnly className="input-field bg-muted/50 text-muted-foreground cursor-not-allowed" />
          </div>
          <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Save size={13} /> Save changes
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={15} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'New user registrations', sub: 'Get notified when a new user registers' },
            { label: 'Email delivery failures', sub: 'Alert when an email fails to send' },
            { label: 'Weekly digest', sub: 'Summary of registry activity each week' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
              <button className="w-9 h-5 rounded-full bg-primary relative transition-colors">
                <span className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-primary-foreground shadow transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={15} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">System</h2>
        </div>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          {[
            ['Version', '1.0.0'],
            ['Environment', 'Demo'],
            ['Timezone', 'UTC'],
            ['Date Format', 'MMM DD, YYYY'],
          ].map(([k, v]) => (
            <React.Fragment key={k}>
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium">{v}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
