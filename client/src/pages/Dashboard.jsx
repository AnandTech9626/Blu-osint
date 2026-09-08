import React, { useState } from 'react';
import GlobalMap from '../components/GlobalMap.jsx';
import AttackTypeFilter from '../components/AttackTypeFilter.jsx';
import ThreatOscilloscope from '../components/ThreatOscilloscope.jsx';
import ThreatSidebarHUD from '../components/ThreatSidebarHUD.jsx';

export default function Dashboard({ mode, theme }) {
  // Attack categories filter state: default all enabled
  const [activeTypes, setActiveTypes] = useState({
    web: true,
    ddos: true,
    intruders: true,
    scanners: true,
    anonymizers: true,
  });

  const [timelineCollapsed, setTimelineCollapsed] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleFilter = (catId) => {
    setActiveTypes((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  return (
    <div className="radware-threat-map-page animate-in">
      {/* 1. Cyber Threat Map Header Bar */}
      <div className="threat-map-header-bar">
        <div className="header-branding">
          <div className="header-titles">
            <h1 className="threat-main-title">Live Threat Map</h1>
            <span className="threat-subtitle">
              Powered by Blu OSINT&apos;s Threat Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Threat Workspace: Central Canvas + Floating HUDs + Right Rail */}
      <div className="threat-workspace">
        {/* Left Map Viewport Container */}
        <div className="threat-map-main-viewport">
          {/* Floating Left ATTACK TYPES Card */}
          <AttackTypeFilter
            activeTypes={activeTypes}
            onToggle={handleToggleFilter}
            theme={theme}
          />

          {/* Central 3D Ballistic Trajectory Map Canvas */}
          <div className="threat-map-canvas-container">
            <GlobalMap activeTypes={activeTypes} theme={theme} />
          </div>

          {/* Bottom Live Oscilloscope & Timeline */}
          <ThreatOscilloscope
            activeTypes={activeTypes}
            isCollapsed={timelineCollapsed}
            onToggleCollapse={() => setTimelineCollapsed((c) => !c)}
            theme={theme}
          />
        </div>

        {/* Right Telemetry & Analytics Sidebar HUD */}
        <ThreatSidebarHUD
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          theme={theme}
        />
      </div>
    </div>
  );
}