import { Router } from 'express';
import { getTable } from '../lib/database.js';

const router = Router();
const entities = getTable('entities');
const cases = getTable('cases');

function entityColor(type) {
  const colors = {
    ip: '#38bdf8',
    domain: '#a78bfa',
    email: '#f472b6',
    hash: '#fb923c',
    file: '#34d399',
    url: '#fbbf24',
    cve: '#f87171',
    username: '#22d3ee',
    phone: '#c084fc',
    person: '#4ade80',
    organization: '#facc15',
    default: '#94a3b8',
  };
  return colors[type] || colors.default;
}

const DEMO_GRAPH = {
  nodes: [
    { id: 'n1', type: 'ip', label: '185.220.101.35', group: 'malicious', size: 18 },
    { id: 'n2', type: 'domain', label: 'malicious-domain.com', group: 'malicious', size: 16 },
    { id: 'n3', type: 'domain', label: 'cdn-cloud-cache.net', group: 'malicious', size: 12 },
    { id: 'n4', type: 'hash', label: '9f86d08-story-ld', group: 'artifact', size: 14 },
    { id: 'n5', type: 'file', label: 'invoice.doc.lnk', group: 'artifact', size: 10 },
    { id: 'n6', type: 'email', label: 'spoofed@example.com', group: 'actor', size: 11 },
    { id: 'n7', type: 'email', label: 'target@victim-corp.com', group: 'victim', size: 11 },
    { id: 'n8', type: 'cve', label: 'CVE-2026-4821', group: 'vuln', size: 13 },
    { id: 'n9', type: 'ip', label: '10.10.0.15 (DMZ Host)', group: 'victim', size: 15 },
    { id: 'n10', type: 'username', label: 'h@ck3r_dude', group: 'actor', size: 9 },
  ],
  links: [
    { source: 'n1', target: 'n2', label: 'resolves to C2', type: 'dns' },
    { source: 'n3', target: 'n1', label: 'falls back', type: 'c2' },
    { source: 'n4', target: 'n5', label: 'dropped payload', type: 'delivery' },
    { source: 'n5', target: 'n7', label: 'lure sent', type: 'phishing' },
    { source: 'n6', target: 'n5', label: 'impersonated sender', type: 'spoof' },
    { source: 'n2', target: 'n4', label: 'hosted sample', type: 'distribution' },
    { source: 'n1', target: 'n9', label: 'beaconing', type: 'c2' },
    { source: 'n8', target: 'n9', label: 'exploited via', type: 'exploitation' },
    { source: 'n10', target: 'n1', label: 'operator', type: 'attribution' },
    { source: 'n10', target: 'n6', label: 'registered mailbox', type: 'attribution' },
  ],
};

router.get('/', async (req, res) => {
  const { caseId } = req.query;
  const nodes = [];
  const links = [];
  const linkSet = new Set();

  if (caseId) {
    const ents = entities.filter(e => e.case_id === caseId);
    const caseRow = cases.find(c => c.id === caseId);
    const caseEntities = caseRow ? (() => { try { return JSON.parse(caseRow.entities); } catch { return []; } })() : [];

    const all = [...ents, ...caseEntities];
    const idMap = {};
    all.forEach((e, i) => {
      const nid = String(e.id || e.value || `n${i}`);
      idMap[e.value || e.label] = nid;
      nodes.push({ id: nid, type: e.type, label: e.value || e.label, group: 'investigated', size: 14 });
    });
    for (let i = 0; i < all.length - 1; i++) {
      const a = idMap[all[i].value || all[i].label];
      const b = idMap[all[i + 1].value || all[i + 1].label];
      if (a && b && !linkSet.has(`${a}-${b}`)) {
        linkSet.add(`${a}-${b}`);
        links.push({ source: a, target: b, label: 'related', type: 'relation' });
      }
    }
  } else {
    return res.json(DEMO_GRAPH);
  }

  const graph = { nodes, links };
  res.json({ ...graph, meta: { nodeColors: { ip: entityColor('ip'), domain: entityColor('domain'), malicious: '#f87171', artifact: '#fb923c', actor: '#f472b6', victim: '#a78bfa', vuln: '#fbbf24' } } });
});

router.get('/:caseId', (req, res) => {
  const ents = entities.filter(e => e.case_id === req.params.caseId);
  const nodes = ents.map(e => ({ id: String(e.id), type: e.type, label: e.value, group: e.type, size: 12 }));
  const links = [];
  for (let i = 0; i < Math.min(nodes.length - 1, 20); i++) {
    links.push({ source: nodes[i].id, target: nodes[i + 1].id, label: 'relation', type: 'relation' });
  }
  res.json({ nodes, links, meta: { nodeColors: { ip: '#38bdf8', domain: '#a78bfa', email: '#f472b6', hash: '#fb923c', file: '#34d399', url: '#fbbf24', cve: '#f87171', username: '#22d3ee' } } });
});

export default router;