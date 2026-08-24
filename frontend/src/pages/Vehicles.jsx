import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Truck, Search, Plus, MapPin, Edit2, Check, 
  AlertCircle, ChevronRight, User, Phone, Layers 
} from 'lucide-react';

const VEHICLE_STATUSES = ['MOVING', 'STOPPED', 'DELAYED', 'AT_RISK', 'DELIVERED', 'OFFLINE'];
const VEHICLE_TYPES = ['TRUCK', 'VAN', 'MOTORCYCLE', 'HELICOPTER', 'BOAT', 'SUV'];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicle_id: '',
    name: '',
    vehicle_type: 'TRUCK',
    driver_name: '',
    driver_phone: '',
    license_plate: '',
    capacity_kg: 5000
  });

  // Edit status state
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles');
      setVehicles(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch vehicles. Using demo simulation data.");
      // Fallback demo data
      setVehicles([
        { id: 1, vehicle_id: "NER-TRK-001", name: "Heavy Truck Alpha", vehicle_type: 'TRUCK', driver_name: "Ramesh Baruah", driver_phone: "+91-9876543211", license_plate: "AS-01-1234", capacity_kg: 10000, current_latitude: 26.1445, current_longitude: 91.7362, speed_kmh: 42, status: 'MOVING', risk_level: 'MEDIUM' },
        { id: 2, vehicle_id: "NER-TRK-002", name: "Supply Van Beta", vehicle_type: 'VAN', driver_name: "Mohan Das", driver_phone: "+91-9876543212", license_plate: "NL-01-5678", capacity_kg: 3000, current_latitude: 25.6751, current_longitude: 94.1086, speed_kmh: 38, status: 'MOVING', risk_level: 'HIGH' },
        { id: 3, vehicle_id: "NER-TRK-003", name: "Medical Supply Van", vehicle_type: 'VAN', driver_name: "Sunita Devi", driver_phone: "+91-9876543213", license_plate: "TR-01-9012", capacity_kg: 2000, current_latitude: 23.8315, current_longitude: 91.2868, speed_kmh: 0, status: 'STOPPED', risk_level: 'LOW' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/vehicles', newVehicle);
      setVehicles([...vehicles, res.data]);
      setShowAddForm(false);
      setNewVehicle({
        vehicle_id: '',
        name: '',
        vehicle_type: 'TRUCK',
        driver_name: '',
        driver_phone: '',
        license_plate: '',
        capacity_kg: 5000
      });
    } catch (err) {
      alert("Failed to register vehicle in live DB. Adding to local screen view only.");
      // Simulated add
      const mockNew = {
        id: Date.now(),
        ...newVehicle,
        speed_kmh: 0,
        status: 'STOPPED',
        risk_level: 'LOW',
        current_latitude: 26.1445,
        current_longitude: 91.7362
      };
      setVehicles([...vehicles, mockNew]);
      setShowAddForm(false);
    }
  };

  const handleUpdateStatus = async (id) => {
    try {
      await api.post(`/vehicles/${id}/location`, {
        latitude: vehicles.find(v => v.id === id).current_latitude || 26.1445,
        longitude: vehicles.find(v => v.id === id).current_longitude || 91.7362,
        status: statusUpdate
      });
      setVehicles(vehicles.map(v => v.id === id ? { ...v, status: statusUpdate } : v));
      setEditingVehicleId(null);
    } catch (err) {
      // Local fallback edit
      setVehicles(vehicles.map(v => v.id === id ? { ...v, status: statusUpdate } : v));
      setEditingVehicleId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = status.toUpperCase();
    if (s === 'MOVING') return <span className="badge badge-moving">MOVING</span>;
    if (s === 'STOPPED') return <span className="badge badge-stopped">STOPPED</span>;
    if (s === 'DELAYED') return <span className="badge badge-medium">DELAYED</span>;
    if (s === 'AT_RISK') return <span className="badge badge-critical">AT_RISK</span>;
    return <span className="badge badge-info">{s}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">NER Vehicle Fleet Tracking</h1>
          <p className="page-subtitle">Monitor and update delivery vehicles across all routes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, color: '#f59e0b', fontSize: 13, marginBottom: 20 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Add form Modal/Panel */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: 20, maxWidth: 600 }}>
          <h3 className="section-title" style={{ margin: '0 0 14px 0' }}>Register New Vehicle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Vehicle ID</label>
              <input className="form-input" placeholder="e.g. NER-TRK-100" value={newVehicle.vehicle_id} onChange={e => setNewVehicle({...newVehicle, vehicle_id: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Name</label>
              <input className="form-input" placeholder="e.g. Guwahati Express" value={newVehicle.name} onChange={e => setNewVehicle({...newVehicle, name: e.target.value})} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={newVehicle.vehicle_type} onChange={e => setNewVehicle({...newVehicle, vehicle_type: e.target.value})}>
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">License Plate</label>
              <input className="form-input" placeholder="e.g. AS-01-XX-XXXX" value={newVehicle.license_plate} onChange={e => setNewVehicle({...newVehicle, license_plate: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Capacity (kg)</label>
              <input className="form-input" type="number" value={newVehicle.capacity_kg} onChange={e => setNewVehicle({...newVehicle, capacity_kg: Number(e.target.value)})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Driver Name</label>
              <input className="form-input" placeholder="Ramesh Sen" value={newVehicle.driver_name} onChange={e => setNewVehicle({...newVehicle, driver_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Driver Phone</label>
              <input className="form-input" placeholder="+91-XXXXX" value={newVehicle.driver_phone} onChange={e => setNewVehicle({...newVehicle, driver_phone: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Vehicle</button>
          </div>
        </form>
      )}

      {/* Vehicles Table / Cards */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Driver</th>
                <th>License Plate</th>
                <th>Capacity</th>
                <th>Coordinates</th>
                <th>Speed</th>
                <th>Status</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{v.vehicle_id}</div>
                  </td>
                  <td><span className="badge badge-info" style={{ fontSize: 10 }}>{v.vehicle_type}</span></td>
                  <td>
                    <div>{v.driver_name || 'Unassigned'}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{v.driver_phone || 'N/A'}</div>
                  </td>
                  <td>{v.license_plate || 'N/A'}</td>
                  <td>{v.capacity_kg} kg</td>
                  <td>
                    {v.current_latitude ? (
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {v.current_latitude.toFixed(4)}, {v.current_longitude.toFixed(4)}
                      </span>
                    ) : 'Not tracked'}
                  </td>
                  <td>{Math.round(v.speed_kmh || 0)} km/h</td>
                  <td>
                    {editingVehicleId === v.id ? (
                      <select className="form-select font-semibold" value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)} style={{ padding: '2px 8px', fontSize: 12 }}>
                        {VEHICLE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      getStatusBadge(v.status)
                    )}
                  </td>
                  <td>
                    {editingVehicleId === v.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(v.id)}>
                          <Check size={12} />
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditingVehicleId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn-outline btn-sm" onClick={() => {
                        setEditingVehicleId(v.id);
                        setStatusUpdate(v.status);
                      }}>
                        <Edit2 size={12} /> Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
