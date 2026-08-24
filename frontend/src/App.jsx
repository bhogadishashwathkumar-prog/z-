import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import ProtectedLayout from './layouts/ProtectedLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoutePlanner from './pages/RoutePlanner';
import LiveMap from './pages/LiveMap';
import Vehicles from './pages/Vehicles';
import Deliveries from './pages/Deliveries';
import WeatherRisk from './pages/WeatherRisk';
import Alerts from './pages/Alerts';
import FieldReports from './pages/FieldReports';
import Emergency from './pages/Emergency';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OfflineProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Operations Panel */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/route-planner" element={<RoutePlanner />} />
              <Route path="/map" element={<LiveMap />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/deliveries" element={<Deliveries />} />
              <Route path="/weather" element={<WeatherRisk />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<FieldReports />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </OfflineProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
