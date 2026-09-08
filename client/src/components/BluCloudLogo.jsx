import React from 'react';
import bcsEmblem from '../assets/bcs-emblem.png';

/**
 * Blu OSINT Logo & Emblem Component
 * Renders the official Blue Cloud Softech interlocking emblem
 * (with background removed / transparent) paired with Blu OSINT typography.
 */
export default function BluCloudLogo({
  variant = 'full', // 'full' | 'compact' | 'icon'
  size = 'md',       // 'sm' | 'md' | 'lg'
  className = '',
}) {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 48,
  };

  const iconSize = iconSizes[size] || 36;

  return (
    <div
      className={`blucloud-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? 8 : 12,
        userSelect: 'none',
      }}
    >
      {/* Official Transparent Emblem */}
      <img
        src={bcsEmblem}
        alt="Blu OSINT Logo"
        width={iconSize}
        height={iconSize}
        style={{
          width: iconSize,
          height: iconSize,
          flexShrink: 0,
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 8px rgba(37,99,235,0.25))',
          display: 'block',
        }}
      />

      {/* Typography */}
      {variant !== 'icon' && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div
            style={{
              fontSize: size === 'sm' ? 15 : size === 'lg' ? 20 : 16.5,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            }}
          >
            Blu&nbsp;<span style={{ color: '#38BDF8', fontWeight: 700 }}>OSINT</span>
          </div>

          <div
            style={{
              fontSize: size === 'sm' ? 9 : 10.5,
              fontWeight: 500,
              color: 'var(--text-dim)',
              letterSpacing: '0.01em',
              marginTop: 2,
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            Cyber Intelligence Platform
          </div>
        </div>
      )}
    </div>
  );
}
