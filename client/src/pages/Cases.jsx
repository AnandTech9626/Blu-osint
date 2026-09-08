import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Panel } from '../components/ResultView.jsx';

const SEV_TAG = { critical: 'red', high: 'red', medium: 'yellow', low: 'green' };

function CaseDetail({ case_, onBack, onUpdated }) {
  const [detail, setDetail] = useState(case_);
  const [note, setNote] = useState('');
  const [entityType, setEntityType] = useState('ip');
  const [entityValue, setEntityValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.cases.get(case_.id).then(setDetail).catch(() => {});
  }, [case_.id]);

  async function changeStatus(status) {
    const updated = await api.cases.update(case_.id, { status });
    setDetail(updated);
    onUpdated();
  }

  async function addNote() {
    if (!note.trim()) return;
    await api.cases.timeline(case_.id, { event_type: 'note', title: note.trim(), severity: 'info' });
    setNote('');
    setDetail(await api.cases.get(case_.id));
    onUpdated();
  }

  async function addEntity() {
    if (!entityValue.trim()) return;
    setSaving(true);
    await api.cases.entity(case_.id, { type: entityType, value: entityValue.trim() });
    setEntityValue('');
    setDetail(await api.cases.get(case_.id));
    onUpdated();
    setSaving(false);
  }

  return (
    <div className="animate-in">
      <button className="btn ghost small" onClick={onBack}>← Back to cases</button>

      <div className="panel-header" style={{ border: '1px solid var(--border)', borderRadius: '12px 12px 0 0', background: 'var(--panel)', marginTop: 12, borderBottom: '1px solid var(--border)' }}>
        <h3>{detail.name}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn small" onClick={() => changeStatus(detail.status === 'open' ? 'in_progress' : 'open')}>
            {detail.status === 'open' ? 'START' : 'REOPEN'}
          </button>
          <button className="btn small" onClick={() => changeStatus('resolved')}>RESOLVE</button>
          <span className={`tag ${SEV_TAG[detail.severity]}`}>{detail.severity.toUpperCase()}</span>
        </div>
      </div>

      <div className="section-grid">
        <Panel title="Case Metadata">
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            <p><strong>ID:</strong> <span style={{ fontFamily: 'var(--mono)' }}>{detail.id}</span></p>
            <p><strong>Description:</strong> {detail.description || '—'}</p>
            <p><strong>Created:</strong> {detail.created_at}</p>
            <p><strong>Updated:</strong> {detail.updated_at}</p>
            <p><strong>Tags:</strong> {(detail.tags || []).map(t => <span key={t} className="tag" style={{ marginLeft: 4 }}>{t}</span>)}</p>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <select className="input-field" style={{ width: 120 }} value={entityType} onChange={e => setEntityType(e.target.value)}>
                {['ip', 'domain', 'email', 'hash', 'url', 'username', 'cve', 'file'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="input-field" style={{ flex: 1 }} placeholder="Add entity…" value={entityValue} onChange={e => setEntityValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEntity()} />
              <button className="btn small" onClick={addEntity} disabled={saving}>Add</button>
            </div>
          </div>
        </Panel>

        <Panel title={`Timeline (${detail.timeline?.length || 0})`}>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {detail.timeline?.map(t => (
              <div key={t.id} className="feed-item">
                <div className="ic info">▶</div>
                <div style={{ flex: 1 }}>
                  <div className="f-title" style={{ fontSize: 12 }}>{t.title}</div>
                  <div className="f-detail">{t.description}</div>
                </div>
                <span className="f-time">{t.timestamp?.slice(11, 16)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Add Investigation Note" bodyStyle={{ paddingTop: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input-field" placeholder="Add observation, forensic finding, or analyst hypothesis…" value={note} onChange={e => setNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} />
          <button className="btn primary small" onClick={addNote}>Add Note</button>
        </div>
      </Panel>
    </div>
  );
}

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [active, setActive] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', severity: 'medium', status: 'open' });
  const [loading, setLoading] = useState(true);

  const load = () => api.cases.list().then(setCases).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.name) return;
    await api.cases.create(form);
    setShowCreate(false);
    setForm({ name: '', description: '', severity: 'medium', status: 'open' });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this case permanently?')) return;
    await api.cases.remove(id);
    load();
  }

  if (active) return <CaseDetail case_={active} onBack={() => setActive(null)} onUpdated={load} />;

  return (
    <div className="page">
      <div className="page-title">
        Investigation Cases
        <span className="sub">Evidence linking, timeline tracking, and dossier management</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn primary" onClick={() => setShowCreate(s => !s)}>{showCreate ? 'Cancel' : '+ New Investigation Case'}</button>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{cases.length} case{cases.length === 1 ? '' : 's'} registered</span>
      </div>

      {showCreate && (
        <div className="glass animate-in" style={{ padding: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 130px', gap: 12 }}>
            <input className="input-field" placeholder="Case title (e.g. INC-2026-042 Suspected Credential Exfiltration)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <select className="input-field" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button className="btn primary" onClick={create} disabled={!form.name}>Create Case</button>
          </div>
          <input className="input-field" style={{ marginTop: 10 }} placeholder="Scope, affected assets, or investigation notes…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      )}

      <div className="section-grid">
        {loading && <div className="empty-state">Loading cases…</div>}
        {!loading && cases.length === 0 && (
          <div className="glass" style={{ padding: 30, textAlign: 'center' }}>
            <div className="empty-state">No open cases. Create your first investigation dossier.</div>
          </div>
        )}
        {cases.map(c => (
          <div className="case-card" key={c.id} onClick={() => setActive(c)}>
            <div className="title">{c.name}</div>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>{c.description}</p>
            <div className="meta">
              <span className={`tag ${SEV_TAG[c.severity]}`}>{c.severity.toUpperCase()}</span>
              <span className="tag">{c.status.toUpperCase()}</span>
              <span className="tag" style={{ color: 'var(--text-faint)' }}>{c.updated_at?.slice(0, 16)}</span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}>
                {(c.entities || []).length} linked entities · opened {c.created_at?.slice(0, 10)}
              </span>
              <button className="btn danger small" onClick={e => { e.stopPropagation(); remove(c.id); }}>DELETE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}