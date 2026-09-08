import React, { useState } from 'react';
import GlobalMap from '../components/GlobalMap.jsx';
import AttackTypeFilter from '../components/AttackTypeFilter.jsx';
import ThreatOscilloscope from '../components/ThreatOscilloscope.jsx';
import ThreatSidebarHUD from '../components/ThreatSidebarHUD.jsx';
import BluCloudLogo from '../components/BluCloudLogo.jsx';
import { TbAlertTriangle, TbShieldExclamation, TbX } from 'react-icons/tb';

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
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  const handleToggleFilter = (catId) => {
    setActiveTypes((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  return (
    <div className="radware-threat-map-page animate-in">
      {/* 1. Radware-Style Sub-Header Banner */}
      <div className="threat-map-header-bar">
        <div className="header-branding">
          <div className="header-titles">
            <h1 className="threat-main-title">Live Threat Map</h1>
            <span className="threat-subtitle">
              Powered by Blu OSINT&apos;s Threat Intelligence
            </span>
          </div>
        </div>


        {/* Right Incident & SOC Actions */}
        <div className="header-right-actions">
          <button
            type="button"
            className="under-attack-btn"
            onClick={() => setShowIncidentModal(true)}
          >
            <TbAlertTriangle size={15} />
            UNDER ATTACK
          </button>
          <button
            type="button"
            className="contact-sales-btn"
            onClick={() => setShowIncidentModal(true)}
          >
            <TbShieldExclamation size={15} />
            INCIDENT RESPONSE
          </button>
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


      {/* Under Attack Modal */}
      {showIncidentModal && (
        <div className="threat-modal-overlay" onClick={() => setShowIncidentModal(false)}>
          <div className="threat-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Immediate Incident Mitigation & SOC Escalation</h3>
              <button type="button" onClick={() => setShowIncidentModal(false)}><TbX size={18} /></button>
            </div>
            <div className="modal-body">
              <p>
                Blu OSINT Sentinel defense mesh is currently shielding telemetry hubs and active assets. To dispatch immediate emergency countermeasures or engage tier-3 incident responders:
              </p>
              <div className="emergency-contact-box">
                <div><strong>Emergency Hotline:</strong> +1 (800) 555-BLU-SOC</div>
                <div><strong>Secure Telemetry Dispatch:</strong> soc-dispatch@bluosint.local</div>
                <div><strong>Automated BGP Scrubbing:</strong> Active &bull; Route Convergence Nominal</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}