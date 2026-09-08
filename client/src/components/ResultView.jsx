import React from 'react';

export function VerdictBadge({ threat }) {
  if (!threat) return null;
  const level = (threat.level || 'clean').toLowerCase();
  const label = level === 'clean' ? 'Safe / Clean' : level.toUpperCase();
  const score = threat.score ?? 0;

  return (
    <div className={`verdict ${level}`}>
      <span>●</span>
      <span>{label}</span>
      <span style={{ opacity: 0.7, marginLeft: 6, fontWeight: 500, fontSize: 11 }}>
        Threat Score: {score}/100
      </span>
    </div>
  );
}

export function KVGrid({ items }) {
  const rows = items.filter(Boolean);
  if (!rows.length) return null;
  return (
    <div className="kv-grid">
      {rows.map((r, i) => (
        <div className="kv-item" key={i}>
          <div className="k">{r.k}</div>
          <div className="v">{r.v || '—'}</div>
        </div>
      ))}
    </div>
  );
}

export function DataTable({ headers, rows }) {
  if (!rows?.length) return <div className="empty-state">No records available for this query</div>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="list-table">
        <thead>
          <tr>
            {headers.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {headers.map(h => (
                <td key={h} className={row[`${h}_mono`] ? 'mono' : ''}>
                  {row[h] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScoreBar({ score }) {
  const color =
    score > 75
      ? 'var(--red)'
      : score > 50
      ? 'var(--accent-orange)'
      : score > 25
      ? 'var(--yellow)'
      : 'var(--green)';

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11.5,
          color: 'var(--text-dim)',
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        <span>Risk Assessment Metric</span>
        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{score} / 100</span>
      </div>
      <div className="progress-bar">
        <div className="fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export function LoadingBlock() {
  return (
    <div className="empty-state" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div className="loading-spinner" />
      <span>Correlating intelligence indicators across global feeds...</span>
    </div>
  );
}

export function ErrorBlock({ message }) {
  return (
    <div className="mock-error">
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Feed Response Notice</div>
      <div>{message}</div>
      <div style={{ marginTop: 6, fontSize: 11.5, opacity: 0.8 }}>
        Displaying cached or local intelligence telemetry. Connected provider may be experiencing rate limiting.
      </div>
    </div>
  );
}

export function Panel({ title, right, children, bodyStyle }) {
  return (
    <div className="glass">
      <div className="panel-header">
        <h3>{title}</h3>
        {right}
      </div>
      <div className="panel-body" style={bodyStyle}>
        {children}
      </div>
    </div>
  );
}