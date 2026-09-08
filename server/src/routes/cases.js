import { Router } from 'express';
import { randomUUID } from 'crypto';
import { getTable } from '../lib/database.js';

const router = Router();
const cases = getTable('cases');
const timeline = getTable('timeline');
const entities = getTable('entities');
const reports = getTable('reports');

function formatRow(row) {
  if (!row) return row;
  return {
    ...row,
    tags: (() => { try { return JSON.parse(row.tags || '[]'); } catch { return []; } })(),
    entities: (() => { try { return JSON.parse(row.entities || '[]'); } catch { return []; } })(),
  };
}

function parseJson(v, fallback) {
  try { return JSON.parse(v); } catch { return fallback; }
}

router.get('/', (_req, res) => {
  res.json(cases.all().sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || '')).map(formatRow));
});

router.post('/', (req, res) => {
  const { name, description, status = 'open', severity = 'medium', tags = [], entities = [] } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const id = randomUUID();
  const now = new Date().toISOString();
  const row = {
    id, name, description: description || '', status, severity,
    created_at: now, updated_at: now,
    tags: JSON.stringify(tags), entities: JSON.stringify(entities),
  };
  cases.insert(row);
  timeline.insert({
    id: timeline.raw().length + 1, case_id: id,
    event_type: 'case.created', title: 'Case created', description: description || '',
    severity, timestamp: now, metadata: '{}',
  });
  res.status(201).json(formatRow(row));
});

router.get('/:id', (req, res) => {
  const row = cases.find(c => c.id === req.params.id);
  if (!row) return res.status(404).json({ error: 'Case not found' });
  const items = timeline.filter(t => t.case_id === req.params.id).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  const ents = entities.filter(e => e.case_id === req.params.id);
  res.json({ ...formatRow(row), timeline: items, entities: [...ents, ...formatRow(row).entities] });
});

router.put('/:id', (req, res) => {
  const existing = cases.find(c => c.id === req.params.id);
  if (!existing) return res.status(404).json({ error: 'Case not found' });
  const { name, description, status, severity, tags, entities } = req.body || {};
  const patch = { updated_at: new Date().toISOString() };
  if (name) patch.name = name;
  if (description !== undefined) patch.description = description;
  if (status) patch.status = status;
  if (severity) patch.severity = severity;
  if (tags) patch.tags = JSON.stringify(tags);
  if (entities) patch.entities = JSON.stringify(entities);

  cases.update(c => c.id === req.params.id, patch);

  if (status && status !== existing.status) {
    timeline.insert({
      id: timeline.raw().length + 1, case_id: req.params.id,
      event_type: 'case.status', title: `Case status changed to ${status}`,
      description: '', severity: severity || existing.severity,
      timestamp: new Date().toISOString(), metadata: '{}',
    });
  }
  res.json(formatRow(cases.find(c => c.id === req.params.id)));
});

router.delete('/:id', (req, res) => {
  const removed = cases.remove(c => c.id === req.params.id);
  if (!removed) return res.status(404).json({ error: 'Case not found' });
  timeline.remove(t => t.case_id === req.params.id);
  entities.remove(e => e.case_id === req.params.id);
  res.json({ ok: true });
});

router.post('/:id/timeline', (req, res) => {
  const { event_type = 'note', title, description = '', severity = 'info' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const row = {
    id: timeline.raw().length + 1, case_id: req.params.id,
    event_type, title, description, severity,
    timestamp: new Date().toISOString(), metadata: '{}',
  };
  timeline.insert(row);
  cases.update(c => c.id === req.params.id, { updated_at: new Date().toISOString() });
  res.status(201).json(row);
});

router.post('/:id/entities', (req, res) => {
  const { type, value, label, metadata = {} } = req.body || {};
  if (!type || !value) return res.status(400).json({ error: 'Type and value are required' });
  const row = {
    id: entities.raw().length + 1, case_id: req.params.id,
    type, value, label: label || null, metadata: JSON.stringify(metadata),
    created_at: new Date().toISOString(),
  };
  entities.insert(row);
  cases.update(c => c.id === req.params.id, { updated_at: new Date().toISOString() });
  res.status(201).json({ ...row, metadata });
});

router.post('/:id/report', (req, res) => {
  const { title, content = '', format = 'markdown' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const id = randomUUID();
  reports.insert({ id, case_id: req.params.id, title, content, format, created_at: new Date().toISOString() });
  timeline.insert({
    id: timeline.raw().length + 1, case_id: req.params.id,
    event_type: 'report', title: `Report generated: ${title}`,
    description: '', severity: 'info', timestamp: new Date().toISOString(), metadata: '{}',
  });
  res.status(201).json({ id, case_id: req.params.id, title, format, created_at: new Date().toISOString() });
});

router.get('/:id/reports', (req, res) => {
  res.json(reports.filter(r => r.case_id === req.params.id).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')));
});

export default router;