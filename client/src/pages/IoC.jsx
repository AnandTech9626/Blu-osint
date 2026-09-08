import React, { useState } from 'react';
import { api } from '../lib/api.js';
import { Panel, ErrorBlock } from '../components/ResultView.jsx';

const SEED_IOC = `45.227.255.8
185.220.101.35
malware-domain-download.com
eicar-malware-test.org
https://sus-phish.example.com/login
44d88612fea8a8f36de82e1278abb02f
CVE-2026-4821
suspicious_sample.exe
attacker@protonmail.com`;

export default function IoC() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enrich, setEnrich] = useState(true);

  async function analyze() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api.post('/investigate/ioc', { target: input, enrich }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const typeColors = {
    ip: '#38BDF8',
    domain: '#818CF8',
    url: '#FBBF24',
    hash: '#FB923C',
    email: '#F472B6',
    cve: '#F87171',
  };

  const verdictStyle = v =>
    ({
      clean: 'var(--green)',
      malicious: 'var(--red)',
      suspicious: 'var(--accent-orange)',
      unknown: 'var(--text-dim)',
    }[v] || 'var(--text-dim)');

  return (
    <div className="page animate-in">
      <div className="page-title">
        Indicator of Compromise (IOC) Engine
        <span className="sub">Extract, categorize, and cross-reference indicators from forensic reports and raw text</span>
      </div>

      <Panel
        title="IOC Extraction & Telemetry Correlation"
        right={
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-dim)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={enrich}
              onChange={e => setEnrich(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            <span>Cross-reference with VirusTotal & AlienVault feeds</span>
          </label>
        }
      >
        <textarea
          className="input-field"
          style={{ minHeight: 150, resize: 'vertical', fontFamily: 'var(--mono)', fontSize: 12.5 }}
          placeholder={'Paste raw incident logs, email headers, firewall alerts, or threat reports here…\n\nExample:\n45.227.255.8\nmalware-domain-download.com\n44d88612fea8a8f36de82e1278abb02f'}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
          <button className="btn primary" onClick={analyze} disabled={loading || !input.trim()}>
            {loading ? 'Processing Indicators…' : 'Extract & Correlate Indicators'}
          </button>
          <button className="btn ghost" onClick={() => setInput(SEED_IOC)}>
            Load Sample Threat Artifacts
          </button>
        </div>

        {error && <ErrorBlock message={error} />}

        {result && !loading && (
          <div className="result-block animate-in">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {Object.entries(result.types).map(
                ([type, list]) =>
                  list.length > 0 && (
                    <span
                      key={type}
                      className="tag"
                      style={{
                        background: `${typeColors[type]}18`,
                        color: typeColors[type],
                        borderColor: `${typeColors[type]}40`,
                        fontWeight: 700,
                      }}
                    >
                      {type.toUpperCase()} · {list.length}
                    </span>
                  )
              )}
              <span className="tag" style={{ marginLeft: 'auto', color: 'var(--text-dim)' }}>
                Total Extracted: {result.total}
              </span>
            </div>

            {result.enrichments?.length > 0 && (
              <Panel title={`Correlated Threat Findings (${result.enrichments.length})`}>
                {result.enrichments.map((e, i) => (
                  <div key={i} className="threat-card" style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        className="tag"
                        style={{
                          background: `${typeColors[e.type]}18`,
                          color: typeColors[e.type],
                          fontSize: 10,
                        }}
                      >
                        {e.type.toUpperCase()}
                      </span>
                      <strong style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
                        {e.ioc}
                      </strong>
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: 12,
                          fontWeight: 700,
                          color: verdictStyle(e.verdict),
                          textTransform: 'uppercase',
                        }}
                      >
                        {e.verdict || 'Unknown'} · {e.maliciousCount ?? 0} Detections
                      </span>
                    </div>
                    {e.detections?.length > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 11.5,
                          color: 'var(--text-dim)',
                          maxHeight: 90,
                          overflowY: 'auto',
                          lineHeight: 1.5,
                        }}
                      >
                        {e.detections.slice(0, 6).map((d, di) => (
                          <div key={di} style={{ fontFamily: 'var(--mono)' }}>
                            • {d.engine}: <span style={{ color: 'var(--red)', fontWeight: 600 }}>{d.result}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </Panel>
            )}

            <div className="section-grid">
              {Object.entries(result.types)
                .filter(([, v]) => v.length)
                .map(([type, list]) => (
                  <Panel key={type} title={`${type.toUpperCase()} Entities (${list.length})`}>
                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                      {list.map((v, i) => (
                        <div
                          key={i}
                          style={{
                            fontFamily: 'var(--mono)',
                            fontSize: 12,
                            padding: '6px 0',
                            borderBottom: '1px solid var(--border)',
                            color: 'var(--text-dim)',
                          }}
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                  </Panel>
                ))}
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="empty-state">
            Extract and correlate IPs, domains, URLs, hashes, emails, and CVE numbers automatically.
          </div>
        )}
      </Panel>
    </div>
  );
}