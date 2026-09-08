import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Investigate from './pages/Investigate.jsx';
import ThreatIntel from './pages/ThreatIntel.jsx';
import PasswordCheck from './pages/PasswordCheck.jsx';
import WiFiPage from './pages/WiFiPage.jsx';

import Cases from './pages/Cases.jsx';
import Graph from './pages/Graph.jsx';
import Timeline from './pages/Timeline.jsx';
import Reports from './pages/Reports.jsx';
import DataSources from './pages/DataSources.jsx';
import ExaSearch from './pages/ExaSearch.jsx';
import { api } from './lib/api.js';

const VIEWS = {
  dashboard: Dashboard,
  investigate: Investigate,
  threat: ThreatIntel,
  password: PasswordCheck,
  wifi: WiFiPage,

  search: ExaSearch,
  graph: Graph,
  cases: Cases,
  timeline: Timeline,
  reports: Reports,
  sources: DataSources,
};

export default function App() {
  const [view, setView] = useState('dashboard');
  const [mode, setMode] = useState('analyst');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('blu_theme') || 'dark';
  });
  const [health, setHealth] = useState(null);
  const [quickTarget, setQuickTarget] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('blu_theme', theme);
  }, [theme]);

  const loadHealth = useCallback(async () => {
    try {
      setHealth(await api.health());
    } catch (e) {
      console.warn('Health fetch failed', e);
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  useEffect(() => {
    document.body.classList.toggle('wall-mode', mode === 'socwall');
    document.body.classList.toggle('client-mode', mode === 'client');
  }, [mode]);

  // Keyboard shortcut Ctrl+K to jump to search or focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.topbar-search input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickSearch = (target) => {
    setQuickTarget(target);
    setView('investigate');
  };

  const ActiveView = VIEWS[view] || Dashboard;

  return (
    <div className={`app ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar
        current={view}
        onNavigate={setView}
        mode={mode}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      <div className="main">
        <TopBar
          view={view}
          mode={mode}
          onMode={setMode}
          theme={theme}
          onSetTheme={setTheme}
          health={health}
          onQuickSearch={handleQuickSearch}
        />
        <ActiveView mode={mode} theme={theme} initialTarget={quickTarget} onClearTarget={() => setQuickTarget('')} />
      </div>
    </div>
  );
}