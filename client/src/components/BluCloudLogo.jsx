import React from 'react';

/**
 * Blu OSINT Logo & Emblem Component
 * Renders the interlocking loop emblem in scalable SVG
 * with Blu OSINT typography and subtitle.
 */
export default function BluCloudLogo({
  variant = 'full', // 'full' | 'compact' | 'icon'
  size = 'md',       // 'sm' | 'md' | 'lg'
  className = '',
}) {
  const iconSizes = {
    sm: 26,
    md: 36,
    lg: 46,
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
      {/* Scalable Vector Emblem */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(37,99,235,0.25))' }}
      >
        <defs>
          <linearGradient id="bluGradLeft" x1="10" y1="30" x2="60" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="bluGradRight" x1="110" y1="30" x2="60" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="orangeGrad" x1="60" y1="15" x2="60" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* Left Blue Loop (Cloud Wing) */}
        <path
          d="M 45 42 C 28 42 16 52 16 64 C 16 76 28 86 45 86 C 53 86 60 82 65 76"
          stroke="url(#bluGradLeft)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Blue Loop (Cloud Wing) */}
        <path
          d="M 75 42 C 92 42 104 52 104 64 C 104 76 92 86 75 86 C 67 86 60 82 55 76"
          stroke="url(#bluGradRight)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Interlocking Orange 'S' Loop */}
        <path
          d="M 52 35 C 52 24 60 17 70 17 C 80 17 87 25 87 34 C 87 47 33 63 33 86 C 33 95 40 103 50 103 C 60 103 68 96 68 85"
          stroke="url(#orangeGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

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
