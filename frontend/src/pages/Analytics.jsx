import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, Award, AlertCircle } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch server analytics. Showing simulated historical reports.");
        setData({
          vehicles: { total: 6, active: 4, at_risk: 1 },
          deliveries: { total: 8, active: 4, delayed: 2 },
          routes: { avg_risk: 42.5, avg_accessibility: 72.8, high_risk_count: 2 }
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const routeReliabilityHistory = [
    { month: 'Jan', NH6_GuwahatiShillong: 92, NH37_JorhatGuwahati: 88, NH39_DimapurImphal: 72 },
    { month: 'Feb', NH6_GuwahatiShillong: 94, NH37_JorhatGuwahati: 90, NH39_DimapurImphal: 75 },
    { month: 'Mar', NH6_GuwahatiShillong: 91, NH37_JorhatGuwahati: 85, NH39_DimapurImphal: 68 },
    { month: 'Apr', NH6_GuwahatiShillong: 88, NH37_JorhatGuwahati: 82, NH39_DimapurImphal: 60 },
    { month: 'May', NH6_GuwahatiShillong: 78, NH37_JorhatGuwahati: 70, NH39_DimapurImphal: 48 }, // Monsoons start
    { month: 'Jun', NH6_GuwahatiShillong: 62, NH37_JorhatGuwahati: 55, NH39_DimapurImphal: 35 },
    { month: 'Jul', NH6_GuwahatiShillong: 58, NH37_JorhatGuwahati: 52, NH39_DimapurImphal: 28 },
    { month: 'Aug', NH6_GuwahatiShillong: 65, NH37_JorhatGuwahati: 58, NH39_DimapurImphal: 32 }
  ];

  const delayCauses = [
    { cause: 'Landslides', count: 18, color: '#dc2626' },
    { cause: 'Flash Floods', count: 14, color: '#3b82f6' },
    { cause: 'Heavy Rainfall/Fog', count: 12, color: '#a78bfa' },
    { cause: 'Bridge Maintenance', count: 5, color: '#f59e0b' },
    { cause: 'Vehicle Breakdown', count: 4, color: '#10b981' }
  ];

  const regionalAccessibility = [
    { state: 'Assam', score: 85 },
    { state: 'Tripura', score: 80 },
    { state: 'Meghalaya', score: 68 },
    { state: 'Nagaland', score: 55 },
    { state: 'Manipur', score: 50 },
    { state: 'Mizoram', score: 48 },
    { state: 'Arunachal', score: 42 },
    { state: 'Sikkim', score: 38 }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">NER Logistics Analytics</h1>
          <p className="page-subtitle">Historical trends, monsoon impacts, and accessibility statistics</p>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, color: '#f59e0b', fontSize: 13, marginBottom: 20 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Summary Row */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-subtle)' }}>AVG REGIONAL ACCESSIBILITY</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4, color: '#10b981' }}>{data?.routes?.avg_accessibility || 72.8}%</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-subtle)' }}>AVG HAZARD RISK PROFILE</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4, color: '#ef4444' }}>{data?.routes?.avg_risk || 42.5}/100</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-subtle)' }}>HIGH RISK SECTOR COUNT</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4, color: '#f59e0b' }}>{data?.routes?.high_risk_count || 2} Sectors</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 20, marginBottom: 20 }}>
        
        {/* Reliability Line Chart */}
        <div className="card">
          <h3 className="section-title">Corridor Reliability Indexes (Monsoon Impact)</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={routeReliabilityHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', color: '#f1f5f9' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="NH6_GuwahatiShillong" name="NH-6 (Guwahati-Shillong)" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="NH37_JorhatGuwahati" name="NH-37 (Jorhat-Guwahati)" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="NH39_DimapurImphal" name="NH-39 (Dimapur-Imphal)" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Accessibility Bar Chart */}
        <div className="card">
          <h3 className="section-title">Average Accessibility Scores by State</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalAccessibility} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="state" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', color: '#f1f5f9' }} />
                <Bar dataKey="score" name="Accessibility Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Delay Causes Pie Chart */}
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h3 className="section-title" style={{ textAlign: 'center' }}>Primary Delay Causes (Active Season)</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 240 }}>
          <div style={{ width: 140, height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={delayCauses} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={4} dataKey="count">
                  {delayCauses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {delayCauses.map(item => (
              <div key={item.cause} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                <span className="text-muted">{item.cause}:</span>
                <span style={{ fontWeight: 700 }}>{item.count} reports</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
