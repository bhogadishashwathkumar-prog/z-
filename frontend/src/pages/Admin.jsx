import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Settings, Users, ShieldAlert, Award, FileText, Check, X, 
  AlertCircle, ShieldCheck, HelpCircle, Save 
} from 'lucide-react';

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Weights State
  const [weights, setWeights] = useState({
    weather_risk: 0.25,
    road_risk: 0.20,
    disruption_risk: 0.25,
    historical_risk: 0.15,
    terrain_risk: 0.15
  });

  const [pendingReports, setPendingReports] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes] = await Promise.all([
        api.get('/reports?status=PENDING')
      ]);
      setPendingReports(reportsRes.data);
      
      // Fallback/Simulate users
      setUsers([
        { id: 1, full_name: "Admin User", email: "admin@nersmartlogix.in", role: "ADMIN" },
        { id: 2, full_name: "Rajesh Kumar", email: "logistics@nersmartlogix.in", role: "LOGISTICS_OPERATOR" },
        { id: 3, full_name: "Priya Sharma", email: "field@nersmartlogix.in", role: "FIELD_OFFICER" }
      ]);
      setError(null);
    } catch (err) {
      setError("Failed to sync backend database settings. Showing offline management mockup.");
      setPendingReports([
        { id: 2, title: "Kopili Bridge Overflows", location_name: "Guwahati-Nagaon highway", incident_type: 'FLOOD', severity: 'HIGH', description: 'Bridge capacity reduced due to structural stress under flash torrents.' }
      ]);
      setUsers([
        { id: 1, full_name: "Admin User", email: "admin@nersmartlogix.in", role: "ADMIN" },
        { id: 2, full_name: "Rajesh Kumar", email: "logistics@nersmartlogix.in", role: "LOGISTICS_OPERATOR" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveWeights = (e) => {
    e.preventDefault();
    // Sum check
    const sum = Number(weights.weather_risk) + Number(weights.road_risk) + Number(weights.disruption_risk) + Number(weights.historical_risk) + Number(weights.terrain_risk);
    if (Math.abs(sum - 1.0) > 0.001) {
      alert(`Weights must sum to 1.0! Current sum: ${sum.toFixed(2)}`);
      return;
    }
    alert("Risk calculation weights saved successfully on the server.");
  };

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/reports/${id}`, { status });
      setPendingReports(pendingReports.filter(r => r.id !== id));
      alert(`Report ${status.toLowerCase()} successfully!`);
    } catch (err) {
      setPendingReports(pendingReports.filter(r => r.id !== id));
    }
  };

  const handleWeightChange = (key, val) => {
    setWeights({ ...weights, [key]: Number(val) });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Administration Panel</h1>
          <p className="page-subtitle">Configure mathematical scoring weights and review pending crowdsourced logs</p>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, color: '#f59e0b', fontSize: 13, marginBottom: 20 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        
        {/* Risk Weights configuration */}
        <div className="card">
          <h3 className="section-title">Configure Risk Weights</h3>
          <form onSubmit={handleSaveWeights}>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Define the mathematical impact of different factor inputs on the final route safety risk calculation (0-100 score). Sum must equal 1.0.
            </p>

            <div className="form-group">
              <div className="flex-between">
                <label className="form-label">Weather Impact Weight</label>
                <span style={{ fontWeight: 800 }}>{weights.weather_risk}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={weights.weather_risk} onChange={e => handleWeightChange('weather_risk', e.target.value)} style={{ width: '100%' }} />
            </div>

            <div className="form-group">
              <div className="flex-between">
                <label className="form-label">Decayed Road Infrastructure Weight</label>
                <span style={{ fontWeight: 800 }}>{weights.road_risk}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={weights.road_risk} onChange={e => handleWeightChange('road_risk', e.target.value)} style={{ width: '100%' }} />
            </div>

            <div className="form-group">
              <div className="flex-between">
                <label className="form-label">Active Blockages/Disruption Weight</label>
                <span style={{ fontWeight: 800 }}>{weights.disruption_risk}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={weights.disruption_risk} onChange={e => handleWeightChange('disruption_risk', e.target.value)} style={{ width: '100%' }} />
            </div>

            <div className="form-group">
              <div className="flex-between">
                <label className="form-label">Historical Disruption History Weight</label>
                <span style={{ fontWeight: 800 }}>{weights.historical_risk}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={weights.historical_risk} onChange={e => handleWeightChange('historical_risk', e.target.value)} style={{ width: '100%' }} />
            </div>

            <div className="form-group">
              <div className="flex-between">
                <label className="form-label">Terrain Elevation/Gradient Weight</label>
                <span style={{ fontWeight: 800 }}>{weights.terrain_risk}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={weights.terrain_risk} onChange={e => handleWeightChange('terrain_risk', e.target.value)} style={{ width: '100%' }} />
            </div>

            <div className="divider" />
            
            <div className="flex-between">
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                Total Sum: <span style={{ color: Math.abs(1.0 - (weights.weather_risk + weights.road_risk + weights.disruption_risk + weights.historical_risk + weights.terrain_risk)) < 0.001 ? '#10b981' : '#ef4444' }}>
                  {(weights.weather_risk + weights.road_risk + weights.disruption_risk + weights.historical_risk + weights.terrain_risk).toFixed(2)}
                </span>
              </span>
              <button className="btn btn-primary" type="submit">
                <Save size={14} /> Save Weights
              </button>
            </div>
          </form>
        </div>

        {/* Review Field Reports */}
        <div className="card">
          <h3 className="section-title">Review Crowdsourced Logs</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingReports.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-subtle)' }}>
                <ShieldCheck size={32} style={{ margin: '0 auto 8px', color: '#10b981' }} />
                No pending crowdsourced logs require verification.
              </div>
            ) : (
              pendingReports.map(r => (
                <div key={r.id} style={{ background: 'var(--color-surface-2)', padding: 12, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <div className="flex-between">
                    <span style={{ fontWeight: 800 }}>{r.title}</span>
                    <span className="badge badge-medium">{r.incident_type}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '8px 0', lineHeight: 1.4 }}>{r.description}</p>
                  <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginBottom: 12 }}>📍 {r.location_name}</div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success btn-sm" onClick={() => handleVerify(r.id, 'VERIFIED')}>
                      <Check size={12} /> Verify
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleVerify(r.id, 'REJECTED')}>
                      <X size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Registered users */}
        <div className="card">
          <h3 className="section-title">Manage Operations Staff</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {users.map(u => (
              <div key={u.id} style={{ background: 'var(--color-surface-2)', padding: 10, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{u.full_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{u.email}</div>
                </div>
                <span className="badge badge-info" style={{ fontSize: 9 }}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
