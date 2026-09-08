import React, { useState } from 'react';
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb';

// Country flag emojis and data
const TOP_ATTACKERS_DATA = {
  '1h': [
    { country: 'United States', flag: '🇺🇸', percent: 81 },
    { country: 'Netherlands', flag: '🇳🇱', percent: 8 },
    { country: 'United Kingdom', flag: '🇬🇧', percent: 5 },
    { country: 'Singapore', flag: '🇸🇬', percent: 4 },
    { country: 'China', flag: '🇨🇳', percent: 2 },
  ],
  '24h': [
    { country: 'United States', flag: '🇺🇸', percent: 74 },
    { country: 'Russia', flag: '🇷🇺', percent: 11 },
    { country: 'China', flag: '🇨🇳', percent: 7 },
    { country: 'Germany', flag: '🇩🇪', percent: 5 },
    { country: 'Netherlands', flag: '🇳🇱', percent: 3 },
  ],
  '7d': [
    { country: 'United States', flag: '🇺🇸', percent: 69 },
    { country: 'Russia', flag: '🇷🇺', percent: 14 },
    { country: 'China', flag: '🇨🇳', percent: 9 },
    { country: 'Brazil', flag: '🇧🇷', percent: 5 },
    { country: 'United Kingdom', flag: '🇬🇧', percent: 3 },
  ],
};

const TOP_ATTACKED_DATA = {
  '1h': [
    { country: 'United States', flag: '🇺🇸', percent: 35 },
    { country: 'India', flag: '🇮🇳', percent: 20 },
    { country: 'United Arab Emirates', flag: '🇦🇪', percent: 15 },
    { country: 'Italy', flag: '🇮🇹', percent: 15 },
    { country: 'Japan', flag: '🇯🇵', percent: 15 },
  ],
  '24h': [
    { country: 'United States', flag: '🇺🇸', percent: 38 },
    { country: 'India', flag: '🇮🇳', percent: 22 },
    { country: 'Germany', flag: '🇩🇪', percent: 16 },
    { country: 'United Kingdom', flag: '🇬🇧', percent: 13 },
    { country: 'Australia', flag: '🇦🇺', percent: 11 },
  ],
  '7d': [
    { country: 'United States', flag: '🇺🇸', percent: 41 },
    { country: 'India', flag: '🇮🇳', percent: 19 },
    { country: 'Japan', flag: '🇯🇵', percent: 16 },
    { country: 'Germany', flag: '🇩🇪', percent: 13 },
    { country: 'Singapore', flag: '🇸🇬', percent: 11 },
  ],
};

const NETWORK_VECTORS_DATA = {
  '1h': [
    { name: 'UDP Flood', percent: 85 },
    { name: 'TCP Flood', percent: 12 },
    { name: 'DNS Flood', percent: 1 },
    { name: 'Low and Slow Attack', percent: 1 },
    { name: 'IP Flood', percent: 1 },
  ],
  '24h': [
    { name: 'UDP Flood', percent: 79 },
    { name: 'TCP SYN Flood', percent: 15 },
    { name: 'NTP Amplification', percent: 3 },
    { name: 'DNS Flood', percent: 2 },
    { name: 'ICMP Echo Flood', percent: 1 },
  ],
  '7d': [
    { name: 'UDP Flood', percent: 75 },
    { name: 'TCP SYN Flood', percent: 18 },
    { name: 'BGP Hijacking Probe', percent: 3 },
    { name: 'DNS Amplification', percent: 2 },
    { name: 'IP Fragmentation', percent: 2 },
  ],
};

const APP_VIOLATIONS_DATA = {
  '1h': [
    { name: 'Access violations', percent: 70 },
    { name: 'Injections', percent: 14 },
    { name: 'Exploits', percent: 7 },
    { name: 'Data theft', percent: 7 },
    { name: 'Cross-site scripting', percent: 2 },
  ],
  '24h': [
    { name: 'Access violations', percent: 64 },
    { name: 'SQL Injection', percent: 18 },
    { name: 'Zero-day exploits', percent: 10 },
    { name: 'Data exfiltration', percent: 5 },
    { name: 'Cross-site scripting', percent: 3 },
  ],
  '7d': [
    { name: 'Access violations', percent: 61 },
    { name: 'SQL Injection', percent: 20 },
    { name: 'Remote Code Execution', percent: 9 },
    { name: 'Data theft', percent: 6 },
    { name: 'Cross-site scripting', percent: 4 },
  ],
};

export default function ThreatSidebarHUD({
  isCollapsed = false,
  onToggleCollapse,
  theme = 'dark',
}) {
  const [interval, setInterval] = useState('1h');

  const attackers = TOP_ATTACKERS_DATA[interval] || TOP_ATTACKERS_DATA['1h'];
  const attacked = TOP_ATTACKED_DATA[interval] || TOP_ATTACKED_DATA['1h'];
  const netVectors = NETWORK_VECTORS_DATA[interval] || NETWORK_VECTORS_DATA['1h'];
  const appViolations = APP_VIOLATIONS_DATA[interval] || APP_VIOLATIONS_DATA['1h'];

  return (
    <div className={`threat-sidebar-hud ${isCollapsed ? 'is-collapsed' : ''}`}>
      {/* Collapse Rail Strip Toggle Button */}
      <button
        type="button"
        className="sidebar-rail-toggle"
        onClick={onToggleCollapse}
        title={isCollapsed ? 'Expand Cyber Threat Sidebar' : 'Collapse Cyber Threat Sidebar'}
      >
        <span className="rail-icon">
          {isCollapsed ? <TbChevronLeft size={16} /> : <TbChevronRight size={16} />}
        </span>
        <span className="rail-label">
          {isCollapsed ? 'EXPAND' : 'COLLAPSE'}
        </span>
      </button>

      {/* Main Sidebar Contents (Scrollable HUD) */}
      {!isCollapsed && (
        <div className="sidebar-hud-content">
          {/* Main Title & Interval Picker */}
          <div className="hud-section-header">
            <h2 className="threat-map-title">LIVE CYBER THREAT MAP</h2>
            <div className="interval-control">
              <label htmlFor="stat-interval" className="interval-label">
                STATISTICS INTERVAL
              </label>
              <div className="interval-select-wrapper">
                <select
                  id="stat-interval"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="interval-select"
                >
                  <option value="1h">1 hour</option>
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: TOP ATTACKERS */}
          <div className="hud-metric-group">
            <h3 className="group-title">TOP ATTACKERS</h3>
            <div className="metric-list">
              {attackers.map((item) => (
                <div key={item.country} className="metric-bar-row">
                  <div className="metric-bar-fill teal-bar" style={{ width: `${item.percent}%` }} />
                  <div className="metric-bar-content">
                    <div className="country-info">
                      <span className="country-flag">{item.flag}</span>
                      <span className="country-name">{item.country}</span>
                    </div>
                    <span className="metric-percent">{item.percent} %</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: TOP ATTACKED */}
          <div className="hud-metric-group">
            <h3 className="group-title">TOP ATTACKED</h3>
            <div className="metric-list">
              {attacked.map((item) => (
                <div key={item.country} className="metric-bar-row">
                  <div className="metric-bar-fill teal-bar" style={{ width: `${item.percent}%` }} />
                  <div className="metric-bar-content">
                    <div className="country-info">
                      <span className="country-flag">{item.flag}</span>
                      <span className="country-name">{item.country}</span>
                    </div>
                    <span className="metric-percent">{item.percent} %</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: TOP NETWORK ATTACK VECTORS */}
          <div className="hud-metric-group">
            <h3 className="group-title">TOP NETWORK ATTACK VECTORS</h3>
            <div className="metric-list">
              {netVectors.map((item) => (
                <div key={item.name} className="metric-bar-row">
                  <div className="metric-bar-fill gold-bar" style={{ width: `${item.percent}%` }} />
                  <div className="metric-bar-content">
                    <span className="vector-name">{item.name}</span>
                    <span className="metric-percent gold-text">{item.percent} %</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: TOP APPLICATION VIOLATIONS */}
          <div className="hud-metric-group">
            <h3 className="group-title">TOP APPLICATION VIOLATIONS</h3>
            <div className="metric-list">
              {appViolations.map((item) => (
                <div key={item.name} className="metric-bar-row">
                  <div className="metric-bar-fill red-bar" style={{ width: `${item.percent}%` }} />
                  <div className="metric-bar-content">
                    <span className="vector-name red-tint">{item.name}</span>
                    <span className="metric-percent red-text">{item.percent} %</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: TOP SCANNED UDP PORTS (Authentic Radware Treemap Grid) */}
          <div className="hud-metric-group">
            <h3 className="group-title">TOP SCANNED UDP PORTS</h3>
            <div className="port-treemap-grid udp-grid">
              <div className="treemap-tile tile-xl" title="Port 4500 (IPsec NAT-Traversal)">
                <span className="port-num">4500</span>
              </div>
              <div className="treemap-tile tile-lg" title="Port 500 (ISAKMP / IKE)">
                <span className="port-num">500</span>
              </div>
              <div className="treemap-tile tile-vert" title="Port 5060 (SIP VoIP)">
                <span className="port-num vert-text">5060</span>
              </div>
              <div className="treemap-tile tile-vert" title="Port 3478 (STUN / TURN)">
                <span className="port-num vert-text">3478</span>
              </div>

              <div className="treemap-tile tile-xl" title="Port 37810 (DHCPv6 / Custom Probe)">
                <span className="port-num">37810</span>
              </div>
              <div className="treemap-tile tile-lg" title="Port 123 (NTP Amplification)">
                <span className="port-num">123</span>
              </div>
              <div className="treemap-tile tile-sm" title="Port 5683 (CoAP IoT)">
                <span className="port-num">5683</span>
              </div>

              <div className="treemap-tile tile-xl" title="Port 161 (SNMP Amplification)">
                <span className="port-num">161</span>
              </div>
              <div className="treemap-tile tile-lg" title="Port 37 (Time Protocol)">
                <span className="port-num">37</span>
              </div>
              <div className="treemap-tile tile-sm" title="Port 137 (NetBIOS Name Service)">
                <span className="port-num">137</span>
              </div>
            </div>
          </div>

          {/* Section: TOP SCANNED TCP PORTS (Authentic Radware Treemap Grid) */}
          <div className="hud-metric-group">
            <h3 className="group-title">TOP SCANNED TCP PORTS</h3>
            <div className="port-treemap-grid tcp-grid">
              <div className="treemap-tile tile-xl" title="Port 5900 (VNC Remote Access)">
                <span className="port-num">5900</span>
              </div>
              <div className="treemap-tile tile-huge" title="Port 23 (Telnet Mirai Brute-Force)">
                <span className="port-num">23</span>
              </div>
              <div className="treemap-tile tile-mini" title="Port 22 (SSH)">
                <span className="port-num vert-text">22</span>
              </div>
              <div className="treemap-tile tile-mini" title="Port 8080 (HTTP Alternate)">
                <span className="port-num vert-text">8080</span>
              </div>
              <div className="treemap-tile tile-mini" title="Port 8000 (Common Web API)">
                <span className="port-num vert-text">8000</span>
              </div>

              <div className="treemap-tile tile-xl" title="Port 443 (HTTPS SSL Exploit)">
                <span className="port-num">443</span>
              </div>
              <div className="treemap-tile tile-lg" title="Port 80 (HTTP Plaintext)">
                <span className="port-num">80</span>
              </div>
              <div className="treemap-tile tile-sm" title="Port 8081 (Proxy)">
                <span className="port-num">8081</span>
              </div>
              <div className="treemap-tile tile-sm" title="Port 445 (SMB / EternalBlue)">
                <span className="port-num">445</span>
              </div>
              <div className="treemap-tile tile-sm" title="Port 3306 (MySQL Injection)">
                <span className="port-num vert-text">3306</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
