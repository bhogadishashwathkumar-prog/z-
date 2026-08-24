import React, { useState } from 'react';
import api from '../services/api';
import { 
  Zap, Heart, ShieldAlert, AlertTriangle, Compass, MapPin, 
  Map, Loader, CloudRain, ShieldCheck 
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const EMERGENCY_TYPES = [
  { value: 'MEDICAL', label: '🏥 Medical Supplies Emergency' },
  { value: 'DISASTER', label: '🌋 Natural Disaster Relief' },
  { value: 'FOOD_SUPPLY', label: '🍞 Critical Food Shortage' },
  { value: 'RESCUE', label: '🛶 Search & Rescue Dispatch' },
  { value: 'ESSENTIAL_SUPPLIES', label: '🔌 Essential Power/Water gear' }
];

export default function Emergency() {
  const [source, setSource] = useState('Guwahati');
  const [destination, setDestination] = useState('Shillong');
  const [emergencyType, setEmergencyType] = useState('MEDICAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSOSRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/routes/analyze', {
        source,
        destination,
        delivery_type: emergencyType,
        priority: 'EMERGENCY',
        vehicle_type: 'SUV'
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to plan SOS corridor using live DB. Displaying offline emergency routing simulation.");
      // Fallback SOS simulation
      setResult({
        recommended_route: {
          route_id: 'sos-rec',
          source,
          destination,
          distance_km: 110.2, // Slightly longer bypass path
          eta_minutes: 190,
          risk_score: 18.0, // Prioritized safety (lower risk score)
          accessibility_score: 88.5,
          weather_risk: 'LOW',
          road_condition: 'GOOD',
          is_recommended: true,
          waypoints: [
            [91.7362, 26.1445], // Guwahati
            [91.9500, 25.7500], // Safe bypass coordinates
            [91.8933, 25.5788]  // Shillong
          ],
          ai_explanation: "SAFETY ROUTE DETOUR RECOMMENDED:\nThis route detours from NH-6 to avoid active flooding risk at the Kopili River pass. Although it adds 12km and 25 minutes of travel time, safety factors score 88% higher than the shortest path option."
        },
        alternatives: [
          {
            route_id: 'sos-alt-1',
            source,
            destination,
            distance_km: 98.4, // Shortest route
            eta_minutes: 165,
            risk_score: 72.0, // extremely high hazard
            accessibility_score: 30.0,
            weather_risk: 'CRITICAL',
            road_condition: 'POOR',
            waypoints: [
              [91.7362, 26.1445],
              [91.8933, 25.5788]
            ]
          }
        ],
        is_demo: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Page Title */}
      <div className="page-header" style={{ marginBottom: 12 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
            <Zap size={22} fill="#ef4444" /> Emergency SOS Dispatch Routing
          </h1>
          <p className="page-subtitle">Prioritize safety, reliable bridges, and disaster detours over shortest distances</p>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: 16, overflow: 'hidden' }}>
        
        {/* Left SOS Panel Form */}
        <div style={{ width: '38%', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          
          <form onSubmit={handleSOSRoute} className="card" style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'linear-gradient(180deg, rgba(239,68,68,0.02), transparent)' }}>
            <h3 className="section-title" style={{ color: '#ef4444' }}>SOS Parameters</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">SOS Source</label>
                <input className="form-input" value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. Guwahati" required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">SOS Destination</label>
                <input className="form-input" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Shillong" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Type</label>
              <select className="form-select" value={emergencyType} onChange={e => setEmergencyType(e.target.value)}>
                {EMERGENCY_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>

            <button className="btn btn-danger" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', fontWeight: 800 }}>
              {loading ? <><Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Calculating safest path...</> : 'Evaluate Safe SOS Corridor'}
            </button>
          </form>

          {error && (
            <div style={{ padding: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 12 }}>
              {error}
            </div>
          )}

          {/* SOS Comparison Result */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              
              {/* Safest route recommended */}
              <div className="card" style={{ borderColor: '#10b981', background: 'rgba(16,185,129,0.02)' }}>
                <div className="flex-between">
                  <span className="badge badge-low" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={12} /> RECOMMENDED (SAFE BYPASS)
                  </span>
                  <span style={{ fontWeight: 800 }}>{result.recommended_route.distance_km} km</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10, textAlign: 'center' }}>
                  <div style={{ background: 'var(--color-surface-2)', padding: 6, borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 600 }}>ETA</div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{Math.floor(result.recommended_route.eta_minutes / 60)}h {result.recommended_route.eta_minutes % 60}m</div>
                  </div>
                  <div style={{ background: 'var(--color-surface-2)', padding: 6, borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 600 }}>RISK SCORE</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>{result.recommended_route.risk_score} (LOW)</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.5, background: 'var(--color-surface-2)', padding: 10, borderRadius: 6 }}>
                  {result.recommended_route.ai_explanation}
                </div>
              </div>

              {/* Dangerous Shortest Route Warning */}
              {result.alternatives[0] && (
                <div className="card" style={{ borderColor: '#ef4444', background: 'rgba(239,68,68,0.02)' }}>
                  <div className="flex-between">
                    <span className="badge badge-critical" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} /> SHORTEST PATH (DANGEROUS)
                    </span>
                    <span style={{ fontWeight: 800, color: '#ef4444' }}>{result.alternatives[0].distance_km} km</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10, textAlign: 'center' }}>
                    <div style={{ background: 'var(--color-surface-2)', padding: 6, borderRadius: 6 }}>
                      <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 600 }}>ETA</div>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{Math.floor(result.alternatives[0].eta_minutes / 60)}h {result.alternatives[0].eta_minutes % 60}m</div>
                    </div>
                    <div style={{ background: 'var(--color-surface-2)', padding: 6, borderRadius: 6 }}>
                      <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 600 }}>RISK SCORE</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#ef4444' }}>{result.alternatives[0].risk_score} (HIGH)</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#fca5a5', marginTop: 10, fontStyle: 'italic' }}>
                    ⚠️ This corridor has active flooding risk warnings. Avoid for emergency cargo transit.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

        {/* SOS GIS Map */}
        <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <MapContainer center={[26.1445, 91.7362]} zoom={8} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {result?.recommended_route?.waypoints && (
              <>
                {/* Safe recommended route = GREEN polyline */}
                <Polyline 
                  positions={result.recommended_route.waypoints.map(p => [p[1], p[0]])} 
                  color="#10b981" 
                  weight={6} 
                  opacity={0.9} 
                />
                <Marker position={[result.recommended_route.waypoints[0][1], result.recommended_route.waypoints[0][0]]}>
                  <Popup>Start SOS dispatch</Popup>
                </Marker>
                <Marker position={[result.recommended_route.waypoints[result.recommended_route.waypoints.length - 1][1], result.recommended_route.waypoints[result.recommended_route.waypoints.length - 1][0]]}>
                  <Popup>SOS Destination</Popup>
                </Marker>
              </>
            )}

            {/* Dangerous route = RED polyline */}
            {result?.alternatives[0]?.waypoints && (
              <Polyline 
                positions={result.alternatives[0].waypoints.map(p => [p[1], p[0]])} 
                color="#ef4444" 
                weight={4} 
                dashArray="5, 10" 
                opacity={0.7} 
              />
            )}
          </MapContainer>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
