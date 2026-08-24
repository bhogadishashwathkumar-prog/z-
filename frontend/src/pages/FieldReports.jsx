import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { 
  FileText, Search, Plus, MapPin, AlertCircle, Check, X, 
  RefreshCw, CloudLightning, ShieldAlert, CloudRain, WifiOff, Wifi 
} from 'lucide-react';

const INCIDENT_TYPES = ['ROADBLOCK', 'FLOOD', 'LANDSLIDE', 'ACCIDENT', 'DAMAGED_ROAD', 'BRIDGE_DAMAGE', 'WEATHER', 'OTHER'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function FieldReports() {
  const { user } = useAuth();
  const { isOnline, pendingReports, saveOfflineReport, clearPendingReport } = useOffline();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // New report form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    location_name: '',
    latitude: 26.1445,
    longitude: 91.7362,
    incident_type: 'ROADBLOCK',
    severity: 'MEDIUM',
    description: '',
    image_url: ''
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      setReports(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch field reports. Showing offline simulated lists.");
      setReports([
        { id: 1, title: "NH-2 Landslide", location_name: "Meghalaya Bypass", latitude: 25.4788, longitude: 91.7933, incident_type: 'LANDSLIDE', severity: 'CRITICAL', description: 'Road blocked by major mudslide near Shillong peak bypass. 100m segment affected.', status: 'VERIFIED', reporter_name: "Priya Sharma", created_at: new Date().toISOString(), affects_route: true },
        { id: 2, title: "Kopili River Overflow", location_name: "Kopili Bridge Assam", latitude: 26.3500, longitude: 92.8833, incident_type: 'FLOOD', severity: 'HIGH', description: 'Bridge under high water threat. Heavy vehicles halted.', status: 'PENDING', reporter_name: "Rajesh Kumar", created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), affects_route: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Syncing pending offline reports when connection returns
  useEffect(() => {
    if (isOnline && pendingReports.length > 0 && !syncing) {
      const syncReports = async () => {
        setSyncing(true);
        console.log("Syncing pending reports with backend...");
        for (const report of pendingReports) {
          try {
            const cleanReport = { ...report };
            delete cleanReport.offline_id;
            delete cleanReport.pending;
            
            const res = await api.post('/reports', cleanReport);
            setReports(prev => [res.data, ...prev]);
            clearPendingReport(report.offline_id);
          } catch (err) {
            console.error("Failed to sync report", report, err);
          }
        }
        setSyncing(false);
      };
      syncReports();
    }
  }, [isOnline, pendingReports, syncing]);

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isOnline) {
      // Offline mode saving
      saveOfflineReport(newReport);
      setShowAddForm(false);
      alert("OFFLINE MODE: Report saved locally. It will automatically synchronize when connection returns.");
      return;
    }

    try {
      const res = await api.post('/reports', newReport);
      setReports([res.data, ...reports]);
      setShowAddForm(false);
      setNewReport({ title: '', location_name: '', latitude: 26.1445, longitude: 91.7362, incident_type: 'ROADBLOCK', severity: 'MEDIUM', description: '', image_url: '' });
    } catch (err) {
      // Local fallback on error
      saveOfflineReport(newReport);
      setShowAddForm(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      const res = await api.put(`/reports/${id}`, { status });
      setReports(reports.map(r => r.id === id ? { ...r, status: res.data.status } : r));
    } catch (err) {
      setReports(reports.map(r => r.id === id ? { ...r, status } : r));
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div>
      {/* Offline sync notifications */}
      {syncing && (
        <div style={{ padding: 12, background: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f6', color: '#60a5fa', borderRadius: 8, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
          SYNCING PENDING REPORTS ({pendingReports.length} left)...
        </div>
      )}

      {!isOnline && (
        <div style={{ padding: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: 8, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <WifiOff size={16} />
          OFFLINE MODE: Reports will be saved locally to sync queue.
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">NER Field Incident Reports</h1>
          <p className="page-subtitle">Crowdsourced hazard logs reported by field officers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} /> Submit Incident
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: 20, maxWidth: 620 }}>
          <h3 className="section-title" style={{ margin: '0 0 14px 0' }}>Report New Hazard Incident</h3>
          <div className="form-group">
            <label className="form-label">Incident Headline</label>
            <input className="form-input" placeholder="e.g. NH-44 Landslide obstruction" value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Location description</label>
              <input className="form-input" placeholder="e.g. 5km north of Nongpoh" value={newReport.location_name} onChange={e => setNewReport({...newReport, location_name: e.target.value})} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input className="form-input" type="number" step="0.0001" value={newReport.latitude} onChange={e => setNewReport({...newReport, latitude: Number(e.target.value)})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input className="form-input" type="number" step="0.0001" value={newReport.longitude} onChange={e => setNewReport({...newReport, longitude: Number(e.target.value)})} required />
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Incident type</label>
              <select className="form-select" value={newReport.incident_type} onChange={e => setNewReport({...newReport, incident_type: e.target.value})}>
                {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <select className="form-select" value={newReport.severity} onChange={e => setNewReport({...newReport, severity: e.target.value})}>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea className="form-textarea" placeholder="Detail any road blocks, alternate paths, bridge weight limits..." value={newReport.description} onChange={e => setNewReport({...newReport, description: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Report</button>
          </div>
        </form>
      )}

      {/* Offline Pending Reports Panel */}
      {pendingReports.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--color-warning)' }}>
          <h4 style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <WifiOff size={15} /> Queue of Pending Offline Reports ({pendingReports.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingReports.map(pr => (
              <div key={pr.offline_id} style={{ background: 'var(--color-surface-2)', padding: 10, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700 }}>{pr.title}</span>
                  <span className="badge badge-medium" style={{ marginLeft: 8 }}>{pr.incident_type}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>Pending sync</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Feed */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Incident details</th>
                <th>Incident Type</th>
                <th>Severity</th>
                <th>Location</th>
                <th>Reporter</th>
                <th>Affects Routing?</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{r.description}</div>
                  </td>
                  <td><span className="badge badge-info" style={{ fontSize: 10 }}>{r.incident_type}</span></td>
                  <td>
                    <span className={`badge badge-${r.severity.toLowerCase()}`}>{r.severity}</span>
                  </td>
                  <td>
                    <div>{r.location_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)}</div>
                  </td>
                  <td>{r.reporter_name || 'Anonymous'}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: r.affects_route ? '#ef4444' : '#10b981' }}>
                      {r.affects_route ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${r.status === 'VERIFIED' ? 'low' : r.status === 'REJECTED' ? 'critical' : 'medium'}`}>
                      {r.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      {r.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleVerify(r.id, 'VERIFIED')}>
                            <Check size={12} /> Verify
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleVerify(r.id, 'REJECTED')}>
                            <X size={12} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
