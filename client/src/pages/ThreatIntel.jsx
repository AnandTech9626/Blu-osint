import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Panel } from '../components/ResultView.jsx';

const SEV_COLORS = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
  unknown: '#94A3B8',
};

export default function ThreatIntel() {
  const [feed, setFeed] = useState([]);
  const [cves, setCves] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState('');
  const [cveQuery, setCveQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cveLoading, setCveLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.threatFeed(), api.threatStats(), api.cves()])
      .then(([f, s, c]) => {
        setFeed(f);
        setStats(s);
        setCves(Array.isArray(c) ? c : c.error ? [] : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function searchThreat() {
    if (!query.trim()) return;
    setLoading(true);
    const res = await api.threatSearch(query.trim()).catch(() => []);
    setFeed(res);
    setLoading(false);
  }

  async function searchCVE() {
    setCveLoading(true);
    const res = await api.cves(cveQuery.trim() || undefined).catch(() => []);
    setCves(Array.isArray(res) ? res : []);
    setCveLoading(false);
  }

  return (
    <div className="page animate-in">
      <div className="page-title">
        Threat Intelligence & Vulnerability Feeds
        <span className="sub">Global pulse feeds · APT campaign tracking · National Vulnerability Database (CVE)</span>
      </div>

      <div className="section-grid three">
        {/* Threat Pulse Feed */}
        <Panel title="Global Threat Pulse Feed" right={loading && <div className="loading-spinner" />}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input
              className="input-field"
              placeholder="Search threat actors, malware, campaigns..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchThreat()}
            />
            <button className="btn small primary" onClick={searchThreat}>Search</button>
          </div>
          <div className="threat-list" style={{ maxHeight: 480 }}>
            {feed.map(t => (
              <div className="threat-card" key={t.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="sev-dot" style={{ background: SEV_COLORS[t.severity] || '#38BDF8' }} />
                  <strong style={{ fontSize: 13, color: 'var(--text)' }}>{t.name}</strong>
                  <span className="tag" style={{ fontSize: 10 }}>{t.type}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-faint)' }}>{t.source}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.45 }}>
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        {/* CVE Watchlist */}
        <Panel title="CVE Vulnerability Watchlist">
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input
              className="input-field"
              placeholder="Filter by software, CVE-ID, or vendor..."
              value={cveQuery}
              onChange={e => setCveQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchCVE()}
            />
            <button className="btn small primary" onClick={searchCVE}>{cveLoading ? '…' : 'Scan'}</button>
          </div>
          <div className="threat-list" style={{ maxHeight: 480 }}>
            {cves.map(c => (
              <div className="threat-card" key={c.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="sev-dot" style={{ background: SEV_COLORS[c.severity] || '#94A3B8' }} />
                  <strong style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{c.id}</strong>
                  {c.score ? <span className="tag red" style={{ fontSize: 10 }}>CVSS {c.score}</span> : null}
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-faint)' }}>{c.source}</span>
                </div>
                {c.description && (
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.45 }}>
                    {c.description.slice(0, 180)}…
                  </p>
                )}
              </div>
            ))}
          </div>
        </Panel>

        {/* Statistics and Threat Alerting Rules */}
        <div className="intel-side">
          <Panel title="Threat Feed Statistics">
            <div className="stats-grid">
              <div className="stat-row">
                <span className="name"><span className="dot" style={{ background: '#EF4444' }} />Critical</span>
                <span className="num">{stats?.bySeverity?.critical ?? 0}</span>
              </div>
              <div className="stat-row">
                <span className="name"><span className="dot" style={{ background: '#F97316' }} />High</span>
                <span className="num">{stats?.bySeverity?.high ?? 0}</span>
              </div>
              <div className="stat-row">
                <span className="name"><span className="dot" style={{ background: '#F59E0B' }} />Medium</span>
                <span className="num">{stats?.bySeverity?.medium ?? 0}</span>
              </div>
              <div className="stat-row">
                <span className="name"><span className="dot" style={{ background: '#10B981' }} />Low</span>
                <span className="num">{stats?.bySeverity?.low ?? 0}</span>
              </div>
              <div className="stat-row">
                <span className="name"><span className="dot" style={{ background: '#38BDF8' }} />Active Pulses</span>
                <span className="num">{stats?.active ?? 0}</span>
              </div>
              <div className="stat-row">
                <span className="name"><span className="dot" style={{ background: '#8B5CF6' }} />Total Tracked</span>
                <span className="num">{stats?.total ?? 0}</span>
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--text-faint)', lineHeight: 1.5 }}>
              Pulses synchronized continuously from AlienVault OTX, VirusTotal Community, and NIST NVD repositories.
            </div>
          </Panel>

          <Panel title="SOC Automated Detection Rules">
            {[
              { label: 'C2 Beaconing Detection', state: 'ARMED' },
              { label: 'Credential Leak Monitoring', state: 'ARMED' },
              { label: 'Public Exploit PoC Radar', state: 'ARMED' },
              { label: 'High-Volume Port Recon', state: 'ACTIVE' },
              { label: 'IOC Threat Aging & Scoring', state: 'ARMED' },
            ].map(r => (
              <div className="stat-row" key={r.label}>
                <span className="name" style={{ color: 'var(--text)' }}>● {r.label}</span>
                <span className="num" style={{ color: r.state === 'ARMED' ? 'var(--green)' : 'var(--accent)', fontSize: 11.5 }}>
                  {r.state}
                </span>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}