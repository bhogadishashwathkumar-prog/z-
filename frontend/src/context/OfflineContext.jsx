import React, { createContext, useContext, useState, useEffect } from 'react';

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingReports, setPendingReports] = useState([]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Load pending reports from localStorage
    const stored = localStorage.getItem('ner_pending_reports');
    if (stored) {
      try { setPendingReports(JSON.parse(stored)); } catch {}
    }

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const saveOfflineReport = (report) => {
    const updated = [...pendingReports, { ...report, offline_id: Date.now(), pending: true }];
    setPendingReports(updated);
    localStorage.setItem('ner_pending_reports', JSON.stringify(updated));
  };

  const clearPendingReport = (offline_id) => {
    const updated = pendingReports.filter(r => r.offline_id !== offline_id);
    setPendingReports(updated);
    localStorage.setItem('ner_pending_reports', JSON.stringify(updated));
  };

  return (
    <OfflineContext.Provider value={{ isOnline, pendingReports, saveOfflineReport, clearPendingReport }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => useContext(OfflineContext);
