import React, { useState } from 'react';
import {
  TbRadar,
  TbTarget,
  TbFingerprint,
  TbShieldLock,
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarLeftExpand,
} from 'react-icons/tb';
import BluCloudLogo from './BluCloudLogo.jsx';

const NAV_SECTIONS = [
  {
    title: 'Operations',
    items: [
      { id: 'dashboard', label: 'Cyber Threat Map', icon: <TbRadar size={18} />, view: 'dashboard' },
    ],
  },
  {
    title: 'Investigation',
    items: [
      { id: 'investigate', label: 'Investigate', icon: <TbTarget size={18} />, view: 'investigate' },
      { id: 'ioc', label: 'Indicator (IOC) Engine', icon: <TbFingerprint size={18} />, view: 'ioc' },
      { id: 'password', label: 'Password Audit', icon: <TbShieldLock size={18} />, view: 'password' },
    ],
  },
];

export default function Sidebar({
  current,
  onNavigate,
  mode,
  collapsed: externalCollapsed,
  onToggleCollapse: externalToggle,
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isControlled = typeof externalCollapsed === 'boolean';
  const isCollapsed = isControlled ? externalCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (externalToggle) {
      externalToggle();
    } else {
      setInternalCollapsed(c => !c);
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header with Vector Emblem + React Icon Toggle */}
      <div className={`sidebar-brand-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <BluCloudLogo size="md" variant="full" />
            <button
              className="sidebar-toggle-btn"
              onClick={handleToggle}
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <TbLayoutSidebarLeftCollapse size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
            <BluCloudLogo size="md" variant="icon" />
            <button
              className="sidebar-toggle-btn collapsed-btn"
              onClick={handleToggle}
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <TbLayoutSidebarLeftExpand size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Categorized Navigation */}
      {NAV_SECTIONS.map(section => (
        <div key={section.title} className="sidebar-nav-group">
          {!isCollapsed && <div className="sidebar-group-title">{section.title}</div>}
          {isCollapsed && <div className="sidebar-group-divider" />}
          {section.items.map(item => (
            <div
              key={item.id}
              className={`nav-item ${current === item.view ? 'active' : ''}`}
              onClick={() => onNavigate(item.view)}
              role="button"
              tabIndex={0}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="ic">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && item.badge && <span className="badge">{item.badge}</span>}
            </div>
          ))}
        </div>
      ))}

    </aside>
  );
}