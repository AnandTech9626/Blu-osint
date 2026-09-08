import React, { useEffect, useRef, useState } from 'react';
import { TbX, TbChevronUp, TbInfoCircle } from 'react-icons/tb';

export default function ThreatOscilloscope({
  activeTypes = {},
  isCollapsed = false,
  onToggleCollapse,
  theme = 'dark',
}) {
  const canvasRef = useRef(null);
  const [timeMarkers, setTimeMarkers] = useState({ t1: '14:20', t2: '14:40', tNow: 'NOW' });
  const [showInfo, setShowInfo] = useState(false);

  // Compute live time markers
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const formatTime = (d) => {
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      };
      const t2Date = new Date(now.getTime() - 20 * 60 * 1000);
      const t1Date = new Date(now.getTime() - 40 * 60 * 1000);

      setTimeMarkers({
        t1: formatTime(t1Date),
        t2: formatTime(t2Date),
        tNow: 'NOW',
      });
    };
    updateTimes();
    const timer = setInterval(updateTimes, 30000);
    return () => clearInterval(timer);
  }, []);

  // Multi-channel Waveform Canvas Animation
  useEffect(() => {
    if (isCollapsed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let frame = 0;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w <= 0 || h <= 0) return;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Channels configuration
    const CHANNELS = [
      { id: 'web', name: 'WEB ATTACKERS', color: '#E74C3C', yFrac: 0.12, hFrac: 0.16, type: 'noise' },
      { id: 'ddos', name: 'DDOS ATTACKERS', color: '#F1C40F', yFrac: 0.32, hFrac: 0.28, type: 'burst' },
      { id: 'intruders', name: 'INTRUDERS', color: '#3498DB', yFrac: 0.58, hFrac: 0.22, type: 'square' },
      { id: 'scanners', name: 'SCANNERS', color: '#9B59B6', yFrac: 0.76, hFrac: 0.12, type: 'sine' },
      { id: 'anonymizers', name: 'ANONYMIZERS', color: '#8E44AD', yFrac: 0.88, hFrac: 0.16, type: 'spikes' },
    ];

    const isLight = theme === 'light';

    function draw() {
      frame++;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      if (w <= 0 || h <= 0) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // Background subtle grid
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(0, 242, 255, 0.05)';
      ctx.lineWidth = 1;

      // Draw horizontal separator lines for each channel baseline
      CHANNELS.forEach((ch) => {
        const baseY = h * (ch.yFrac + ch.hFrac * 0.5);
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        ctx.lineTo(w, baseY);
        ctx.stroke();
      });

      // Draw vertical time guide lines
      const x1 = w * 0.18;
      const x2 = w * 0.54;
      const xNow = w * 0.92;

      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.25)' : 'rgba(0, 242, 255, 0.25)';
      ctx.lineWidth = 1.2;

      [x1, x2, xNow].forEach((xPos) => {
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, h);
        ctx.stroke();
      });

      // Render each active channel waveform
      CHANNELS.forEach((ch) => {
        if (activeTypes[ch.id] === false) return; // Layer toggled off

        const chH = h * ch.hFrac;
        const baseY = h * (ch.yFrac + ch.hFrac * 0.5);

        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();

        if (ch.type === 'noise') {
          // Continuous micro-jitter with localized packet bursts
          for (let x = 0; x < w; x += 2) {
            const n1 = Math.sin((x * 0.08) + frame * 0.08);
            const n2 = Math.cos((x * 0.19) - frame * 0.05);
            const n3 = Math.sin((x * 0.35) + frame * 0.12);
            const jitter = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * (chH * 0.45);
            const y = baseY + jitter;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        } else if (ch.type === 'burst') {
          // High-frequency burst square blocks / pulse floods
          for (let x = 0; x < w; x += 3) {
            // Pulse train generator
            const cycle = (x * 0.06 + frame * 0.07) % 6;
            let val = 0;
            if (cycle < 2.8) {
              const subPulse = Math.sin(x * 0.8 + frame * 0.2);
              val = subPulse > -0.2 ? -chH * 0.85 : -chH * 0.1;
            } else if (cycle < 3.4) {
              val = 0;
            } else if (cycle < 5.2) {
              const subPulse = Math.cos(x * 0.6 - frame * 0.2);
              val = subPulse > 0 ? -chH * 0.75 : 0;
            }
            const y = baseY + val;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        } else if (ch.type === 'square') {
          // Intruders: step/square wave patterns
          for (let x = 0; x < w; x += 3) {
            const stepCycle = (x * 0.04 - frame * 0.05) % 4;
            const isHigh = stepCycle < 1.6 && Math.sin(x * 0.12 + frame * 0.1) > -0.4;
            const y = baseY + (isHigh ? -chH * 0.8 : 0);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        } else if (ch.type === 'sine') {
          // Scanners: multi-tone undulating carrier wave
          for (let x = 0; x < w; x += 2) {
            const wave = Math.sin((x * 0.05) + frame * 0.06) * 0.6 +
                         Math.cos((x * 0.12) - frame * 0.04) * 0.4;
            const y = baseY + wave * (chH * 0.4);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        } else if (ch.type === 'spikes') {
          // Anonymizers: sparse sharp needle pulses
          for (let x = 0; x < w; x += 4) {
            const spikeIndex = Math.floor((x + frame * 1.5) / 55);
            const isSpike = (spikeIndex * 137) % 11 < 2 && ((x + frame * 1.5) % 55 < 8);
            const y = baseY + (isSpike ? -chH * 0.95 : 0);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }

        ctx.stroke();

        // Subtle glow effect
        ctx.save();
        ctx.strokeStyle = `${ch.color}40`;
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.restore();
      });

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [activeTypes, isCollapsed, theme]);

  return (
    <div className={`threat-oscilloscope-panel ${isCollapsed ? 'is-collapsed' : ''}`}>
      {/* Top Header Bar: Timestamps & Collapse Button */}
      <div className="oscilloscope-topbar">
        <div className="time-markers-row">
          <div className="time-mark t1">
            <span>{timeMarkers.t1}</span>
          </div>
          <div className="time-mark t2">
            <span>{timeMarkers.t2}</span>
          </div>
          <div className="time-mark tNow">
            <span>{timeMarkers.tNow}</span>
          </div>
        </div>

        <button
          type="button"
          className="oscilloscope-collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Timeline Monitor' : 'Collapse Timeline Monitor'}
        >
          {isCollapsed ? (
            <>
              <TbChevronUp size={14} /> EXPAND
            </>
          ) : (
            <>
              <TbX size={14} /> COLLAPSE
            </>
          )}
        </button>
      </div>

      {/* Main Oscilloscope Waveform Stage */}
      {!isCollapsed && (
        <div className="oscilloscope-stage">
          <canvas ref={canvasRef} className="oscilloscope-canvas" />

          {/* Right Channel Labels */}
          <div className="oscilloscope-channel-labels">
            <span
              className={`channel-tag ${activeTypes.web === false ? 'disabled' : ''}`}
              style={{ color: '#E74C3C' }}
            >
              WEB ATTACKERS
            </span>
            <span
              className={`channel-tag ${activeTypes.ddos === false ? 'disabled' : ''}`}
              style={{ color: '#F1C40F' }}
            >
              DDOS ATTACKERS
            </span>
            <span
              className={`channel-tag ${activeTypes.intruders === false ? 'disabled' : ''}`}
              style={{ color: '#3498DB' }}
            >
              INTRUDERS
            </span>
            <span
              className={`channel-tag ${activeTypes.scanners === false ? 'disabled' : ''}`}
              style={{ color: '#9B59B6' }}
            >
              SCANNERS
            </span>
            <span
              className={`channel-tag ${activeTypes.anonymizers === false ? 'disabled' : ''}`}
              style={{ color: '#8E44AD' }}
            >
              ANONYMIZERS
            </span>
          </div>
        </div>
      )}

      {/* Bottom Footer Info Bar */}
      <div className="oscilloscope-footer">
        <div className="footer-left">
          <span>&copy; Copyright 2026 Blu OSINT Intelligence Ltd. &ndash; All Rights Reserved</span>
        </div>
        <div className="footer-right">
          <button
            type="button"
            className="footer-link"
            onClick={() => setShowInfo((s) => !s)}
          >
            <TbInfoCircle size={13} />
            What is the Blu OSINT Live Threat Map?
          </button>
          <span className="footer-sep">&middot;</span>
          <span className="telemetry-status-pill">
            <span className="live-dot" /> Sensor Telemetry: Healthy
          </span>
        </div>
      </div>

      {/* Info Modal/Tooltip */}
      {showInfo && (
        <div className="map-info-modal">
          <div className="modal-header">
            <strong>About Blu OSINT Live Threat Map</strong>
            <button type="button" onClick={() => setShowInfo(false)}><TbX size={14} /></button>
          </div>
          <p>
            The Blu OSINT Live Cyber Threat Map visualizes global attack telemetry collected from our distributed sensor mesh, honeypots, and enterprise defense perimeters in real time.
          </p>
          <p>
            Categorized vectors highlight volumetric DDoS floods, WAF violations, unauthorized host penetration attempts, and anonymized TOR relays targeting monitored assets worldwide.
          </p>
        </div>
      )}
    </div>
  );
}
