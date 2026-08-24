import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, AlertTriangle, AlertCircle, Plus, Check, Info, 
  MapPin, ShieldAlert, Filter, Trash2 
} from 'lucide-react';

const ALERT_SEVERITIES = ['INFO', 'WARNING', 'HIGH', 'CRITICAL'];
const ALERT_TYPES = ['WEATHER', 'ROAD', 'DISRUPTION', 'EMERGENCY', 'SYSTEM', 'DELIVERY'];

export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [severityFilter, setSeverityFilter] = useState('ALL');
  
  // Create alert form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    location_name: '',
    alert_type: 'SYSTEM',
    severity: 'INFO'
  });

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/alerts');
      setAlerts(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch alerts. Loading offline cached notifications.");
      // Fallback demo data
      setAlerts([
        { id: 1, title: "CRITICAL: Landslide on NH-2 Meghalaya", message: "Major landslide blocking NH-2 near Nongstoin. All vehicles must use alternative route via Mairang.", severity: 'CRITICAL', alert_type: 'ROAD', location_name: "NH-2 Meghalaya", created_at: new Date().toISOString() },
        { id: 2, title: "Heavy Rainfall Warning", message: "IMD has issued heavy rainfall warning for Meghalaya, Assam, and Arunachal Pradesh.", severity: 'HIGH', alert_type: 'WEATHER', location_name: "NER Region", created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { id: 3, title: "System Alert: Demo Mode Active", message: "NER SmartLogix is running in DEMO MODE. Data shown is simulated.", severity: 'INFO', alert_type: 'SYSTEM', location_name: "System", created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/alerts', newAlert);
      setAlerts([res.data, ...alerts]);
      setShowAddForm(false);
      setNewAlert({ title: '', message: '', location_name: '', alert_type: 'SYSTEM', severity: 'INFO' });
    } catch (err) {
      alert("Failed to save alert on server. Creating in local state only.");
      const mockNew = {
        id: Date.now(),
        ...newAlert,
        created_at: new Date().toISOString()
      };
      setAlerts([mockNew, ...alerts]);
      setShowAddForm(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/alerts/${id}`, { status: 'RESOLVED' });
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      setAlerts(alerts.filter(a => a.id !== id));
    }
  };

  const filteredAlerts = severityFilter === 'ALL' 
    ? alerts 
    : alerts.filter(a => a.severity.toUpperCase() === severityFilter);

  // Checks if user can create alerts (operator or admin)
  const canManageAlerts = user?.role === 'ADMIN' || user?.role === 'LOGISTICS_OPERATOR';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">NER Security & Weather Alerts</h1>
          <p className="page-subtitle">Real-time alerts affecting regional transport corridors</p>
        </div>
        {canManageAlerts && (
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={16} /> Broadcast Alert
          </button>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, color: '#f59e0b', fontSize: 13, marginBottom: 20 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Broadcast Alert Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: 20, maxWidth: 600 }}>
          <h3 className="section-title" style={{ margin: '0 0 14px 0' }}>Broadcast Regional Alert</h3>
          <div className="form-group">
            <label className="form-label">Alert Title</label>
            <input className="form-input" placeholder="e.g. Kopili River Flooding" value={newAlert.title} onChange={e => setNewAlert({...newAlert, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Message Details</label>
            <textarea className="form-textarea" placeholder="Detailed description of roadblock, severity, alternate paths..." value={newAlert.message} onChange={e => setNewAlert({...newAlert, message: e.target.value})} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Region/Location</label>
              <input className="form-input" placeholder="e.g. NH-37, Jorhat" value={newAlert.location_name} onChange={e => setNewAlert({...newAlert, location_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Alert Type</label>
              <select className="form-select" value={newAlert.alert_type} onChange={e => setNewAlert({...newAlert, alert_type: e.target.value})}>
                {ALERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select className="form-select" value={newAlert.severity} onChange={e => setNewAlert({...newAlert, severity: e.target.value})}>
                {ALERT_SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Broadcast</button>
          </div>
        </form>
      )}

      {/* Filter and Content */}
      <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          <Filter size={15} /> Filter Severity:
        </span>
        {['ALL', ...ALERT_SEVERITIES].map(sev => (
          <button key={sev} className="btn btn-ghost btn-sm font-bold" 
            style={severityFilter === sev ? { background: 'var(--color-primary-glow)', color: 'var(--color-primary)' } : {}}
            onClick={() => setSeverityFilter(sev)}>
            {sev}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredAlerts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-subtle)' }}>
            <Bell size={48} style={{ margin: '0 auto 12px' }} />
            No active alerts matching filter.
          </div>
        ) : (
          filteredAlerts.map(a => (
            <div key={a.id} className={`card alert-item alert-${(a.severity || 'INFO').toLowerCase()}`} style={{ padding: 18, borderLeftWidth: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>{a.title}</span>
                    <span className="badge badge-info">{a.alert_type}</span>
                    <span className={`badge badge-${(a.severity || 'INFO').toLowerCase()}`}>{a.severity}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8, lineHeight: 1.5 }}>{a.message}</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 12 }}>
                    <span>📍 location: <strong>{a.location_name || 'System'}</strong></span>
                    <span>⏱️ Broadcasted: {new Date(a.created_at).toLocaleString()}</span>
                  </div>
                </div>
                {canManageAlerts && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleResolve(a.id)} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={16} /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
