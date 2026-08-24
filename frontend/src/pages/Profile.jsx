import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, Shield, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Profile</h1>
          <p className="page-subtitle">Manage account details and active role credentials</p>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: 'var(--color-primary-glow)', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '2px solid var(--color-primary)' }}>
            <User size={32} className="text-primary" style={{ margin: 'auto' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{user?.full_name || 'Staff User'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
              <Shield size={14} /> {user?.role?.replace('_', ' ') || 'User'} Role
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--color-surface-2)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mail size={16} className="text-muted" />
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 700 }}>EMAIL ADDRESS</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.email || 'N/A'}</div>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface-2)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Phone size={16} className="text-muted" />
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 700 }}>PHONE NUMBER</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.phone || 'Not provided'}</div>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface-2)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={16} className="text-accent" />
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 700 }}>SECURITY CREDENTIAL</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>Verified Security Token Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
