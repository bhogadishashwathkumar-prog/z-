import React from 'react';
import { Link } from 'react-router-dom';
import {
  Route, Shield, Zap, Cloud, Map, Truck, BarChart3, Bell, Phone,
  ChevronRight, Star, AlertTriangle, CheckCircle, Globe, Cpu
} from 'lucide-react';

const FEATURES = [
  { icon: Route, color: '#3b82f6', title: 'AI Route Optimization', desc: 'Multi-factor route ranking using risk, accessibility, weather, and historical data — not just distance.' },
  { icon: Shield, color: '#10b981', title: 'Risk Intelligence', desc: 'Real-time risk scoring from 0–100 across weather, terrain, road conditions, and active disruptions.' },
  { icon: Cloud, color: '#a78bfa', title: 'Weather Integration', desc: 'Live weather risk assessment from OpenWeather with NER-specific monsoon and fog analysis.' },
  { icon: Map, color: '#f59e0b', title: 'GIS Mapping', desc: 'OpenStreetMap-powered maps with route visualization, incidents, vehicles, and field reports.' },
  { icon: Truck, color: '#06b6d4', title: 'Vehicle Tracking', desc: 'Real-time vehicle monitoring with GPS location, speed, status, and ETA tracking.' },
  { icon: Zap, color: '#ef4444', title: 'Emergency Logistics', desc: 'Dedicated emergency routing prioritizing safety over distance for disaster response.' },
  { icon: Bell, color: '#f97316', title: 'Smart Alerts', desc: 'Automated alerts for critical weather, road conditions, delivery delays, and field incidents.' },
  { icon: BarChart3, color: '#84cc16', title: 'Analytics Dashboard', desc: 'Comprehensive analytics on route reliability, disruptions, vehicle performance, and regional accessibility.' },
];

const STEPS = [
  { step: '01', title: 'Enter Route', desc: 'Specify source, destination, vehicle type, and cargo priority.' },
  { step: '02', title: 'Multi-Factor Analysis', desc: 'System fetches weather, road conditions, disruptions, and historical data.' },
  { step: '03', title: 'AI Scoring', desc: 'Risk Engine and Accessibility Engine score each candidate route independently.' },
  { step: '04', title: 'Smart Recommendation', desc: 'AI recommends the safest, most accessible route with a plain-language explanation.' },
];

const NE_STATES = ['Assam', 'Meghalaya', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Sikkim'];

export default function Landing() {
  return (
    <div className="landing-hero" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Route size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>NER SmartLogix</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>SIH 2026 · Innovexa · SIH26002</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 40px 60px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div className="demo-banner" style={{ display: 'inline-flex', marginBottom: 24 }}>
          <Zap size={12} /> SIH 2026 · Problem Statement SIH26002 · Smart Automation Theme
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-1px' }}>
          AI-Powered Logistics Intelligence<br />
          <span className="gradient-text">for the North Eastern Region</span>
        </h1>
        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 640, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Safer routes. Smarter logistics. Faster emergency response.<br />
          Serving all 8 states of India's North East.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            <Route size={18} /> Plan a Route
          </Link>
          <Link to="/register" className="btn btn-success btn-lg">
            <Map size={18} /> Explore Live Map
          </Link>
          <Link to="/register" className="btn btn-danger btn-lg">
            <Zap size={18} /> Emergency Mode
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg">
            Login
          </Link>
        </div>

        {/* NE States Pill */}
        <div style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {NE_STATES.map(s => (
            <span key={s} style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
              border: '1px solid rgba(59,130,246,0.2)'
            }}>{s}</span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 40px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'NE States Covered', value: '8', color: '#3b82f6' },
            { label: 'Risk Factors Analyzed', value: '5+', color: '#10b981' },
            { label: 'Route Scoring Dimensions', value: '6', color: '#a78bfa' },
            { label: 'Demo Vehicles Tracked', value: '6', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section style={{ padding: '60px 40px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>THE PROBLEM</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9' }}>NER's Logistics Challenge</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { icon: AlertTriangle, color: '#ef4444', title: 'Difficult Terrain', desc: 'Mountain passes, river crossings, and remote valleys create high-risk logistics corridors.' },
              { icon: Cloud, color: '#a78bfa', title: 'Extreme Weather', desc: 'Heavy monsoon rainfall, flash floods, and dense fog severely impact road accessibility.' },
              { icon: Route, color: '#f59e0b', title: 'No Smart Routing', desc: 'Current systems pick the shortest route, ignoring risk, weather, and disruption data.' },
              { icon: Zap, color: '#3b82f6', title: 'Emergency Response', desc: 'Disaster relief operations lack real-time route intelligence for safe, fast delivery.' },
            ].map(p => (
              <div key={p.title} className="card">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <p.icon size={20} color={p.color} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9' }}>From Location to Recommendation</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {STEPS.map((s, i) => (
            <div key={s.step} style={{ position: 'relative' }}>
              <div className="card" style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--color-border)', marginBottom: 12 }}>{s.step}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ position: 'absolute', top: '50%', right: -10, zIndex: 1, display: 'none' }}>
                  <ChevronRight size={20} color="#334155" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 40px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>PLATFORM CAPABILITIES</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9' }}>Complete Intelligence Platform</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}20`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>TECHNOLOGY</div>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', marginBottom: 40 }}>Built on Modern Stack</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {[
            'React.js', 'Vite', 'Tailwind CSS', 'FastAPI', 'Python', 'PostgreSQL',
            'SQLAlchemy', 'Gemini AI', 'OpenStreetMap', 'OSRM', 'OpenWeather', 'Leaflet',
            'Recharts', 'JWT Auth', 'React Leaflet'
          ].map(t => (
            <span key={t} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              color: '#94a3b8'
            }}>{t}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(16,185,129,0.1))', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <Cpu size={40} color="#3b82f6" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }}>Ready to Transform NER Logistics?</h2>
          <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 36, lineHeight: 1.7 }}>
            Access the full platform with AI route planning, vehicle tracking, field reports, and emergency logistics.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Account <ChevronRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">Login</Link>
          </div>
          <div style={{ marginTop: 24, fontSize: 12, color: '#64748b' }}>
            Demo accounts available · admin@nersmartlogix.in / admin123
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 40px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          © 2026 NER SmartLogix · Team Innovexa · Smart India Hackathon 2026
        </div>
        <div style={{ fontSize: 12, color: '#475569' }}>
          SIH Problem Statement: SIH26002 · Smart Automation Theme
        </div>
      </footer>
    </div>
  );
}
