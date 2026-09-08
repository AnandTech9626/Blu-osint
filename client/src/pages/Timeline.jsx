import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Panel } from '../components/ResultView.jsx';

export default function Timeline() {
  const [data, setData] = useState([]);
  const [caseEvents, setCaseEvents] = useState([]);

  useEffect(() => {
    api.timelineData().then(setData).catch(() => {});
    api.cases.list().then(async list => {
      const all = [];
      for (const c of list) {
        const detail = await api.cases.get(c.id).catch(() => null);
        if (detail?.timeline) {
          all.push(...detail.timeline.map(t => ({ ...t, caseName: detail.name })));
        }
      }
      setCaseEvents(all);
    }).catch(() => {});
  }, []);

  const combined = [
    ...caseEvents.map(e => ({
      event: e.title,
      date: e.timestamp?.slice(0, 10),
      time: e.timestamp?.slice(11, 16),
      actor: e.event_type,
      detail: e.description,
      caseName: e.caseName,
    })),
    ...data,
  ].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).reverse();

  return (
    <div className="page animate-in">
      <div className="page-title">
        Incident Timeline & Master Chronology
        <span className="sub">Chronological correlation across open cases, IOC discoveries, and analyst observations</span>
      </div>

      <div className="section-grid">
        <Panel title="Incident Timeline Flow" bodyStyle={{ paddingTop: 18 }}>
          <div className="timeline">
            {combined.map((item, i) => (
              <div className="timeline-item" key={i}>
                <div className="date">{item.date} · {item.time}</div>
                <div className="event">
                  {item.event}
                  {item.caseName ? (
                    <span style={{ color: 'var(--accent)', fontWeight: 500, marginLeft: 8, fontSize: 12 }}>
                      · {item.caseName}
                    </span>
                  ) : null}
                </div>
                {item.detail && <div className="detail">{item.detail}</div>}
                <span className="tag" style={{ marginTop: 6, display: 'inline-block', fontSize: 10.5 }}>
                  {item.actor || 'Telemetry'}
                </span>
              </div>
            ))}
            {combined.length === 0 && <div className="empty-state">No timeline events recorded yet.</div>}
          </div>
        </Panel>

        <Panel title="SOC Investigation SOP Workflow">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { title: 'IOC Cross-Correlation', desc: 'Verify extracted indicators against VirusTotal and AlienVault OTX feeds before linking.', state: 'AUTOMATED' },
              { title: 'Adversary & TTP Attribution', desc: 'Map observed techniques against MITRE ATT&CK patterns and known campaigns.', state: 'ANALYST' },
              { title: 'Artifact Triaging', desc: 'Categorize artifacts into malware samples, C2 nodes, stolen credentials, and infrastructure.', state: 'ANALYST' },
              { title: 'Cross-Case Entity Linking', desc: 'Correlate related investigations sharing overlapping IP subnets or domain registrants.', state: 'AUTOMATED' },
              { title: 'Executive Dossier Export', desc: 'Produce formal incident briefing in markdown and executive PDF format.', state: 'READY' },
            ].map(s => (
              <div className="threat-card" key={s.title}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{s.title}</div>
                  <span
                    className={`tag ${s.state === 'AUTOMATED' ? 'green' : s.state === 'READY' ? 'yellow' : ''}`}
                    style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 700 }}
                  >
                    {s.state}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.45 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}