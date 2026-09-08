import React, { useState, useEffect } from 'react';
import { TbSun, TbMoon } from 'react-icons/tb';

const VIEW_METADATA = {
  dashboard: { section: 'Operations', label: 'Cyber Threat Map' },
  threat: { section: 'Operations', label: 'Threat Intelligence & CVEs' },
  timeline: { section: 'Operations', label: 'Incident Timeline' },
  investigate: { section: 'Investigation', label: 'Investigate' },
  ioc: { section: 'Investigation', label: 'Indicator of Compromise (IOC)' },
  graph: { section: 'Investigation', label: 'Entity Network Graph' },
  search: { section: 'Investigation', label: 'Deep Web Intelligence' },
  wifi: { section: 'Audit & Sensors', label: 'Wi-Fi & Wireless Intel' },
  password: { section: 'Investigation', label: 'Password Audit' },
  cases: { section: 'Case Management', label: 'Active Case Management' },
  reports: { section: 'Case Management', label: 'Forensic Intelligence Reports' },
  sources: { section: 'Case Management', label: 'Data Source Integrations' },
};

export default function TopBar({ view, mode, onMode, theme = 'dark', onSetTheme, health }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const meta = VIEW_METADATA[view] || { section: 'Blu OSINT', label: 'Cyber Intelligence' };

  const utcHours = String(now.getUTCHours()).padStart(2, '0');
  const utcMins = String(now.getUTCMinutes()).padStart(2, '0');
  const utcSecs = String(now.getUTCSeconds()).padStart(2, '0');
  const utcTime = `${utcHours}:${utcMins}:${utcSecs} UTC`;

  const localDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="topbar">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-box">
        <span className="breadcrumb-section">{meta.section}</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{meta.label}</span>
      </div>


      {/* Right Controls */}
      <div className="topbar-right">
        {/* Real-time UTC + Local Clock */}
        <div className="clock-badge">
          <span>{localDate}</span>
          <span className="utc">{utcTime}</span>
        </div>

        {/* Single Theme Toggle Icon Button (Sun / Moon) */}
        <button
          type="button"
          className="theme-icon-btn"
          onClick={() => onSetTheme && onSetTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <TbMoon size={19} /> : <TbSun size={19} />}
        </button>
      </div>
    </header>
  );
}