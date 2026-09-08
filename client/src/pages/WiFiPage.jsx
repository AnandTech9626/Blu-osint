import React, { useState } from 'react';
import { api } from '../lib/api.js';
import { Panel, KVGrid, LoadingBlock, ErrorBlock } from '../components/ResultView.jsx';

const SEED_BSSIDS = [
  '5C:51:88:1A:2B:3C',
  'F0:B4:B6:12:34:56',
  '00:1A:2B:3C:4D:5E',
  'D4:CA:6D:A1:B2:C3',
  '50:67:F0:98:76:54',
  '00:B3:2B:DE:AD:BE',
];

export default function WiFiPage() {
  const [mode, setMode] = useState('bssid');
  const [bssid, setBssid] = useState('');
  const [ssid, setSsid] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function run() {
    if (mode === 'bssid' && !bssid.trim()) return;
    if (mode === 'ssid' && !ssid.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = mode === 'bssid' ? { target: bssid.trim() } : { ssid: ssid.trim() };
      setResult(await api.post('/investigate/wifi', body));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page animate-in">
      <div className="page-title">
        Wireless & Wi-Fi Intelligence
        <span className="sub">BSSID OUI vendor identification, MAC address semantics, and SSID vulnerability analysis</span>
      </div>

      <div className="module-tabs" style={{ marginBottom: 6 }}>
        <button
          className={`module-tab ${mode === 'bssid' ? 'active' : ''}`}
          onClick={() => {
            setMode('bssid');
            setResult(null);
            setError(null);
          }}
        >
          <span className="m-ic">⌖</span> BSSID / MAC Analyzer
        </button>
        <button
          className={`module-tab ${mode === 'ssid' ? 'active' : ''}`}
          onClick={() => {
            setMode('ssid');
            setResult(null);
            setError(null);
          }}
        >
          <span className="m-ic">≋</span> SSID Profile & Risk
        </button>
      </div>

      <Panel title={mode === 'bssid' ? 'BSSID Hardware Fingerprint' : 'SSID Identity Profiling'}>
        {mode === 'bssid' ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="input-field"
              style={{ flex: 1, minWidth: 260, fontFamily: 'var(--mono)' }}
              placeholder="e.g. 5C:51:88:1A:2B:3C"
              value={bssid}
              onChange={e => setBssid(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && run()}
            />
            <button className="btn primary" onClick={run} disabled={loading || !bssid.trim()}>
              {loading ? 'Analyzing…' : 'Analyze MAC Address'}
            </button>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', width: '100%', marginTop: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Sample OUIs:</span>
              {SEED_BSSIDS.map(s => (
                <button
                  key={s}
                  className="btn ghost small"
                  style={{ fontFamily: 'var(--mono)', fontSize: 11 }}
                  onClick={() => {
                    setBssid(s);
                    setTimeout(run, 50);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="input-field"
              style={{ flex: 1, minWidth: 260 }}
              placeholder="e.g. Corporate-Guest, AndroidAP, Airport-Free-WiFi"
              value={ssid}
              onChange={e => setSsid(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && run()}
            />
            <button className="btn primary" onClick={run} disabled={loading || !ssid.trim()}>
              {loading ? 'Profiling…' : 'Profile Network SSID'}
            </button>
          </div>
        )}

        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error} />}

        {result && !loading && (
          <div className="result-block animate-in">
            {result.error && <ErrorBlock message={result.error} />}
            {result.vendor && (
              <Panel title="Hardware & OUI Decomposition">
                <KVGrid items={[
                  { k: 'BSSID / MAC', v: result.formatted ? result.formatted.toUpperCase() : result.target },
                  { k: 'Hardware Vendor', v: result.vendor },
                  { k: 'MAC Administration', v: result.locallyAdministered ? 'Locally Administered (Randomized / Privacy MAC)' : 'Globally Unique (Hardware Burned-In)' },
                  { k: 'Broadcast Type', v: result.multinational ? 'Multinational' : 'Standard Unicast' },
                  { k: 'OUI Block Range', v: result.macAnalysis?.oui },
                  { k: 'NIC Portion', v: result.macAnalysis?.nic },
                  { k: 'Multicast Capable', v: result.macAnalysis?.multicastCapable ? 'Yes' : 'No' },
                ]} />
                {result.recommendations?.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase' }}>
                      Security Recommendations
                    </div>
                    {result.recommendations.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(56, 189, 248, 0.08)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          padding: '8px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          color: 'var(--text)',
                          marginTop: 6,
                        }}
                      >
                        ● {r}
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            )}
            {result.networkInfo && (
              <Panel title="Network Identity & Security Classification">
                <KVGrid items={[
                  { k: 'Network SSID', v: result.target },
                  { k: 'Network Category', v: result.networkInfo.type },
                  { k: 'Associated Hardware Vendor', v: result.networkInfo.vendor },
                  { k: 'Risk Classification', v: result.networkInfo.risk },
                ]} />
              </Panel>
            )}
            {result.riskIndicators?.length > 0 && (
              <Panel title="Wireless Risk Indicators">
                {result.riskIndicators.map((r, i) => (
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
                    ▲ {r}
                  </div>
                ))}
              </Panel>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}