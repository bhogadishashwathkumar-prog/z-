import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Route, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email, pass) => setForm({ email, password: pass });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59,130,246,0.15), transparent), var(--color-bg)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Route size={26} color="white" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>NER SmartLogix</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Sign in to your account</div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 13, marginBottom: 20 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? <><Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="divider" />

          {/* Quick login */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Quick Demo Login</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { label: 'Admin', email: 'admin@nersmartlogix.in', pass: 'admin123' },
                { label: 'Logistics', email: 'logistics@nersmartlogix.in', pass: 'demo123' },
                { label: 'Field Officer', email: 'field@nersmartlogix.in', pass: 'demo123' },
                { label: 'User', email: 'user@nersmartlogix.in', pass: 'demo123' },
              ].map(d => (
                <button key={d.label} className="btn btn-outline btn-sm" onClick={() => quickLogin(d.email, d.pass)}
                  style={{ justifyContent: 'center', fontSize: 11 }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#3b82f6', fontWeight: 600 }}>Register</Link>
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
