import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { Panel } from '../components/ResultView.jsx';

const TYPE_COLORS = {
  ip: '#38bdf8', domain: '#a78bfa', email: '#f472b6', hash: '#fb923c',
  file: '#34d399', url: '#fbbf24', cve: '#f87171', username: '#22d3ee',
  malicious: '#ef4444', artifact: '#fb923c', victim: '#a78bfa', vuln: '#fbbf24',
  actor: '#f472b6', investigated: '#38bdf8', default: '#94a3b8',
};

function GraphCanvas({ graph }) {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);

  useEffect(() => {
    if (!graph) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }
    resize();
    window.addEventListener('resize', resize);

    const w = () => canvas.width / dpr;
    const h = () => canvas.height / dpr;

    const nodes = graph.nodes.map(n => ({
      ...n,
      x: (Math.random() * 0.6 + 0.2) * w(),
      y: (Math.random() * 0.6 + 0.2) * h(),
      vx: 0, vy: 0,
      r: n.size || 12,
    }));
    const links = graph.links.map(l => ({ ...l }));

    const linkTypeColors = { dns: '#38bdf8', c2: '#ef4444', delivery: '#fb923c', phishing: '#f472b6', spoof: '#fbbf24', distribution: '#fbbf24', exploitation: '#f87171', attribution: '#a78bfa', relation: '#38bdf8', default: '#38bdf8' };
    const colorFor = n => TYPE_COLORS[n.type] || TYPE_COLORS[n.group] || TYPE_COLORS.default;

    let rafId;
    let t = 0;

    function step() {
      t++;
      const dt = 0.55;
      const W = w(), H = h();

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let dist = Math.hypot(dx, dy) || 0.1;
          const min = a.r + b.r + 55;
          if (dist < min) {
            const force = (min - dist) * 0.02;
            dx /= dist; dy /= dist;
            a.vx -= dx * force; a.vy -= dy * force;
            b.vx += dx * force; b.vy += dy * force;
          }
        }
      }

      links.forEach(l => {
        const a = nodes.find(n => n.id === l.source || n.id === (l.source?.id) || n.label === l.source);
        const b = nodes.find(n => n.id === l.target || n.id === (l.target?.id) || n.label === l.target);
        if (!a || !b) return;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.1;
        const force = (dist - 120) * 0.004;
        const fx = (dx / dist) * force, fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      });

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        n.vx *= 0.85; n.vy *= 0.85;
        if (n.x < n.r) { n.x = n.r; n.vx *= -0.6; }
        if (n.x > W - n.r) { n.x = W - n.r; n.vx *= -0.6; }
        if (n.y < n.r) { n.y = n.r; n.vy *= -0.6; }
        if (n.y > H - n.r) { n.y = H - n.r; n.vy *= -0.6; }
      });

      nodesRef.current = nodes;
      linksRef.current = links;
      draw();
      rafId = requestAnimationFrame(step);
    }

    function draw() {
      const W = w(), H = h();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      linksRef.current.forEach(l => {
        const a = nodesRef.current.find(n => n.id === l.source || n.label === l.source);
        const b = nodesRef.current.find(n => n.id === l.target || n.label === l.target);
        if (!a || !b) return;
        const color = `${(linkTypeColors[l.type] || linkTypeColors.default)}55`;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        ctx.fillStyle = 'rgba(148,163,184,0.6)';
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        if (l.label) ctx.fillText(l.label, mx + 4, my);
      });

      nodesRef.current.forEach((n, i) => {
        const color = colorFor(n);
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.05 + i);

        ctx.strokeStyle = `${color}${Math.round(60 + pulse * 60).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 2 + pulse * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `${color}1f`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F1F5F9';
        ctx.font = '11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(n.label, n.x + n.r + 6, n.y + 4);
      });
    }

    rafId = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, [graph]);

  return (
    <div className="graph-canvas-wrap" style={{ height: 540 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function Graph() {
  const [graph, setGraph] = useState(null);
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.graph(), api.cases.list()])
      .then(([g, c]) => { setGraph(g); setCases(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function loadCase(id) {
    setCaseId(id);
    setLoading(true);
    const g = await api.graph(id).catch(() => ({ nodes: [], links: [], meta: {} }));
    setGraph(g);
    setLoading(false);
  }

  return (
    <div className="page">
      <div className="page-title">
        Entity Network Graph <span className="accent">◉</span>
        <span className="sub">Relationships between IPs, domains, hashes, actors & artifacts</span>
      </div>

      <Panel title="Relationship Mapping" right={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="input-field" style={{ width: 220 }} value={caseId} onChange={e => e.target.value && loadCase(e.target.value)}>
            <option value="">— GLOBAL DEMO GRAPH —</option>
            {cases.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn ghost small" onClick={() => { setCaseId(''); api.graph().then(setGraph); }}>Reset</button>
        </div>
      }>
        {loading && <div className="empty-state"><div className="loading-spinner" style={{ margin: '0 auto 10px' }} /> Calculating force layout…</div>}
        {graph && !loading && <GraphCanvas graph={graph} />}
        {graph?.meta?.nodeColors && (
          <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            {Object.entries(graph.meta.nodeColors).map(([k, v]) => (
              <span key={k} style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 9, height: 9, background: v, borderRadius: 2 }} /> {k.toUpperCase()}
              </span>
            ))}
          </div>
        )}
        <div className="demo-banner" style={{ marginTop: 10 }}>DEMO GRAPH CONTAINS SYNTHETIC MALWARE CAMPAIGN DATA — use case-scoped graphs for production intel.</div>
      </Panel>
    </div>
  );
}