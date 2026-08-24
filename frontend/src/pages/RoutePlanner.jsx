import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useOffline } from '../context/OfflineContext';
import { 
  MapContainer, TileLayer, Marker, Popup, Polyline, useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, Route, Navigation, AlertTriangle, CloudRain, 
  ShieldAlert, Settings, Brain, Info, CheckCircle, HelpCircle 
} from 'lucide-react';

// Fix Leaflet marker icon asset mapping in Vite builds
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to center map on coordinates
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom]);
  return null;
}

const VEHICLE_TYPES = ['TRUCK', 'VAN', 'MOTORCYCLE', 'HELICOPTER', 'BOAT', 'SUV'];
const PRIORITY_LEVELS = ['NORMAL', 'HIGH', 'EMERGENCY'];

export default function RoutePlanner() {
  const { isOnline } = useOffline();
  const [source, setSource] = useState('Guwahati');
  const [destination, setDestination] = useState('Shillong');
  const [vehicleType, setVehicleType] = useState('TRUCK');
  const [priority, setPriority] = useState('NORMAL');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  // Default coordinate center (NER Guwahati)
  const [mapCenter, setMapCenter] = useState([26.1445, 91.7362]);
  const [mapZoom, setMapZoom] = useState(8);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!source || !destination) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/routes/analyze', {
        source,
        destination,
        vehicle_type: vehicleType,
        priority
      });
      setAnalysisResult(res.data);
      const recommended = res.data.recommended_route;
      setSelectedRoute(recommended);

      // Adjust map center based on source lat/lng if present
      if (recommended.waypoints && recommended.waypoints.length > 0) {
        // Average coordinates for center
        const midPoint = recommended.waypoints[Math.floor(recommended.waypoints.length / 2)];
        if (midPoint) {
          setMapCenter([midPoint[1], midPoint[0]]);
          setMapZoom(9);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Route planning failed. Generating demo alternative routing.");
      // Seed fallback demo routing for simulation
      const mockResult = generateMockRouteAnalysis(source, destination);
      setAnalysisResult(mockResult);
      setSelectedRoute(mockResult.recommended_route);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score <= 30) return '#10b981'; // LOW
    if (score <= 60) return '#f59e0b'; // MEDIUM
    if (score <= 80) return '#ef4444'; // HIGH
    return '#dc2626'; // CRITICAL
  };

  const getAccessibilityColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#60a5fa';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <div>
          <h1 className="page-title">Route Intelligence Planner</h1>
          <p className="page-subtitle">Evaluate safe, reliable corridors across extreme terrain and monsoon barriers</p>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: 16, overflow: 'hidden' }}>
        
        {/* Left Side: Route Controls & Comparison Panel */}
        <div style={{ width: '38%', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', paddingRight: 4 }}>
          
          <form onSubmit={handleAnalyze} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">SOURCE</label>
                <input className="form-input" value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. Guwahati" required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">DESTINATION</label>
                <input className="form-input" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Shillong" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">VEHICLE TYPE</label>
                <select className="form-select" value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">PRIORITY</label>
                <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                  {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}>
              {loading ? 'Analyzing Hazards...' : 'Analyze Route'}
            </button>
          </form>

          {error && (
            <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 12 }}>
              {error}
            </div>
          )}

          {/* Route Comparison Cards */}
          {analysisResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 className="section-title">Analysis Options</h3>

              {/* Recommended Route Card */}
              {[analysisResult.recommended_route, ...analysisResult.alternatives].map((route, i) => {
                const isSelected = selectedRoute?.route_id === route.route_id;
                return (
                  <div key={route.route_id} className={`card`} 
                    style={{ 
                      padding: 14, 
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--color-primary)' : route.is_recommended ? 'rgba(16,185,129,0.3)' : 'var(--color-border)',
                      background: isSelected ? 'var(--color-surface-2)' : 'var(--color-surface)',
                      borderWidth: isSelected ? 2 : 1
                    }}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className="flex-between">
                      <span style={{ fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Route Option {i + 1}
                        {route.is_recommended && (
                          <span className="badge badge-low" style={{ fontSize: 9, padding: '1px 5px' }}>RECOMMENDED</span>
                        )}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{route.distance_km} km</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10, textAlign: 'center' }}>
                      <div style={{ background: 'var(--color-surface-3)', padding: 6, borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 600 }}>TRAVEL TIME</div>
                        <div style={{ fontSize: 12, fontWeight: 800 }}>{Math.floor(route.eta_minutes / 60)}h {route.eta_minutes % 60}m</div>
                      </div>
                      <div style={{ background: 'var(--color-surface-3)', padding: 6, borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 600 }}>RISK SCORE</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: getRiskColor(route.risk_score) }}>{route.risk_score}</div>
                      </div>
                      <div style={{ background: 'var(--color-surface-3)', padding: 6, borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 600 }}>ACCESSIBILITY</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: getAccessibilityColor(route.accessibility_score) }}>{route.accessibility_score}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Detailed scoring panel for Selected Route */}
              {selectedRoute && (
                <div className="card" style={{ padding: 16 }}>
                  <h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Settings size={15} /> Composite Scoring Details
                  </h4>
                  
                  {/* Accessibility gauge simulation */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 14 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: getRiskColor(selectedRoute.risk_score) }}>{selectedRoute.risk_score}/100</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)' }}>SAFETY RISK</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: getAccessibilityColor(selectedRoute.accessibility_score) }}>{selectedRoute.accessibility_score}/100</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)' }}>ACCESSIBILITY</div>
                    </div>
                  </div>

                  {/* Factor Breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    {[
                      { name: 'Weather conditions', val: selectedRoute.risk_factors?.weather_risk || 0 },
                      { name: 'Road terrain difficulty', val: selectedRoute.risk_factors?.terrain_risk || 0 },
                      { name: 'Active physical roadblocks', val: selectedRoute.risk_factors?.disruption_risk || 0 },
                      { name: 'Infrastructure decay risk', val: selectedRoute.risk_factors?.road_risk || 0 },
                      { name: 'Historical record frequency', val: selectedRoute.risk_factors?.historical_risk || 0 },
                    ].map(f => (
                      <div key={f.name} className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 4 }}>
                        <span className="text-muted">{f.name}</span>
                        <span style={{ fontWeight: 700, color: getRiskColor(f.val) }}>{f.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Explanation layer */}
                  {selectedRoute.ai_explanation && (
                    <div style={{ marginTop: 16, padding: 12, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 12, color: 'var(--color-primary)', marginBottom: 6 }}>
                        <Brain size={14} /> AI Decision Insights
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.5, color: '#d1d5db', whiteSpace: 'pre-line' }}>
                        {selectedRoute.ai_explanation}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Side: Big Leaflet Map */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="map-container">
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: '100%', height: '100%' }}>
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Polyline of the selected route coordinates */}
            {selectedRoute?.waypoints && selectedRoute.waypoints.length > 0 && (
              <>
                {/* Recommended polyline style vs Alternative styles */}
                <Polyline 
                  positions={selectedRoute.waypoints.map(p => [p[1], p[0]])} 
                  color={selectedRoute.is_recommended ? '#3b82f6' : '#94a3b8'} 
                  weight={selectedRoute.is_recommended ? 6 : 4}
                  opacity={selectedRoute.is_recommended ? 0.85 : 0.6}
                />
                
                {/* Start & End markers */}
                <Marker position={[selectedRoute.waypoints[0][1], selectedRoute.waypoints[0][0]]}>
                  <Popup>
                    <div style={{ fontWeight: 800 }}>Start Corridor</div>
                    <div>{source}</div>
                  </Popup>
                </Marker>

                <Marker position={[selectedRoute.waypoints[selectedRoute.waypoints.length - 1][1], selectedRoute.waypoints[selectedRoute.waypoints.length - 1][0]]}>
                  <Popup>
                    <div style={{ fontWeight: 800 }}>Destination Hub</div>
                    <div>{destination}</div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}

// Generate fallback mock data when FastAPI backend has geocoding/routing issues (ensures live SIH demo works)
function generateMockRouteAnalysis(source, destination) {
  const waypoints = [
    [91.7362, 26.1445], // Guwahati
    [91.8211, 25.8611], // Nongpoh midpoint
    [91.8933, 25.5788]  // Shillong
  ];

  return {
    recommended_route: {
      route_id: 'mock-recommended',
      source,
      destination,
      distance_km: 98.4,
      eta_minutes: 165,
      risk_score: 28.5,
      accessibility_score: 82.0,
      reliability_score: 86.8,
      weather_risk: 'MEDIUM',
      road_condition: 'GOOD',
      disruption_risk: 'LOW',
      is_recommended: true,
      risk_factors: {
        weather_risk: 32,
        terrain_risk: 25,
        disruption_risk: 15,
        road_risk: 20,
        historical_risk: 18
      },
      waypoints,
      ai_explanation: "[DEMO MODE FALLBACK]\nRoute Option 1 via NH-6 is highly recommended because it bypasses the higher elevation passes prone to heavy rainfall. Road quality is verified as good for truck categories, despite the moderate rain forecast."
    },
    alternatives: [
      {
        route_id: 'mock-alt-1',
        source,
        destination,
        distance_km: 112.5,
        eta_minutes: 210,
        risk_score: 54.0,
        accessibility_score: 52.4,
        reliability_score: 49.2,
        weather_risk: 'HIGH',
        road_condition: 'POOR',
        disruption_risk: 'MEDIUM',
        is_recommended: false,
        risk_factors: {
          weather_risk: 65,
          terrain_risk: 60,
          disruption_risk: 45,
          road_risk: 50,
          historical_risk: 35
        },
        waypoints: waypoints.map(w => [w[0] + 0.1, w[1] - 0.05])
      }
    ],
    weather_data: {
      temperature_c: 22.0,
      rainfall_mm: 12.0,
      humidity_pct: 85,
      wind_speed_kmh: 15.0,
      visibility_km: 7.0,
      condition: 'Moderate Rain'
    }
  };
}
