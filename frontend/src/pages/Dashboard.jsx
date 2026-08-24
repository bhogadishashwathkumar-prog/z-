import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  AlertTriangle, CheckCircle, ShieldAlert, Truck, Package, 
  MapPin, CloudRain, ShieldCheck, FileText, ArrowRight, Activity,
  Route, Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsRes, alertsRes, reportsRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/alerts?limit=5'),
          api.get('/reports?limit=5')
        ]);
        setStats(statsRes.data);
        setRecentAlerts(alertsRes.data);
        setRecentReports(reportsRes.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch live dashboard stats. Using demo values.");
        // Fallback demo stats for SIH presentation
        setStats({
          vehicles: { total: 6, active: 4, at_risk: 1 },
          deliveries: { total: 8, active: 4, delayed: 2 },
          alerts: { total: 6, critical: 1 },
          field_reports: { total: 6, critical: 1 },
          routes: { avg_risk: 42.5, avg_accessibility: 72.8, high_risk_count: 2 }
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Demo Charts Data
  const riskTrendData = [
    { name: 'Mon', GuwahatiShillong: 25, SilcharImphal: 45, TawangItanagar: 70 },
    { name: 'Tue', GuwahatiShillong: 30, SilcharImphal: 48, TawangItanagar: 82 },
    { name: 'Wed', GuwahatiShillong: 55, SilcharImphal: 40, TawangItanagar: 85 },
    { name: 'Thu', GuwahatiShillong: 40, SilcharImphal: 65, TawangItanagar: 60 },
    { name: 'Fri', GuwahatiShillong: 28, SilcharImphal: 72, TawangItanagar: 55 },
    { name: 'Sat', GuwahatiShillong: 20, SilcharImphal: 55, TawangItanagar: 45 },
    { name: 'Sun', GuwahatiShillong: 15, SilcharImphal: 35, TawangItanagar: 38 },
  ];

  const deliveryPerformance = [
    { name: 'Guwahati', OnTime: 12, Delayed: 2 },
    { name: 'Shillong', OnTime: 8, Delayed: 1 },
    { name: 'Imphal', OnTime: 5, Delayed: 3 },
    { name: 'Itanagar', OnTime: 4, Delayed: 2 },
    { name: 'Aizawl', OnTime: 6, Delayed: 1 },
    { name: 'Agartala', OnTime: 9, Delayed: 0 },
  ];

  const incidentDistribution = [
    { name: 'Landslides', value: 4, color: '#dc2626' },
    { name: 'Flooding', value: 3, color: '#3b82f6' },
    { name: 'Roadblocks', value: 2, color: '#f59e0b' },
    { name: 'Bridge Damage', value: 1, color: '#a78bfa' },
  ];

  if (loading && !stats) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ height: 40, width: 250 }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
          {Array(4).fill(0).map((_, i) => <div key={i} style={{ height: 100 }} className="skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Command Center</h1>
          <p className="page-subtitle">AI & GIS Intelligence Hub for North Eastern Region Logistics</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => navigate('/route-planner')}>
            <Route size={16} /> Plan a Route
          </button>
          <button className="btn btn-danger" onClick={() => navigate('/emergency')}>
            <Zap size={16} /> Emergency SOS
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, color: '#f59e0b', fontSize: 13, marginBottom: 20 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="card-stat">
          <div className="flex-between">
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>ACTIVE DELIVERIES</span>
            <Package size={18} className="text-primary" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{stats?.deliveries?.active}</div>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
            <span className="text-danger" style={{ fontWeight: 600 }}>{stats?.deliveries?.delayed} Delayed</span> in transit
          </div>
        </div>

        <div className="card-stat">
          <div className="flex-between">
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>TRACKED VEHICLES</span>
            <Truck size={18} className="text-accent" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{stats?.vehicles?.active} / {stats?.vehicles?.total}</div>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
            <span className="text-warning" style={{ fontWeight: 600 }}>{stats?.vehicles?.at_risk} At Risk</span> segments
          </div>
        </div>

        <div className="card-stat">
          <div className="flex-between">
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>CRITICAL ALERTS</span>
            <ShieldAlert size={18} className="text-danger" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: stats?.alerts?.critical > 0 ? '#ef4444' : 'inherit' }}>
            {stats?.alerts?.critical}
          </div>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
            Total active alerts: {stats?.alerts?.total}
          </div>
        </div>

        <div className="card-stat">
          <div className="flex-between">
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>ACCESSIBILITY PROFILE</span>
            <ShieldCheck size={18} className="text-accent" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{stats?.routes?.avg_accessibility}%</div>
          <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
            Average reliability score: {Math.round(100 - (stats?.routes?.avg_risk || 40))}%
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Operations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 20, marginBottom: 24 }}>
        
        {/* Risk trends chart */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Route Risk Trends (Weekly)</h3>
            <span className="badge badge-info">AI Risk Engine</span>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', color: '#f1f5f9' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="GuwahatiShillong" name="Guwahati-Shillong corridor" stroke="#3b82f6" fillOpacity={1} fill="url(#colorG)" />
                <Area type="monotone" dataKey="SilcharImphal" name="Silchar-Imphal route" stroke="#f59e0b" fillOpacity={1} fill="url(#colorS)" />
                <Area type="monotone" dataKey="TawangItanagar" name="Tawang-Itanagar pass" stroke="#ef4444" fillOpacity={1} fill="url(#colorT)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deliveries Bar Chart */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Delivery Reliability by Region</h3>
            <span className="badge badge-low">Live Stats</span>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', color: '#f1f5f9' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="OnTime" name="On Time" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Delayed" name="Delayed" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        
        {/* Active Alerts Widget */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 14 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Alert Feed</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {recentAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-subtle)' }}>
                <CheckCircle size={32} style={{ margin: '0 auto 8px', color: '#10b981' }} />
                No active critical alerts in the system.
              </div>
            ) : (
              recentAlerts.map(a => (
                <div key={a.id} className={`alert-item alert-${a.severity.toLowerCase()}`}>
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className="flex-between">
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{a.title}</span>
                      <span className={`badge badge-${a.severity.toLowerCase()}`}>{a.severity}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{a.message}</span>
                    <span style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginTop: 6, display: 'flex', gap: 12 }}>
                      <span>📍 {a.location_name || 'System'}</span>
                      <span>⏱️ {new Date(a.created_at).toLocaleTimeString()}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Incident Distribution Pie Chart */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 14 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Reported Incident Share</h3>
            <span className="badge badge-low">Field Intelligence</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 260 }}>
            <div style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={incidentDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={4} dataKey="value">
                    {incidentDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {incidentDistribution.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                  <span className="text-muted">{item.name}:</span>
                  <span style={{ fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Field Reports Feed */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 14 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Field Reports</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {recentReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-subtle)' }}>
                <FileText size={32} style={{ margin: '0 auto 8px' }} />
                No field reports submitted today.
              </div>
            ) : (
              recentReports.map(r => (
                <div key={r.id} className="alert-item" style={{ borderLeft: `3px solid ${r.severity === 'CRITICAL' || r.severity === 'HIGH' ? '#ef4444' : '#f59e0b'}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className="flex-between">
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</span>
                      <span className={`badge badge-${r.severity.toLowerCase()}`}>{r.incident_type}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{r.description}</span>
                    <span style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginTop: 6, display: 'flex', gap: 12 }}>
                      <span>📍 {r.location_name}</span>
                      <span>👤 {r.reporter_name}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
