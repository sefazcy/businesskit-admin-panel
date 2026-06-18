import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { BusinessSettings, UpdateBusinessSettingsRequest } from '../types/businessSettings';
import { getSettings, updateSettings } from '../api/businessSettingsApi';

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === 'object') {
      if ('message' in data && typeof (data as { message: unknown }).message === 'string') {
        return (data as { message: string }).message;
      }
      if ('errors' in data) {
        const msgs = Object.values(
          (data as { errors: Record<string, string[]> }).errors
        ).flat();
        if (msgs.length > 0) return msgs.join(' ');
      }
    }
  }
  return 'An unexpected error occurred.';
}

const EMPTY_FORM = {
  businessName: '',
  logoUrl: '',
  phone: '',
  email: '',
  address: '',
  whatsApp: '',
  instagram: '',
  linkedIn: '',
  facebook: '',
  twitter: '',
  website: '',
  workingHours: '',
  currency: 'USD',
  themeColor: '',
};

function formFromSettings(s: BusinessSettings): typeof EMPTY_FORM {
  return {
    businessName: s.businessName,
    logoUrl: s.logoUrl ?? '',
    phone: s.phone ?? '',
    email: s.email ?? '',
    address: s.address ?? '',
    whatsApp: s.whatsApp ?? '',
    instagram: s.instagram ?? '',
    linkedIn: s.linkedIn ?? '',
    facebook: s.facebook ?? '',
    twitter: s.twitter ?? '',
    website: s.website ?? '',
    workingHours: s.workingHours ?? '',
    currency: s.currency,
    themeColor: s.themeColor ?? '',
  };
}

export default function SettingsPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setPageLoading(true);
    setPageError('');
    getSettings()
      .then(data => {
        if (data) {
          setForm(formFromSettings(data));
          setUpdatedAt(data.updatedAt);
        }
      })
      .catch(() => setPageError('Failed to load settings. Check that the backend is running.'))
      .finally(() => setPageLoading(false));
  }, []);

  const setField = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    if (!form.businessName.trim()) {
      setSaveError('Business Name is required.');
      return;
    }
    if (!form.currency.trim()) {
      setSaveError('Currency is required.');
      return;
    }

    setSaveLoading(true);

    const payload: UpdateBusinessSettingsRequest = {
      businessName: form.businessName.trim(),
      currency: form.currency.trim() || 'USD',
      logoUrl: form.logoUrl.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      whatsApp: form.whatsApp.trim() || null,
      instagram: form.instagram.trim() || null,
      linkedIn: form.linkedIn.trim() || null,
      facebook: form.facebook.trim() || null,
      twitter: form.twitter.trim() || null,
      website: form.website.trim() || null,
      workingHours: form.workingHours.trim() || null,
      themeColor: form.themeColor.trim() || null,
    };

    try {
      const { data } = await updateSettings(payload);
      setForm(formFromSettings(data));
      setUpdatedAt(data.updatedAt);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(extractError(err));
    } finally {
      setSaveLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="state-message">Loading settings…</div>;
  }

  if (pageError) {
    return <div className="state-message error">{pageError}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
      </div>
      <p className="page-subtitle">
        {updatedAt
          ? `Last saved: ${new Date(updatedAt).toLocaleString()}`
          : 'Settings not yet configured. Fill in and save to create.'}
      </p>

      <form onSubmit={handleSubmit}>
        {saveError && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{saveError}</div>
        )}
        {saveSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>Settings saved successfully.</div>
        )}

        <div className="form-panel">
          <h3>Business Info</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="s-businessName">Business Name *</label>
              <input
                id="s-businessName"
                type="text"
                value={form.businessName}
                onChange={e => setField('businessName', e.target.value)}
                required
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label htmlFor="s-phone">Phone</label>
              <input
                id="s-phone"
                type="text"
                value={form.phone}
                onChange={e => setField('phone', e.target.value)}
                maxLength={30}
              />
            </div>
            <div className="form-group">
              <label htmlFor="s-email">Email</label>
              <input
                id="s-email"
                type="email"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label htmlFor="s-currency">Currency *</label>
              <input
                id="s-currency"
                type="text"
                value={form.currency}
                onChange={e => setField('currency', e.target.value)}
                required
                maxLength={10}
                placeholder="USD"
              />
            </div>
          </div>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-group">
              <label htmlFor="s-address">Address</label>
              <textarea
                id="s-address"
                value={form.address}
                onChange={e => setField('address', e.target.value)}
                maxLength={500}
                rows={2}
              />
            </div>
            <div className="form-group">
              <label htmlFor="s-workingHours">Working Hours</label>
              <textarea
                id="s-workingHours"
                value={form.workingHours}
                onChange={e => setField('workingHours', e.target.value)}
                rows={3}
                placeholder={'Mon–Fri: 9:00 – 18:00\nSat: 10:00 – 14:00'}
              />
            </div>
          </div>
        </div>

        <div className="form-panel">
          <h3>Online Presence</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="s-website">Website</label>
              <input
                id="s-website"
                type="text"
                value={form.website}
                onChange={e => setField('website', e.target.value)}
                maxLength={500}
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="s-logoUrl">Logo URL</label>
              <input
                id="s-logoUrl"
                type="text"
                value={form.logoUrl}
                onChange={e => setField('logoUrl', e.target.value)}
                maxLength={500}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="form-panel">
          <h3>Social Links</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="s-instagram">Instagram</label>
              <input
                id="s-instagram"
                type="text"
                value={form.instagram}
                onChange={e => setField('instagram', e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="form-group">
              <label htmlFor="s-linkedIn">LinkedIn</label>
              <input
                id="s-linkedIn"
                type="text"
                value={form.linkedIn}
                onChange={e => setField('linkedIn', e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="form-group">
              <label htmlFor="s-facebook">Facebook</label>
              <input
                id="s-facebook"
                type="text"
                value={form.facebook}
                onChange={e => setField('facebook', e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="form-group">
              <label htmlFor="s-twitter">Twitter</label>
              <input
                id="s-twitter"
                type="text"
                value={form.twitter}
                onChange={e => setField('twitter', e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="form-group">
              <label htmlFor="s-whatsApp">WhatsApp</label>
              <input
                id="s-whatsApp"
                type="text"
                value={form.whatsApp}
                onChange={e => setField('whatsApp', e.target.value)}
                maxLength={30}
              />
            </div>
          </div>
        </div>

        <div className="form-panel">
          <h3>Appearance</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="s-themeColor">Theme Color</label>
              <input
                id="s-themeColor"
                type="text"
                value={form.themeColor}
                onChange={e => setField('themeColor', e.target.value)}
                maxLength={20}
                placeholder="#6366f1"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-indigo" disabled={saveLoading}>
            {saveLoading ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
