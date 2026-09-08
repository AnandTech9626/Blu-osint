import React from 'react';
import { TbBrandX, TbBrandLinkedin } from 'react-icons/tb';

export const ATTACK_CATEGORIES = [
  {
    id: 'web',
    label: 'Web Attackers',
    color: '#E74C3C',
    subtext: 'WAF Violations & Web Exploits',
  },
  {
    id: 'ddos',
    label: 'DDoS Attackers',
    color: '#F1C40F',
    subtext: 'Volumetric L3/L4 & L7 Floods',
  },
  {
    id: 'intruders',
    label: 'Intruders',
    color: '#3498DB',
    subtext: 'Unauthorized Host Penetration',
  },
  {
    id: 'scanners',
    label: 'Scanners',
    color: '#9B59B6',
    subtext: 'Port Sweeps & Vulnerability Probes',
  },
  {
    id: 'anonymizers',
    label: 'Anonymizers',
    color: '#8E44AD',
    subtext: 'TOR Exit Nodes & Bulletproof Proxies',
  },
];

export default function AttackTypeFilter({ activeTypes, onToggle, theme = 'dark' }) {
  return (
    <div className="attack-types-hud">
      <div className="hud-header">
        <span className="hud-title">ATTACK TYPES</span>
      </div>

      <div className="attack-types-list">
        {ATTACK_CATEGORIES.map((cat) => {
          const isActive = activeTypes[cat.id] !== false;
          return (
            <button
              key={cat.id}
              type="button"
              className={`attack-type-btn ${isActive ? 'is-active' : 'is-inactive'}`}
              onClick={() => onToggle(cat.id)}
              style={{
                '--cat-color': cat.color,
              }}
            >
              <span
                className="custom-check-circle"
                style={{
                  backgroundColor: isActive ? cat.color : 'transparent',
                  borderColor: cat.color,
                  boxShadow: isActive ? `0 0 10px ${cat.color}88` : 'none',
                }}
              >
                {isActive && (
                  <svg viewBox="0 0 12 12" className="check-svg" fill="none" stroke="#fff" strokeWidth="2.2">
                    <polyline points="2.5 6 4.8 8.5 9.5 3.5" />
                  </svg>
                )}
              </span>
              <span className="attack-type-label">{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="hud-social-links">
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer"
          className="social-btn"
          title="Share on X"
        >
          <TbBrandX size={15} />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noreferrer"
          className="social-btn"
          title="Share on LinkedIn"
        >
          <TbBrandLinkedin size={15} />
        </a>
      </div>
    </div>
  );
}
