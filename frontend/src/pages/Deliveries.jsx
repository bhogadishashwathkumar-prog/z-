import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Package, Search, Plus, MapPin, Edit2, Check, 
  AlertCircle, ShieldAlert, Calendar, User, Compass 
} from 'lucide-react';

const DELIVERY_STATUSES = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELAYED', 'DELIVERED', 'CANCELLED'];
const PRIORITIES = ['NORMAL', 'HIGH', 'EMERGENCY'];

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDelivery, setNewDelivery] = useState({
    source: '',
    destination: '',
    goods_type: '',
    weight_kg: 500,
    priority: 'NORMAL',
    notes: ''
  });

  // Edit state
  const [editingDeliveryId, setEditingDeliveryId] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/deliveries');
      setDeliveries(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch deliveries. Using offline simulation data.");
      // Fallback demo data
      setDeliveries([
        { id: 1, delivery_id: "DEL-8A3F2C", source: "Guwahati", destination: "Shillong", goods_type: "Medical Supplies", weight_kg: 500, driver_name: "Ramesh Baruah", priority: 'HIGH', status: 'IN_TRANSIT', risk_level: 'MEDIUM', expected_delivery: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString() },
        { id: 2, delivery_id: "DEL-1B8D9F", source: "Dimapur", destination: "Imphal", goods_type: "Food Rations", weight_kg: 2000, driver_name: "Mohan Das", priority: 'EMERGENCY', status: 'DELAYED', risk_level: 'HIGH', expected_delivery: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/deliveries', newDelivery);
      setDeliveries([res.data, ...deliveries]);
      setShowAddForm(false);
      setNewDelivery({ source: '', destination: '', goods_type: '', weight_kg: 500, priority: 'NORMAL', notes: '' });
    } catch (err) {
      alert("Failed to submit delivery to backend database. Creating in local session state only.");
      const mockNew = {
        id: Date.now(),
        delivery_id: `DEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        ...newDelivery,
        status: 'PENDING',
        risk_level: 'LOW',
        expected_delivery: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
      };
      setDeliveries([mockNew, ...deliveries]);
      setShowAddForm(false);
    }
  };

  const handleUpdateStatus = async (id) => {
    try {
      await api.put(`/deliveries/${id}`, { status: statusUpdate });
      setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: statusUpdate } : d));
      setEditingDeliveryId(null);
    } catch (err) {
      setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: statusUpdate } : d));
      setEditingDeliveryId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'EMERGENCY') return <span className="badge badge-critical">EMERGENCY</span>;
    if (priority === 'HIGH') return <span className="badge badge-high">HIGH</span>;
    return <span className="badge badge-info">NORMAL</span>;
  };

  const getStatusBadge = (status) => {
    if (status === 'IN_TRANSIT') return <span className="badge badge-moving">IN TRANSIT</span>;
    if (status === 'DELIVERED') return <span className="badge badge-low">DELIVERED</span>;
    if (status === 'DELAYED') return <span className="badge badge-medium">DELAYED</span>;
    if (status === 'CANCELLED') return <span className="badge badge-critical">CANCELLED</span>;
    return <span className="badge badge-info">{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">NER Delivery Logistics</h1>
          <p className="page-subtitle">Coordinate shipments, priorities, and check active risks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} /> New Delivery
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, color: '#f59e0b', fontSize: 13, marginBottom: 20 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: 20, maxWidth: 600 }}>
          <h3 className="section-title" style={{ margin: '0 0 14px 0' }}>Dispatch New Order</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">SOURCE CORRIDOR</label>
              <input className="form-input" placeholder="e.g. Guwahati" value={newDelivery.source} onChange={e => setNewDelivery({...newDelivery, source: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">DESTINATION HUB</label>
              <input className="form-input" placeholder="e.g. Shillong" value={newDelivery.destination} onChange={e => setNewDelivery({...newDelivery, destination: e.target.value})} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Goods Description</label>
              <input className="form-input" placeholder="e.g. Vaccines" value={newDelivery.goods_type} onChange={e => setNewDelivery({...newDelivery, goods_type: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" type="number" value={newDelivery.weight_kg} onChange={e => setNewDelivery({...newDelivery, weight_kg: Number(e.target.value)})} />
            </div>
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select className="form-select" value={newDelivery.priority} onChange={e => setNewDelivery({...newDelivery, priority: e.target.value})}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Note</label>
            <textarea className="form-textarea" placeholder="Special route guidelines, driver requirements..." value={newDelivery.notes} onChange={e => setNewDelivery({...newDelivery, notes: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Dispatch</button>
          </div>
        </form>
      )}

      {/* Deliveries Table list */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Route Corridor</th>
                <th>Cargo Item</th>
                <th>Priority</th>
                <th>Driver Assigned</th>
                <th>Expected Delivery</th>
                <th>Route Risk</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{d.delivery_id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                      {d.source} <Compass size={12} className="text-muted" /> {d.destination}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.goods_type}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{d.weight_kg} kg</div>
                  </td>
                  <td>{getPriorityBadge(d.priority)}</td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 550 }}>👤 {d.driver_name || 'Not assigned'}</span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-muted)' }}>
                      <Calendar size={12} /> {d.expected_delivery ? new Date(d.expected_delivery).toLocaleTimeString() : 'TBD'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${(d.risk_level || 'LOW').toLowerCase()}`}>{d.risk_level || 'LOW'}</span>
                  </td>
                  <td>
                    {editingDeliveryId === d.id ? (
                      <select className="form-select font-semibold" value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)} style={{ padding: '2px 8px', fontSize: 12 }}>
                        {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      getStatusBadge(d.status)
                    )}
                  </td>
                  <td>
                    {editingDeliveryId === d.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(d.id)}>
                          <Check size={12} />
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditingDeliveryId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn-outline btn-sm" onClick={() => {
                        setEditingDeliveryId(d.id);
                        setStatusUpdate(d.status);
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
