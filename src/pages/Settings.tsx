import React from 'react';
import { User, Globe, Key, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your IBMSSP admin account</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Account Profile</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Full Name</label>
            <input defaultValue={user?.name || ''} className="input-field" readOnly />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Email Address</label>
            <input type="email" defaultValue={user?.email || ''} className="input-field" readOnly />
          </div>
        </div>
        <div className="space-y-1.5 mt-4">
          <label className="text-xs font-medium">Role</label>
          <input value={user?.role || 'admin'} readOnly className="input-field bg-muted/50 text-muted-foreground cursor-not-allowed capitalize" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={15} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">System Information</h2>
        </div>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          {[
            ['Application', 'IBMSSP ADMIN Registry'],
            ['Version', '1.0.0'],
            ['Environment', 'Production'],
            ['Domain', 'admin.ibmssp.org.ng'],
            ['Timezone', 'Africa/Lagos (WAT)'],
            ['Date Format', 'DD MMM YYYY'],
          ].map(([k, v]) => (
            <React.Fragment key={k}>
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium">{v}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* WordPress Integration */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Key size={15} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">WordPress Integration</h2>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground text-xs">Configure your WordPress Contact Form 7 webhook to submit to:</p>
          <div className="font-mono text-xs bg-muted/40 px-3 py-2 rounded-lg break-all text-primary select-all">
            {`https://ukjmduimszrydwoyrksi.supabase.co/functions/v1/register`}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium">Required Header:</p>
            <div className="font-mono text-xs bg-muted/40 px-3 py-2 rounded-lg text-muted-foreground">
              x-api-key: your_registration_api_key
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Method: <span className="font-semibold text-foreground">POST</span> &nbsp;|&nbsp; Content-Type: <span className="font-semibold text-foreground">application/json</span></p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-destructive/20 shadow-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-destructive">Sign Out</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sign out of the IBMSSP admin panel</p>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
