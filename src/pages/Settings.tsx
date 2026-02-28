import React, { useEffect, useState } from 'react';
import { User, Globe, Key, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const WP_INTEGRATION_SETTINGS_KEY = 'ibmssp_admin_wp_integration_settings';

const defaultIntegrationSettings = {
  webhookUrl: `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'ukjmduimszrydwoyrksi'}.supabase.co/functions/v1/register`,
  requiredHeaderName: 'x-api-key',
  requiredHeaderValue: 'ibmssp_admin_secret_key_2025',
};

export default function Settings() {
  const { user, logout } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState(defaultIntegrationSettings.webhookUrl);
  const [requiredHeaderName, setRequiredHeaderName] = useState(defaultIntegrationSettings.requiredHeaderName);
  const [requiredHeaderValue, setRequiredHeaderValue] = useState(defaultIntegrationSettings.requiredHeaderValue);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WP_INTEGRATION_SETTINGS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<typeof defaultIntegrationSettings>;
      if (typeof parsed.webhookUrl === 'string') setWebhookUrl(parsed.webhookUrl);
      if (typeof parsed.requiredHeaderName === 'string') setRequiredHeaderName(parsed.requiredHeaderName);
      if (typeof parsed.requiredHeaderValue === 'string') setRequiredHeaderValue(parsed.requiredHeaderValue);
    } catch {
      // Ignore malformed local settings and fall back to defaults
    }
  }, []);

  const saveIntegrationSettings = () => {
    const payload = {
      webhookUrl: webhookUrl.trim() || defaultIntegrationSettings.webhookUrl,
      requiredHeaderName: requiredHeaderName.trim() || defaultIntegrationSettings.requiredHeaderName,
      requiredHeaderValue: requiredHeaderValue.trim() || defaultIntegrationSettings.requiredHeaderValue,
    };

    localStorage.setItem(WP_INTEGRATION_SETTINGS_KEY, JSON.stringify(payload));
    setWebhookUrl(payload.webhookUrl);
    setRequiredHeaderName(payload.requiredHeaderName);
    setRequiredHeaderValue(payload.requiredHeaderValue);
    setSaveMessage('WordPress integration settings saved.');
    window.setTimeout(() => setSaveMessage(''), 2500);
  };

  const resetIntegrationSettings = () => {
    setWebhookUrl(defaultIntegrationSettings.webhookUrl);
    setRequiredHeaderName(defaultIntegrationSettings.requiredHeaderName);
    setRequiredHeaderValue(defaultIntegrationSettings.requiredHeaderValue);
    localStorage.setItem(WP_INTEGRATION_SETTINGS_KEY, JSON.stringify(defaultIntegrationSettings));
    setSaveMessage('WordPress integration settings reset to defaults.');
    window.setTimeout(() => setSaveMessage(''), 2500);
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
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
        <div className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Webhook URL</label>
            <input
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="input-field font-mono text-xs"
              placeholder="https://your-domain.com/api/register"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Required Header Name</label>
              <input
                value={requiredHeaderName}
                onChange={e => setRequiredHeaderName(e.target.value)}
                className="input-field font-mono text-xs"
                placeholder="x-api-key"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Required Header Value</label>
              <input
                value={requiredHeaderValue}
                onChange={e => setRequiredHeaderValue(e.target.value)}
                className="input-field font-mono text-xs"
                placeholder="your_registration_api_key"
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium">Header Preview:</p>
            <div className="font-mono text-xs bg-muted/40 px-3 py-2 rounded-lg text-muted-foreground break-all">
              {(requiredHeaderName || 'x-api-key')}: {(requiredHeaderValue || 'your_registration_api_key')}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={saveIntegrationSettings}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Save Integration Settings
            </button>
            <button
              type="button"
              onClick={resetIntegrationSettings}
              className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium hover:bg-accent/40 transition-colors"
            >
              Reset Defaults
            </button>
          </div>

          {saveMessage && (
            <div className="text-xs text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2">
              {saveMessage}
            </div>
          )}

          <p className="text-xs text-muted-foreground">Method: <span className="font-semibold text-foreground">POST</span> &nbsp;|&nbsp; Content-Type: <span className="font-semibold text-foreground">application/json</span></p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-destructive/20 shadow-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-destructive">Sign Out</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sign out of the IBMSSP admin panel</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors sm:self-auto self-start"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
