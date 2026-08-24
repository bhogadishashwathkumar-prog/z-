import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CloudRain, Wind, Eye, Droplets, Thermometer, AlertTriangle, 
  Search, ShieldAlert, CheckCircle 
} from 'lucide-react';

const CITIES = [
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { name: 'Shillong', state: 'Meghalaya', lat: 25.5788, lng: 91.8933 },
  { name: 'Imphal', state: 'Manipur', lat: 24.8170, lng: 93.9368 },
  { name: 'Agartala', state: 'Tripura', lat: 23.8315, lng: 91.2868 },
  { name: 'Aizawl', state: 'Mizoram', lat: 23.7307, lng: 92.7173 },
  { name: 'Kohima', state: 'Nagaland', lat: 25.6751, lng: 94.1086 },
  { name: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.0844, lng: 93.6053 },
  { name: 'Gangtok', state: 'Sikkim', lat: 27.3389, lng: 88.6065 }
];

export default function WeatherRisk() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async (city) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/weather?latitude=${city.lat}&longitude=${city.lng}`);
      setWeather(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve live weather data. Showing demo information.");
      // Fallback demo weather based on state profile
      setWeather({
        temperature_c: 24.5,
        rainfall_mm: 12.5,
        humidity_pct: 82.0,
        wind_speed_kmh: 18.5,
        visibility_km: 6.5,
        condition: "Moderate Rain",
        weather_risk: "MEDIUM",
        description: "[DEMO] Moderate rainfall with reduced visibility. Mountain pass caution advised."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  const getRiskBadge = (risk) => {
    const r = risk?.toUpperCase();
    if (r === 'LOW') return <span className="badge badge-low">LOW RISK</span>;
    if (r === 'MEDIUM') return <span className="badge badge-medium">MEDIUM RISK</span>;
    if (r === 'HIGH') return <span className="badge badge-high">HIGH RISK</span>;
    return <span className="badge badge-critical">CRITICAL RISK</span>;
  };

  const getRiskExplanation = (risk) => {
    if (risk === 'CRITICAL') return "Heavy flooding risk, possible flash mudslides. Heavy cargo trucks must halt transit.";
    if (risk === 'HIGH') return "Extremely wet roads, potential rockfall. Limit nighttime mountain corridor driving.";
    if (risk === 'MEDIUM') return "Moderate wet surfaces, decreased brake safety parameters. Proceed with normal guidelines.";
    return "Acceptable weather corridors. No additional precautions needed.";
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">NER Regional Weather Risk</h1>
          <p className="page-subtitle">Monsoon monitoring and weather impact evaluations</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        
        {/* City Selector */}
        <div className="card">
          <h3 className="section-title">Select Logistics Hub</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
            {CITIES.map(c => {
              const isSelected = selectedCity.name === c.name;
              return (
                <div key={c.name} className="alert-item" 
                  style={{ 
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isSelected ? 'var(--color-surface-2)' : 'var(--color-surface)'
                  }}
                  onClick={() => setSelectedCity(c)}
                >
                  <div className="flex-between" style={{ width: '100%' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{c.state}</div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {c.lat.toFixed(2)}°N, {c.lng.toFixed(2)}°E
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weather Output Card */}
        <div className="card">
          <h3 className="section-title">{selectedCity.name} Current Weather</h3>
          
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Retrieving weather metrics...</div>
            </div>
          ) : (
            <div>
              {error && (
                <div style={{ padding: '8px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, color: '#f59e0b', fontSize: 12, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CloudRain size={32} className="text-primary" />
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 900 }}>{weather?.temperature_c}°C</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)' }}>{weather?.condition}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'var(--color-surface-2)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CloudRain size={16} className="text-primary" />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 600 }}>RAINFALL (1H)</div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{weather?.rainfall_mm} mm</div>
                  </div>
                </div>
                <div style={{ background: 'var(--color-surface-2)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Wind size={16} className="text-accent" />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 600 }}>WIND SPEED</div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{weather?.wind_speed_kmh} km/h</div>
                  </div>
                </div>
                <div style={{ background: 'var(--color-surface-2)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Droplets size={16} className="text-primary" />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 600 }}>HUMIDITY</div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{weather?.humidity_pct}%</div>
                  </div>
                </div>
                <div style={{ background: 'var(--color-surface-2)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Eye size={16} className="text-warning" />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', fontWeight: 600 }}>VISIBILITY</div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{weather?.visibility_km} km</div>
                  </div>
                </div>
              </div>

              {/* Weather Risk Card */}
              <div style={{ padding: 14, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldAlert size={15} className="text-warning" /> Weather Risk Level
                  </span>
                  {getRiskBadge(weather?.weather_risk)}
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  {getRiskExplanation(weather?.weather_risk)}
                </p>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>
                  {weather?.description}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
