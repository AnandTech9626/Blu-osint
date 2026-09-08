import React, { useState } from 'react';
import { api } from '../lib/api.js';
import { Panel, KVGrid, LoadingBlock, ErrorBlock } from '../components/ResultView.jsx';

export default function PasswordCheck() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function analyze() {
    if (!password) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api.investigate('password', 'password-strength', { target: password }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function formatCrack(sec) {
    if (!isFinite(sec)) return 'Centuries';
    if (sec <= 0 || sec < 1) return 'Instant (< 1 sec)';
    if (sec < 60) return `${Math.round(sec)} seconds`;
    if (sec < 3600) return `${Math.round(sec / 60)} minutes`;
    if (sec < 86400) return `${Math.round(sec / 3600)} hours`;
    if (sec < 31536000) return `${Math.round(sec / 86400)} days`;
    if (sec < 31536000000) return `${(sec / 31536000).toFixed(1)} years`;
    return 'Multiple centuries';
  }

  return (
    <div className="page animate-in">
      <div className="page-title">
        Credential Strength & Entropy Audit
        <span className="sub">Mathematical entropy evaluation, pattern discovery, and offline brute-force crack-time models</span>
      </div>

      <Panel title="Credential Analysis Engine">
        <div style={{ position: 'relative' }}>
          <input
            className="input-field"
            type={show ? 'text' : 'password'}
            placeholder="Please enter your password to check strength..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            style={{ fontFamily: show ? 'var(--mono)' : 'inherit', fontSize: 14 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn primary" onClick={analyze} disabled={loading || !password}>
            {loading ? 'Evaluating…' : 'Evaluate Credential Entropy'}
          </button>
          <button className="btn ghost" onClick={() => setShow(s => !s)}>
            {show ? 'Mask Input' : 'Reveal Input'}
          </button>
        </div>

        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error} />}

        {result && !loading && (
          <div className="result-block animate-in">
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div className="threat-meter" style={{ width: '100%' }}>
                  <div
                    className="gauge"
                    style={{
                      background: `conic-gradient(${result.color} ${result.score * 25}%, rgba(255,255,255,0.06) 0)`,
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        background: 'var(--bg-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: result.color,
                        fontWeight: 800,
                      }}
                    >
                      {result.score}/4
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: result.color }}>
                      {result.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                      {result.entropy.bits.toFixed(1)} bits of mathematical Shannon entropy
                    </div>
                  </div>
                </div>
              </div>

              <div className="pw-meter" style={{ marginTop: 14 }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`seg ${result.score > i ? `on${i + 1}` : ''}`} />
                ))}
              </div>
            </div>

            <div className="section-grid" style={{ marginTop: 16 }}>
              <Panel title="Crack Time Estimates (Offline Hardware)">
                <KVGrid items={[
                  { k: 'Fast Hash Matrix (10 GH/s MD5/NTLM)', v: formatCrack(result.entropy.crackTimeSec) },
                  { k: 'Slow Key Derivation (Argon2 / bcrypt)', v: formatCrack(result.entropy.crackTimeSec * 1e6) },
                  { k: 'Character Length', v: `${result.length} characters` },
                  { k: 'Entropy Evaluation', v: `${result.entropy.bits.toFixed(1)} bits` },
                  { k: 'Estimated Time Window', v: result.entropy.crackTimeDisplay || '—' },
                ]} />
              </Panel>

              <Panel title="Vulnerabilities & Patterns">
                {result.issues?.length ? (
                  result.issues.map((iss, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        padding: '8px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        color: '#FCA5A5',
                        marginTop: 6,
                      }}
                    >
                      ▲ {iss}
                    </div>
                  ))
                ) : (
                  <div className="verdict clean" style={{ marginTop: 6 }}>
                    ● High-entropy credential with no dictionary or repeated patterns
                  </div>
                )}
                {result.patterns?.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Detected Token Sequences
                    </div>
                    {result.patterns.map((p, i) => (
                      <div key={i} style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                        • {p.pattern}: <span style={{ fontFamily: 'var(--mono)', color: 'var(--yellow)', fontWeight: 600 }}>{p.matchedToken}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}