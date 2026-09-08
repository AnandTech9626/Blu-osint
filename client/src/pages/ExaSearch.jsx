import React, { useState } from 'react';
import { api } from '../lib/api.js';
import { Panel, ErrorBlock, LoadingBlock } from '../components/ResultView.jsx';

export default function ExaSearch() {
  const [query, setQuery] = useState('');
  const [numResults, setNumResults] = useState(8);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.exaSearch(query.trim(), numResults);
      setResults(res.results || []);
      setMeta({ demo: res.demo, error: res.error });
    } catch (e) {
      setError(e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page animate-in">
      <div className="page-title">
        Deep Web Intelligence Search
        <span className="sub">Neural search across indexed threat advisories, technical disclosures, and open web sources</span>
      </div>

      <Panel title="OSINT Web Query Engine">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="input-field"
            style={{ flex: 1, minWidth: 260 }}
            placeholder="e.g. ransomware operator infrastructure, CVE-2026 exploit proof of concept, bulletproof hosting ASN"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <select
            className="input-field"
            style={{ width: 130 }}
            value={numResults}
            onChange={e => setNumResults(+e.target.value)}
          >
            {[5, 8, 10, 15].map(n => <option key={n} value={n}>{n} results</option>)}
          </select>
          <button className="btn primary" onClick={search} disabled={loading || !query.trim()}>
            {loading ? 'Searching…' : 'Run Web Intelligence Search'}
          </button>
        </div>

        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error} />}

        {results.length > 0 && !loading && (
          <div className="result-block animate-in">
            {results.map((r, i) => (
              <div key={i} className="threat-card" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--accent)', textDecoration: 'none' }}
                  >
                    {r.title}
                  </a>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2, wordBreak: 'break-all' }}>
                  {r.url}
                </div>
                {r.snippet && (
                  <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.5 }}>
                    {r.snippet}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}