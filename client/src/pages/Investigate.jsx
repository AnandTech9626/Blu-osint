import React, { useState, useEffect } from 'react';
import {
  TbDiamondFilled,
  TbMail,
  TbPhone,
} from 'react-icons/tb';
import { api } from '../lib/api.js';
import { VerdictBadge, KVGrid, DataTable, ScoreBar, LoadingBlock, ErrorBlock, Panel } from '../components/ResultView.jsx';

const TABS = [
  { id: 'domain', label: 'Domain', icon: <TbDiamondFilled size={13} />, placeholder: 'example.com', hint: 'Reputation, DNS, WHOIS, and SSL certificates' },
  { id: 'ip', label: 'IP Address', icon: <TbDiamondFilled size={13} />, placeholder: '8.8.8.8', hint: 'Geolocation, ASN, open ports, and threat score' },
  { id: 'email', label: 'Email', icon: <TbMail size={16} />, placeholder: 'analyst@domain.com', hint: 'Breach exposure, domain health, and reputation' },
  { id: 'phone', label: 'Phone', icon: <TbPhone size={16} />, placeholder: '+14155552671', hint: 'Carrier, line type, geolocation, and OSINT footprint' },
];

export default function Investigate({ initialTarget, onClearTarget }) {
  const [tab, setTab] = useState('domain');
  const [input, setInput] = useState(initialTarget || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(['google.com', '1.1.1.1', 'analyst@domain.com', '+14155552671']);

  // Handle incoming quick search from topbar
  useEffect(() => {
    if (initialTarget && initialTarget !== input) {
      setInput(initialTarget);
      if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(initialTarget.trim())) {
        setTab('ip');
      } else if (initialTarget.includes('@')) {
        setTab('email');
      } else if (/^\+?[0-9\s-()]{7,}$/.test(initialTarget.trim()) && !initialTarget.includes('.')) {
        setTab('phone');
      } else {
        setTab('domain');
      }
      if (onClearTarget) onClearTarget();
    }
  }, [initialTarget]);

  const current = TABS.find(t => t.id === tab) || TABS[0];

  async function run() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const target = input.trim();
      if (tab === 'domain') {
        const [domain, dns, whois, ssl] = await Promise.allSettled([
          api.investigate('domain', target),
          api.investigate('dns', target),
          api.investigate('whois', target),
          api.investigate('ssl', target),
        ]);
        const results = [];
        [domain, dns, whois, ssl].forEach(rp => {
          if (rp.status === 'fulfilled' && rp.value) results.push(rp.value);
        });
        setResult({ module: 'domain-bundle', target, results });
      } else {
        setResult(await api.investigate(tab, target));
      }
      setHistory(h => [input, ...h.filter(x => x !== input)].slice(0, 6));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function renderModule(r) {
    if (!r) return null;

    if (r.module === 'domain') {
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <VerdictBadge threat={r.threat} />
            <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
              Target: {r.target}
            </span>
          </div>
          <ScoreBar score={r.threat?.score ?? 0} />
          <div className="section-grid" style={{ marginTop: 16 }}>
            <Panel title="Reputation & Detection">
              <KVGrid items={[
                { k: 'Malicious detections', v: r.threat?.malicious ?? 0 },
                { k: 'Suspicious detections', v: r.threat?.suspicious ?? 0 },
                { k: 'Harmless verdicts', v: r.threat?.harmless ?? 0 },
                { k: 'Community pulses', v: r.communityNotes ?? 0 },
                { k: 'Classification tags', v: r.tags?.join(', ') || '—' },
              ]} />
            </Panel>
            <Panel title="DNS Resolutions">
              <DataTable
                headers={['HOST', 'TYPE', 'VALUE']}
                rows={(r.dns || []).map(d => ({ HOST: d.hostname, TYPE: d.type, VALUE: d.value, VALUE_mono: true }))}
              />
            </Panel>
          </div>
        </>
      );
    }

    if (r.module === 'ip') {
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <VerdictBadge threat={r.threat} />
            <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>{r.target}</span>
          </div>
          <ScoreBar score={r.threat?.score ?? 0} />
          <div className="section-grid" style={{ marginTop: 16 }}>
            <Panel title="Geolocation & ASN Profile">
              <KVGrid items={[
                { k: 'Country', v: r.geo?.country },
                { k: 'City', v: r.geo?.city },
                { k: 'Autonomous System (ASN)', v: r.geo?.asn },
                { k: 'Organization / ISP', v: r.geo?.as_owner || r.geo?.isp },
                { k: 'Geo Coordinates', v: r.geo?.lat != null ? `${r.geo.lat.toFixed(4)}, ${r.geo.lng.toFixed(4)}` : '—' },
              ]} />
            </Panel>
            <Panel title={`Open Network Services (${r.services?.length || 0})`}>
              <DataTable
                headers={['PORT', 'PROTO', 'SERVICE', 'VERSION']}
                rows={(r.services || []).map(s => ({ PORT: s.port, PROTO: s.protocol, SERVICE: s.service, VERSION: s.version || '—' })).slice(0, 12)}
              />
            </Panel>
          </div>
        </>
      );
    }

    if (r.module === 'email') {
      return (
        <>
          <VerdictBadge threat={r.threat} />
          <div className="section-grid" style={{ marginTop: 16 }}>
            <Panel title="Identity & Domain Profile">
              <KVGrid items={[
                { k: 'Email Address', v: r.target },
                { k: 'Associated Domain', v: r.domain?.name },
                { k: 'Service Provider Type', v: r.domain?.isFreemail ? 'Consumer / Webmail' : 'Enterprise Corporate Domain' },
                { k: 'Extracted Username', v: r.username },
                { k: 'Threat Reports', v: r.threat?.malicious ?? 0 },
              ]} />
            </Panel>
            <Panel title={`Known Breach Occurrences (${r.breachCount || 0})`}>
              <DataTable
                headers={['NAME', 'CREATED', 'ADVERSARY']}
                rows={(r.breaches || []).map(b => ({ NAME: b.name, CREATED: b.created ? b.created.slice(0, 10) : '—', ADVERSARY: b.adversary || '—' }))}
              />
            </Panel>
          </div>
        </>
      );
    }

    if (r.module === 'phone') {
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <VerdictBadge threat={r.threat} />
            <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
              {r.formatted?.international || r.target}
            </span>
          </div>
          <ScoreBar score={r.threat?.score ?? 0} />
          <div className="section-grid" style={{ marginTop: 16 }}>
            <Panel title="Telecommunications & Carrier Intelligence">
              <KVGrid items={[
                { k: 'Phone Number (E.164)', v: r.formatted?.e164 },
                { k: 'National Number', v: r.formatted?.national },
                { k: 'Country / Jurisdiction', v: `${r.location?.country} (${r.location?.iso})` },
                { k: 'Network Carrier / Operator', v: r.telecom?.carrier },
                { k: 'Line Classification', v: r.telecom?.lineType },
                { k: 'MCC / MNC Code', v: `${r.telecom?.mcc} / ${r.telecom?.mnc}` },
                { k: 'Number Portability Status', v: r.telecom?.isPorted ? 'Ported to alternative carrier' : 'Native original allocation' },
              ]} />
            </Panel>
            <Panel title="Reputation & Digital Footprint">
              <KVGrid items={[
                { k: 'Risk Score', v: `${r.threat?.score}/100 (${r.threat?.spamRisk} Risk)` },
                { k: 'Spam / Robocall Analysis', v: r.threat?.reputationVerdict },
                { k: 'Virtual / Disposable VoIP', v: r.threat?.isDisposableVoip ? 'Yes (Elevated Anonymity)' : 'No (Standard Carrier SIM)' },
                { k: 'Primary Timezones', v: r.location?.timezones?.join(', ') || '—' },
              ]} />
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Messenger & Social Platform Footprint
                </div>
                <DataTable
                  headers={['PLATFORM', 'STATUS', 'DISCOVERY DETAILS']}
                  rows={(r.footprint || []).map(f => ({
                    PLATFORM: f.service,
                    STATUS: f.registered ? 'IDENTIFIED' : 'UNREGISTERED',
                    'DISCOVERY DETAILS': f.status,
                  }))}
                />
              </div>
            </Panel>
          </div>
        </>
      );
    }

    return <pre style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(r, null, 2)}</pre>;
  }

  function renderResult() {
    if (!result) return null;
    if (result.module === 'domain-bundle') {
      const labels = { domain: 'Domain Reputation & Threats', dns: 'DNS Infrastructure', whois: 'WHOIS Registration', ssl: 'SSL / TLS Certificates' };
      const domainRes = result.results.find(x => x.module === 'domain');
      return (
        <>
          {domainRes?.threat && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <VerdictBadge threat={domainRes.threat} />
              <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
                Target: {result.target}
              </span>
            </div>
          )}
          {domainRes?.threat && <ScoreBar score={domainRes.threat.score ?? 0} />}
          <div className="result-block">
            {result.results.map((r, i) => (
              <div key={i}>
                <div
                  className="panel-header"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '10px 10px 0 0',
                    background: 'var(--bg-1)',
                    borderBottom: '1px solid var(--border)',
                    marginTop: i === 0 ? 4 : 16,
                  }}
                >
                  <h3>{labels[r.module] || r.module.toUpperCase()}</h3>
                </div>
                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '0 0 10px 10px',
                    borderTop: 'none',
                    background: 'rgba(13, 19, 34, 0.65)',
                    padding: 16,
                  }}
                >
                  {renderModule(r)}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
    return renderModule(result);
  }

  return (
    <div className="page animate-in">
      <div className="page-title">
        Investigate
        <span className="sub">Automated multi-source correlation across VirusTotal, Shodan, AlienVault & DNS</span>
      </div>

      {/* Segmented Module Tabs: Exactly 4 Tabs (Domain, IP Address, Email, Phone) */}
      <div className="module-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`module-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => {
              setTab(t.id);
              setResult(null);
              setError(null);
            }}
          >
            <span className="m-ic">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Target Search Card */}
      <Panel
        title={`${current.label} Analysis`}
        right={<span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{current.hint}</span>}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input
              className="input-field"
              placeholder={current.placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && run()}
            />
            {history.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-faint)', marginRight: 4 }}>Recent targets:</span>
                {history.map((h, i) => (
                  <button
                    key={i}
                    className="btn ghost small"
                    onClick={() => { setInput(h); }}
                    style={{ fontFamily: 'var(--mono)', fontSize: 11 }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="btn primary"
            onClick={run}
            disabled={loading || !input.trim()}
            style={{ padding: '10px 22px' }}
          >
            {loading ? 'Analyzing Target…' : 'Run Intelligence Query'}
          </button>
        </div>

        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error} />}
        {!loading && result && <div className="result-block">{renderResult()}</div>}
        {!loading && !result && !error && (
          <div className="empty-state">
            Enter a target domain, IP, email, or phone number to begin correlated intelligence enrichment.
          </div>
        )}
      </Panel>
    </div>
  );
}