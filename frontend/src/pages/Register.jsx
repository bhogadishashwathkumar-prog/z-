import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Route, AlertCircle, Loader, ChevronDown } from 'lucide-react';

const ROLES = [
  { value: 'USER', label: 'General User' },
  { value: 'LOGISTICS_OPERATOR', label: 'Logistics Operator' },
  { value: 'FIELD_OFFICER', label: 'Field Officer' },
  { value: 'ADMIN', label: 'Administrator' },
];

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(16,185,129,0.12), transparent), var(--color-bg)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Route size={26} color="white" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Create Account</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Join NER SmartLogix Platform</div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 13, marginBottom: 20 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="Your full name" value={form.full_name}
                onChange={e => update('full_name', e.target.value)} required minLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={form.email}
                onChange={e => update('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input className="form-input" type="tel" placeholder="+91-XXXXXXXXXX" value={form.phone}
                onChange={e => update('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Minimum 6 characters" value={form.password}
                onChange={e => update('password', e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => update('role', e.target.value)}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? <><Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating Account...</> : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>Sign In</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" style={{ color: '#64748b', fontSize: 13 }}>← Back to Home</Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
