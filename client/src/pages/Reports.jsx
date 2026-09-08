import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Panel } from '../components/ResultView.jsx';

export default function Reports() {
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState('');
  const [title, setTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [reportsList, setReportsList] = useState([]);

  useEffect(() => {
    api.cases.list().then(setCases).catch(() => {});
  }, []);

  async function generate() {
    if (!selected || !title.trim()) return;
    setGenerating(true);
    try {
      const caseDetail = await api.cases.get(selected);
      const now = new Date().toISOString();

      const evidence = caseDetail.entities || [];
      const timeline = caseDetail.timeline || [];

      const content = `# ${title}

**Generated:** ${now}  ·  **Case:** ${caseDetail.name} (${caseDetail.id})
**Platform:** BluCloud Cyber Threat Intelligence Console (Blue Cloud Softech Solutions Ltd.)

---

## Executive Summary

This formal investigation dossier was compiled from correlated sensor telemetry, threat pulse indicators, and active case notes.
- **Classification Severity:** ${caseDetail.severity?.toUpperCase() || 'MEDIUM'}
- **Current Case Status:** ${caseDetail.status?.toUpperCase() || 'OPEN'}
- **Investigation Scope:** ${caseDetail.description || 'General security investigation and entity correlation.'}

---

## Key Artifacts & Indicators Identified

${evidence.map(e => `- **${e.type.toUpperCase()}:** \`${e.value}\`${e.label ? ` — ${e.label}` : ''}`).join('\n') || '- No specific artifacts captured in dossier.'}

---

## Forensic Timeline & Observations

${timeline.map(t => `- **${t.timestamp?.slice(0, 16)}** · **${t.title}** — ${t.description || ''}`).join('\n') || '- No timeline events recorded.'}

---

## Threat Intelligence Sources Correlated

- **VirusTotal** — Multi-engine scanning, reputation verdicts, file hash forensics
- **Shodan** — Port reconnaissance, service fingerprinting, autonomous system intelligence
- **AlienVault OTX** — Global community pulse feeds, adversary attribution
- **NIST NVD** — Common Vulnerabilities and Exposures (CVE) watchlist
- **EXA Neural Web** — Deep open-source web intelligence

---

*Compiled by BluCloud Security Operations Center · Blue Cloud Softech Solutions Ltd.*
`;

      const saved = await api.cases.report(selected, { title, content });
      setReport({ ...saved, content });
      setReportsList(await api.cases.reports(selected));
    } catch (e) {
      alert('Report generation failed: ' + e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function preview(caseId) {
    if (!caseId) {
      setReportsList([]);
      setReport(null);
      return;
    }
    const list = await api.cases.reports(caseId).catch(() => []);
    setReportsList(list);
    if (list.length) setReport({ ...list[list.length - 1], content: list[list.length - 1].content || 'Report loaded.' });
  }

  return (
    <div className="page animate-in">
      <div className="page-title">
        Forensic Intelligence Reports
        <span className="sub">Generate executive briefings and technical case dossiers in markdown or PDF format</span>
      </div>

      <div className="section-grid">
        <Panel title="Compile Case Dossier">
          <label>Select Investigation Case</label>
          <select
            className="input-field"
            value={selected}
            onChange={e => {
              setSelected(e.target.value);
              preview(e.target.value);
            }}
          >
            <option value="">— Select an active investigation case —</option>
            {cases.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <label style={{ marginTop: 14 }}>Report Title</label>
          <input
            className="input-field"
            placeholder="e.g. INC-2026-042 Executive Forensic Summary"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <button
            className="btn primary"
            style={{ marginTop: 18, width: '100%' }}
            onClick={generate}
            disabled={generating || !selected || !title.trim()}
          >
            {generating ? 'Compiling Dossier…' : 'Generate Intelligence Report'}
          </button>
        </Panel>

        <Panel title="Report Preview & Export">
          {report ? (
            <div className="threat-card" style={{ borderLeftColor: 'var(--accent)', background: 'var(--bg-1)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                {report.title || report.content?.split('\n')[0]?.replace('# ', '')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 12 }}>
                Report Ref: {report.id} · Created {report.created_at?.slice(0, 16)}
              </div>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: 12.5,
                  color: 'var(--text-dim)',
                  lineHeight: 1.7,
                  fontFamily: 'var(--sans)',
                  maxHeight: 380,
                  overflowY: 'auto',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: 14,
                  borderRadius: 8,
                }}
              >
                {report.content}
              </pre>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button
                  className="btn small primary"
                  onClick={() => {
                    const blob = new Blob([report.content], { type: 'text/markdown' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `${(report.title || 'report').replace(/\s+/g, '-').toLowerCase()}.md`;
                    a.click();
                  }}
                >
                  Download Markdown (.md)
                </button>
                <button className="btn small ghost" onClick={() => window.print()}>
                  Print / Save PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Select an investigation case and click Generate to preview the formal dossier.
            </div>
          )}
        </Panel>
      </div>

      {reportsList.length > 0 && (
        <Panel title={`Archived Reports (${reportsList.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reportsList.map(r => (
              <div key={r.id} className="stat-row">
                <span className="name" style={{ color: 'var(--text)' }}>● {r.title}</span>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{r.created_at}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}