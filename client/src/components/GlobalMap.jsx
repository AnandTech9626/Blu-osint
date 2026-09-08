import React, { useEffect, useRef, useState } from 'react';
import { WORLD_LAND, WORLD_BORDERS } from '../data/worldMapData.js';

// Global Telemetry Sensor Hubs
const TELEMETRY_HUBS = [
  { id: 'us-west', name: 'San Francisco', lat: 37.77, lng: -122.41, ip: '198.51.100.45', region: 'US-WEST', country: 'United States', countryCode: 'US', type: 'target' },
  { id: 'us-east', name: 'New York', lat: 40.71, lng: -74.00, ip: '198.51.100.22', region: 'US-EAST', country: 'United States', countryCode: 'US', type: 'target' },
  { id: 'us-dc', name: 'Washington DC', lat: 38.90, lng: -77.03, ip: '198.51.100.89', region: 'US-EAST', country: 'United States', countryCode: 'US', type: 'target' },
  { id: 'br-sp', name: 'São Paulo', lat: -23.55, lng: -46.63, ip: '177.18.204.12', region: 'SA-BRAZIL', country: 'Brazil', countryCode: 'BR', type: 'neutral' },
  { id: 'eu-lon', name: 'London', lat: 51.50, lng: -0.12, ip: '185.199.108.15', region: 'EU-WEST', country: 'United Kingdom', countryCode: 'GB', type: 'target' },
  { id: 'eu-fra', name: 'Frankfurt', lat: 50.11, lng: 8.68, ip: '185.220.101.35', region: 'EU-CENTRAL', country: 'Germany', countryCode: 'DE', type: 'origin' },
  { id: 'eu-ams', name: 'Amsterdam', lat: 52.36, lng: 4.90, ip: '194.109.6.92', region: 'EU-WEST', country: 'Netherlands', countryCode: 'NL', type: 'origin' },
  { id: 'eu-sto', name: 'Stockholm', lat: 59.32, lng: 18.06, ip: '193.180.251.1', region: 'EU-NORTH', country: 'Sweden', countryCode: 'SE', type: 'neutral' },
  { id: 'me-dxb', name: 'Dubai', lat: 25.20, lng: 55.27, ip: '94.200.12.5', region: 'ME-EAST', country: 'United Arab Emirates', countryCode: 'AE', type: 'target' },
  { id: 'in-bom', name: 'Mumbai', lat: 19.07, lng: 72.87, ip: '103.21.244.0', region: 'AP-SOUTH', country: 'India', countryCode: 'IN', type: 'target' },
  { id: 'sg-sin', name: 'Singapore', lat: 1.35, lng: 103.81, ip: '103.22.200.18', region: 'AP-SOUTHEAST', country: 'Singapore', countryCode: 'SG', type: 'target' },
  { id: 'jp-tyo', name: 'Tokyo', lat: 35.67, lng: 139.65, ip: '203.0.113.50', region: 'AP-NORTHEAST', country: 'Japan', countryCode: 'JP', type: 'target' },
  { id: 'kr-sel', name: 'Seoul', lat: 37.56, lng: 126.97, ip: '211.233.78.2', region: 'AP-NORTHEAST', country: 'South Korea', countryCode: 'KR', type: 'neutral' },
  { id: 'au-syd', name: 'Sydney', lat: -33.86, lng: 151.20, ip: '139.130.4.5', region: 'OC-AUSTRALIA', country: 'Australia', countryCode: 'AU', type: 'target' },
  { id: 'ru-mow', name: 'Moscow', lat: 55.75, lng: 37.61, ip: '45.154.255.8', region: 'RU-WEST', country: 'Russia', countryCode: 'RU', type: 'origin' },
  { id: 'cn-sha', name: 'Shanghai', lat: 31.23, lng: 121.47, ip: '180.149.132.47', region: 'CN-EAST', country: 'China', countryCode: 'CN', type: 'origin' },
  { id: 'it-rom', name: 'Rome', lat: 41.90, lng: 12.49, ip: '151.100.10.1', region: 'EU-SOUTH', country: 'Italy', countryCode: 'IT', type: 'target' },
];

// 5 Radware Categorized Threat Vectors
const RADWARE_ATTACK_VECTORS = [
  // 1. Web Attackers (Coral Red #E74C3C)
  { id: 'vec-1', from: 'us-west', to: 'in-bom', category: 'web', vector: 'WAF SQL Injection Exploit', port: 443, color: '#E74C3C', speed: 0.007 },
  { id: 'vec-2', from: 'eu-ams', to: 'us-east', category: 'web', vector: 'Cross-Site Scripting Injection', port: 80, color: '#E74C3C', speed: 0.008 },
  { id: 'vec-3', from: 'cn-sha', to: 'me-dxb', category: 'web', vector: 'Zero-Day API Access Violation', port: 8080, color: '#E74C3C', speed: 0.006 },
  
  // 2. DDoS Attackers (Gold Yellow #F1C40F)
  { id: 'vec-4', from: 'us-east', to: 'it-rom', category: 'ddos', vector: '120 Gbps UDP Amp Flood', port: 123, color: '#F1C40F', speed: 0.009 },
  { id: 'vec-5', from: 'eu-fra', to: 'jp-tyo', category: 'ddos', vector: 'TCP SYN Flood Exhaustion', port: 443, color: '#F1C40F', speed: 0.007 },
  { id: 'vec-6', from: 'ru-mow', to: 'us-dc', category: 'ddos', vector: 'DNS Flood Amplification', port: 53, color: '#F1C40F', speed: 0.008 },

  // 3. Intruders (Sky Blue #3498DB)
  { id: 'vec-7', from: 'ru-mow', to: 'eu-lon', category: 'intruders', vector: 'Cobalt Strike C2 Beacon', port: 445, color: '#3498DB', speed: 0.006 },
  { id: 'vec-8', from: 'cn-sha', to: 'us-west', category: 'intruders', vector: 'SSL VPN Gateway Exploit', port: 10443, color: '#3498DB', speed: 0.007 },
  { id: 'vec-9', from: 'br-sp', to: 'us-east', category: 'intruders', vector: 'SSH Brute-Force Penetration', port: 22, color: '#3498DB', speed: 0.005 },

  // 4. Scanners (Electric Violet #9B59B6)
  { id: 'vec-10', from: 'us-west', to: 'au-syd', category: 'scanners', vector: 'Port 4500 IPsec Sweep', port: 4500, color: '#9B59B6', speed: 0.006 },
  { id: 'vec-11', from: 'eu-ams', to: 'sg-sin', category: 'scanners', vector: 'Port 23 Mirai Scan Probe', port: 23, color: '#9B59B6', speed: 0.007 },
  { id: 'vec-12', from: 'cn-sha', to: 'it-rom', category: 'scanners', vector: 'SIP VoIP Gateway Sweep', port: 5060, color: '#9B59B6', speed: 0.006 },

  // 5. Anonymizers (Deep Magenta #8E44AD)
  { id: 'vec-13', from: 'eu-fra', to: 'in-bom', category: 'anonymizers', vector: 'TOR Exit Node Exfiltration', port: 9001, color: '#8E44AD', speed: 0.005 },
  { id: 'vec-14', from: 'ru-mow', to: 'sg-sin', category: 'anonymizers', vector: 'Bulletproof Proxy Tunnel', port: 1080, color: '#8E44AD', speed: 0.006 },
];

// Highlighted country zones for Radware-style regional heat glow
const HIGHLIGHT_REGIONS = [
  { name: 'United States', lat: 39, lng: -98, radius: 24, color: 'rgba(77, 56, 143, 0.45)' },
  { name: 'Europe', lat: 50, lng: 10, radius: 18, color: 'rgba(77, 56, 143, 0.45)' },
  { name: 'India', lat: 21, lng: 78, radius: 14, color: 'rgba(52, 152, 219, 0.38)' },
  { name: 'China', lat: 35, lng: 105, radius: 20, color: 'rgba(142, 68, 173, 0.35)' },
  { name: 'Japan', lat: 36, lng: 138, radius: 10, color: 'rgba(231, 76, 60, 0.35)' },
  { name: 'Brazil', lat: -14, lng: -51, radius: 18, color: 'rgba(77, 56, 143, 0.38)' },
  { name: 'United Arab Emirates', lat: 24, lng: 54, radius: 8, color: 'rgba(241, 196, 15, 0.35)' },
];

// Equirectangular bounds
const LAT_MIN = -58;
const LAT_MAX = 83.5;

function geoToCanvas(lat, lng, w, h) {
  const x = ((lng + 180) / 360) * w;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * h;
  return { x, y };
}

function quadBezier(p0, p1, p2, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

export default function GlobalMap({ activeTypes = {}, theme = 'dark' }) {
  const canvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const [hoveredHub, setHoveredHub] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [showRadar, setShowRadar] = useState(false);

  const isLight = theme === 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let t = 0;

    const dpr = window.devicePixelRatio || 1;

    // Background cached offscreen canvas for Natural Earth vectors
    if (!bgCanvasRef.current) {
      bgCanvasRef.current = document.createElement('canvas');
    }
    const bgCanvas = bgCanvasRef.current;
    const bgCtx = bgCanvas.getContext('2d');

    let currentW = 0;
    let currentH = 0;

    function renderBackground(w, h) {
      bgCanvas.width = w * dpr;
      bgCanvas.height = h * dpr;
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Oceanic Background (Radware Deep Cyber Navy vs Clean Marine Slate)
      if (isLight) {
        const oceanGrad = bgCtx.createRadialGradient(w * 0.5, h * 0.45, w * 0.1, w * 0.5, h * 0.5, w * 0.75);
        oceanGrad.addColorStop(0, '#E8F1FC');
        oceanGrad.addColorStop(0.6, '#DDE8F8');
        oceanGrad.addColorStop(1, '#D0DFEE');
        bgCtx.fillStyle = oceanGrad;
      } else {
        // Authentic Radware midnight space-ocean
        const oceanGrad = bgCtx.createRadialGradient(w * 0.5, h * 0.45, w * 0.1, w * 0.5, h * 0.5, w * 0.75);
        oceanGrad.addColorStop(0, '#091524');
        oceanGrad.addColorStop(0.5, '#050B14');
        oceanGrad.addColorStop(1, '#02060B');
        bgCtx.fillStyle = oceanGrad;
      }
      bgCtx.fillRect(0, 0, w, h);

      // 2. High-Tech Coordinate Graticule (Curved / Dotted Lat-Long lines)
      bgCtx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.09)' : 'rgba(0, 242, 255, 0.06)';
      bgCtx.lineWidth = 0.8;
      bgCtx.setLineDash([2, 5]);

      for (let lng = -180; lng <= 180; lng += 30) {
        const x = ((lng + 180) / 360) * w;
        bgCtx.beginPath();
        bgCtx.moveTo(x, 0);
        bgCtx.lineTo(x, h);
        bgCtx.stroke();
      }

      for (let lat = -60; lat <= 80; lat += 20) {
        const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * h;
        bgCtx.beginPath();
        bgCtx.moveTo(0, y);
        bgCtx.lineTo(w, y);
        bgCtx.stroke();
      }
      bgCtx.setLineDash([]);

      // Equator & Prime Meridian subtle guides
      const eqY = (LAT_MAX / (LAT_MAX - LAT_MIN)) * h;
      bgCtx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.2)' : 'rgba(0, 242, 255, 0.15)';
      bgCtx.lineWidth = 1;
      bgCtx.beginPath();
      bgCtx.moveTo(0, eqY);
      bgCtx.lineTo(w, eqY);
      bgCtx.stroke();

      // 3. Regional Heat Clouds (Radware purple/indigo country illumination)
      if (!isLight) {
        HIGHLIGHT_REGIONS.forEach((reg) => {
          const pt = geoToCanvas(reg.lat, reg.lng, w, h);
          const rad = (reg.radius / 100) * w * 0.45;
          const glowGrad = bgCtx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, rad);
          glowGrad.addColorStop(0, reg.color);
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
          bgCtx.fillStyle = glowGrad;
          bgCtx.beginPath();
          bgCtx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
          bgCtx.fill();
        });
      }

      // 4. Real Natural Earth Landmasses (High-precision coastlines & islands)
      bgCtx.fillStyle = isLight ? '#FFFFFF' : 'rgba(12, 26, 43, 0.95)';
      bgCtx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.65)' : 'rgba(0, 242, 255, 0.55)';
      bgCtx.lineWidth = isLight ? 1.2 : 1.1;

      // Authentic Radware luminescent cyan coastal glow
      bgCtx.shadowColor = isLight ? 'rgba(2, 132, 199, 0.2)' : 'rgba(0, 242, 255, 0.35)';
      bgCtx.shadowBlur = isLight ? 3 : 6;

      WORLD_LAND.forEach(poly => {
        bgCtx.beginPath();
        poly.forEach(ring => {
          ring.forEach(([lng, lat], i) => {
            const pt = geoToCanvas(lat, lng, w, h);
            if (i === 0) bgCtx.moveTo(pt.x, pt.y);
            else bgCtx.lineTo(pt.x, pt.y);
          });
          bgCtx.closePath();
        });
        bgCtx.fill('evenodd');
        bgCtx.stroke();
      });

      bgCtx.shadowColor = 'transparent';
      bgCtx.shadowBlur = 0;

      // 5. Geopolitical Country Borders
      bgCtx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.25)' : 'rgba(0, 242, 255, 0.18)';
      bgCtx.lineWidth = 0.7;
      bgCtx.setLineDash([2, 3]);

      WORLD_BORDERS.forEach(line => {
        if (line.length < 2) return;
        bgCtx.beginPath();
        line.forEach(([lng, lat], i) => {
          const pt = geoToCanvas(lat, lng, w, h);
          if (i === 0) bgCtx.moveTo(pt.x, pt.y);
          else bgCtx.lineTo(pt.x, pt.y);
        });
        bgCtx.stroke();
      });
      bgCtx.setLineDash([]);
    }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w <= 0 || h <= 0) return;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      currentW = w;
      currentH = h;
      renderBackground(w, h);
    }

    resize();
    window.addEventListener('resize', resize);

    // Track active attack particles
    const particles = RADWARE_ATTACK_VECTORS.map((v, i) => ({
      ...v,
      progress: (i * 0.18) % 1,
      shockwave: 0,
    }));

    function draw() {
      t += 0.02;
      const w = currentW;
      const h = currentH;
      if (w <= 0 || h <= 0) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Cached Pre-rendered Map
      ctx.drawImage(bgCanvas, 0, 0, w, h);

      // 2. Precompute Hub Positions
      const hubsMap = {};
      TELEMETRY_HUBS.forEach(hub => {
        hubsMap[hub.id] = geoToCanvas(hub.lat, hub.lng, w, h);
      });

      // 3. Render Categorized Trajectories & Photon Bullets
      particles.forEach((p) => {
        // Filter check: If category is disabled in activeTypes, skip rendering
        if (activeTypes[p.category] === false) return;

        const start = hubsMap[p.from];
        const end = hubsMap[p.to];
        if (!start || !end) return;

        // Ballistic curved elevation
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.hypot(dx, dy);
        const arcHeight = Math.min(130, Math.max(35, dist * 0.26));
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2 - arcHeight;

        // Static glowing laser arc line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(midX, midY, end.x, end.y);
        ctx.strokeStyle = `${p.color}44`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Advance packet progress
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.shockwave = 1; // Trigger impact shockwave
        }

        // Current head and trailing position
        const curr = quadBezier(start, { x: midX, y: midY }, end, p.progress);
        const trail = quadBezier(start, { x: midX, y: midY }, end, Math.max(0, p.progress - 0.08));

        // Photon glow head
        const packetGrad = ctx.createRadialGradient(curr.x, curr.y, 1, curr.x, curr.y, 8);
        packetGrad.addColorStop(0, '#FFFFFF');
        packetGrad.addColorStop(0.4, p.color);
        packetGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = packetGrad;
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Tracer tail
        ctx.beginPath();
        ctx.moveTo(trail.x, trail.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Target shockwave impact rings
        if (p.shockwave > 0) {
          p.shockwave -= 0.035;
          const radius = (1 - p.shockwave) * 26;
          ctx.beginPath();
          ctx.arc(end.x, end.y, radius, 0, Math.PI * 2);
          const alphaHex = Math.round(Math.max(0, p.shockwave) * 255).toString(16).padStart(2, '0');
          ctx.strokeStyle = `${p.color}${alphaHex}`;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      });

      // 4. Draw Telemetry Nodes
      TELEMETRY_HUBS.forEach((hub, i) => {
        const pt = hubsMap[hub.id];
        if (!pt) return;

        const isHovered = hoveredHub?.id === hub.id;
        const nodePulse = 0.5 + 0.5 * Math.sin(t * 3.5 + i * 0.9);

        const hubColor =
          hub.type === 'origin'
            ? '#E74C3C'
            : hub.type === 'target'
            ? '#00F2FF'
            : '#2ECC71';

        // Outer pulsing ring
        ctx.fillStyle = isHovered ? `${hubColor}88` : `${hubColor}26`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isHovered ? 14 : 7 + nodePulse * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = isHovered ? '#FFFFFF' : hubColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isHovered ? 4.5 : 2.6, 0, Math.PI * 2);
        ctx.fill();

        // Subtle node label for major centers
        if (['us-east', 'us-west', 'eu-fra', 'jp-tyo', 'in-bom', 'me-dxb', 'au-syd'].includes(hub.id) && !hoveredHub) {
          ctx.fillStyle = isLight ? '#0F172A' : 'rgba(203, 213, 225, 0.75)';
          ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(hub.name, pt.x + 8, pt.y + 3);
        }
      });

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [activeTypes, theme, hoveredHub]);

  // Handle Mouse Hover Inspection
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found = null;
    TELEMETRY_HUBS.forEach(hub => {
      const pt = geoToCanvas(hub.lat, hub.lng, rect.width, rect.height);
      const dist = Math.hypot(mx - pt.x, my - pt.y);
      if (dist < 15) {
        found = hub;
      }
    });

    setHoveredHub(found);
    setHoverPos({ x: mx, y: my });
  };

  const handleMouseLeave = () => {
    setHoveredHub(null);
  };

  return (
    <div
      className="threat-map-canvas-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 480,
        background: isLight ? '#E8F1FC' : '#050B14',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: hoveredHub ? 'pointer' : 'crosshair',
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Interactive Telemetry Node Tooltip */}
      {hoveredHub && (
        <div
          className="map-node-tooltip"
          style={{
            position: 'absolute',
            left: Math.min(hoverPos.x + 14, (canvasRef.current?.clientWidth || 600) - 230),
            top: Math.max(16, hoverPos.y - 80),
          }}
        >
          <div className="tooltip-title">
            <span
              className="tooltip-dot"
              style={{
                background: hoveredHub.type === 'origin' ? '#E74C3C' : '#00F2FF',
              }}
            />
            {hoveredHub.name}, {hoveredHub.country}
          </div>
          <div className="tooltip-meta">
            {hoveredHub.ip} &middot; {hoveredHub.region}
          </div>
          <div className="tooltip-status">
            &bull; Sensor Synchronized &middot; 24ms SLA Latency
          </div>
        </div>
      )}
    </div>
  );
}