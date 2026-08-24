import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Truck, AlertOctagon, ShieldAlert, CloudLightning, Info, MapPin, 
  RefreshCw, CheckCircle, RefreshCcw 
} from 'lucide-react';

// Pre-defined icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom colored markers using SVG icons
const createSvgIcon = (color) => {
  return new L.DivIcon({
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,
    className: 'custom-div-icon',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const VehicleIcon = new L.DivIcon({
  html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 4px; display: flex; align-items: center; justify-content: center; border: 1.5px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);">🚚</div>`,
  className: 'custom-div-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const IncidentColors = {
  LANDSLIDE: '#ef4444',
  FLOOD: '#3b82f6',
  ROADBLOCK: '#f59e0b',
  ACCIDENT: '#ec4899',
  BRIDGE_DAMAGE: '#dc2626',
  DAMAGED_ROAD: '#84cc16',
  WEATHER: '#a78bfa',
  OTHER: '#64748b'
};

export default function LiveMap() {
  const [vehicles, setVehicles] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showWeatherAlerts, setShowWeatherAlerts] = useState(true);

  // Simulated GPS movement state
  const [simulatedTime, setSimulatedTime] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, reportsRes, alertsRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/reports'),
        api.get('/alerts')
      ]);
      setVehicles(vehiclesRes.data);
      setReports(reportsRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error("Failed to load map data. Seeding mock items.");
      // Fallback mocks
      setVehicles([
        { id: 1, vehicle_id: "NER-TRK-001", name: "Heavy Truck Alpha", driver_name: "Ramesh Baruah", current_latitude: 26.1445, current_longitude: 91.7362, speed_kmh: 45, status: 'MOVING' },
        { id: 2, vehicle_id: "NER-TRK-002", name: "Supply Van Beta", driver_name: "Mohan Das", current_latitude: 25.6751, current_longitude: 94.1086, speed_kmh: 30, status: 'MOVING' },
        { id: 3, vehicle_id: "NER-TRK-004", name: "Emergency Unit", driver_name: "Bijoy", current_latitude: 27.0844, current_longitude: 93.6053, speed_kmh: 0, status: 'STOPPED' }
      ]);
      setReports([
        { id: 1, title: 'Landslide NH-2', latitude: 25.4788, longitude: 91.7933, incident_type: 'LANDSLIDE', severity: 'CRITICAL', description: 'NH-2 blocked by landslide near Nongstoin' },
        { id: 2, title: 'Flash Flood Warning', latitude: 24.8333, longitude: 92.7789, incident_type: 'FLOOD', severity: 'HIGH', description: 'River overflow warning' }
      ]);
      setAlerts([
        { id: 1, title: 'Heavy Rain Warning', latitude: 26.1445, longitude: 91.7362, severity: 'HIGH', message: 'IMD warning for Northeast states' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Simulating real-time vehicle movement
  useEffect(() => {
    if (vehicles.length === 0) return;
    const interval = setInterval(() => {
      setSimulatedTime(t => t + 1);
      setVehicles(prev => 
        prev.map(v => {
          if (v.status === 'MOVING') {
            // Drift slightly to simulate GPS tracking
            return {
              ...v,
              current_latitude: v.current_latitude + (Math.random() - 0.5) * 0.005,
              current_longitude: v.current_longitude + (Math.random() - 0.5) * 0.005
            };
          }
          return v;
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [vehicles.length]);

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Filters Header bar */}
      <div className="card" style={{ padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowVehicles(!showVehicles)} 
            style={showVehicles ? { background: 'rgba(59,130,246,0.15)', borderColor: '#3b82f6', color: '#3b82f6' } : {}}>
            🚚 Vehicles ({vehicles.length})
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowIncidents(!showIncidents)}
            style={showIncidents ? { background: 'rgba(239,68,68,0.15)', borderColor: '#ef4444', color: '#ef4444' } : {}}>
            ⚠️ Incidents ({reports.length})
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowWeatherAlerts(!showWeatherAlerts)}
            style={showWeatherAlerts ? { background: 'rgba(245,158,11,0.15)', borderColor: '#f59e0b', color: '#f59e0b' } : {}}>
            ⛈️ Weather Alerts ({alerts.length})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="live-indicator" style={{ padding: '4px 10px' }}>
            <div className="pulse-dot" style={{ width: 6, height: 6 }} />
            SIMULATED GPS ACTIVE
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchData}>
            <RefreshCw size={14} /> Refresh Map
          </button>
        </div>
      </div>

      {/* Main Big Leaflet Map */}
      <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        <MapContainer center={[26.1445, 91.7362]} zoom={7} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Vehicles Markers */}
          {showVehicles && vehicles.map(v => (
            v.current_latitude && v.current_longitude && (
              <Marker key={`veh-${v.id}`} position={[v.current_latitude, v.current_longitude]} icon={VehicleIcon}>
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9' }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 6px' }}>{v.vehicle_id}</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                      <div>👤 Driver: <strong>{v.driver_name}</strong></div>
                      <div>⚡ Speed: <strong>{Math.round(v.speed_kmh)} km/h</strong></div>
                      <div>⏱️ Status: <strong style={{ color: v.status === 'AT_RISK' ? '#ef4444' : '#10b981' }}>{v.status}</strong></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Incidents Markers */}
          {showIncidents && reports.map(r => (
            r.latitude && r.longitude && (
              <Marker key={`rep-${r.id}`} position={[r.latitude, r.longitude]} icon={createSvgIcon(IncidentColors[r.incident_type] || '#64748b')}>
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ fontWeight: 800, color: '#f1f5f9' }}>{r.title}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: IncidentColors[r.incident_type], margin: '2px 0 6px' }}>
                      {r.incident_type} ({r.severity})
                    </div>
                    <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>{r.description}</p>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 6 }}>📍 Location: {r.location_name}</div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Weather Alerts Markers */}
          {showWeatherAlerts && alerts.map(a => (
            a.latitude && a.longitude && (
              <Marker key={`alr-${a.id}`} position={[a.latitude, a.longitude]} icon={createSvgIcon('#f59e0b')}>
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ fontWeight: 800, color: '#f1f5f9' }}>⛈️ Weather Warning</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', margin: '2px 0 6px' }}>{a.title}</div>
                    <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>{a.message}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

        </MapContainer>
      </div>

    </div>
  );
}
