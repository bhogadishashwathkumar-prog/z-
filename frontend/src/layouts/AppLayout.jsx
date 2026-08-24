import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import {
  LayoutDashboard, Map, Route, Truck, Package, CloudRain, Bell,
  FileText, BarChart3, User, LogOut, Menu, X, Shield, AlertTriangle, Zap
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/map', icon: Map, label: 'Live Map' },
    ]
  },
  {
    label: 'LOGISTICS',
    items: [
      { to: '/route-planner', icon: Route, label: 'Route Planner' },
      { to: '/vehicles', icon: Truck, label: 'Vehicles' },
      { to: '/deliveries', icon: Package, label: 'Deliveries' },
    ]
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { to: '/weather', icon: CloudRain, label: 'Weather & Risk' },
      { to: '/alerts', icon: Bell, label: 'Alerts' },
      { to: '/reports', icon: FileText, label: 'Field Reports' },
      { to: '/emergency', icon: Zap, label: 'Emergency', highlight: true },
    ]
  },
  {
    label: 'ADMIN',
    items: [
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/admin', icon: Shield, label: 'Admin Panel' },
    ]
  }
];

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Route size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
              NER SmartLogix
            </div>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, marginTop: 1 }}>
              SIH 2026 · Innovexa
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="sidebar-section">{section.label}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
                style={item.highlight ? { color: '#f59e0b' } : {}}
              >
                <item.icon size={16} />
                {item.label}
                {item.highlight && (
                  <span style={{
                    marginLeft: 'auto', fontSize: 9, fontWeight: 700,
                    background: 'rgba(245,158,11,0.2)', color: '#f59e0b',
                    padding: '2px 6px', borderRadius: 4
                  }}>SOS</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--color-border)' }}>
        <NavLink to="/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <User size={16} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name || 'User'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-subtle)' }}>{user?.role?.replace('_', ' ')}</div>
          </div>
        </NavLink>
        <button className="sidebar-item" onClick={handleLogout} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  );
}

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOnline } = useOffline();

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar" style={{ display: 'flex' }}>
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
        }} onClick={() => setSidebarOpen(false)}>
          <aside className="sidebar open" style={{ display: 'flex' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSidebarOpen(false)} style={{
              position: 'absolute', top: 12, right: 12,
              background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer'
            }}>
              <X size={20} />
            </button>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="main-content">
        <TopHeader onMenuClick={() => setSidebarOpen(true)} isOnline={isOnline} />
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

function TopHeader({ onMenuClick, isOnline }) {
  const { user } = useAuth();
  return (
    <header className="top-header">
      <button className="btn-ghost btn btn-sm" onClick={onMenuClick} style={{ display: 'none' }}
        id="mobile-menu-btn">
        <Menu size={18} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          North Eastern Region Intelligence Platform
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Status */}
      {isOnline ? (
        <div className="live-indicator" style={{ padding: '4px 10px' }}>
          <div className="pulse-dot" style={{ width: 6, height: 6 }} />
          LIVE
        </div>
      ) : (
        <div className="demo-banner" style={{ padding: '4px 10px' }}>
          <AlertTriangle size={12} />
          OFFLINE
        </div>
      )}

      <div className="demo-banner" style={{ padding: '4px 10px' }}>
        <Zap size={12} />
        DEMO MODE
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>
        {user?.full_name}
      </div>
    </header>
  );
}
