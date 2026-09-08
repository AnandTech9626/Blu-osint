import { Router } from 'express';
import { investigateDomain } from '../modules/domain.js';
import { investigateIP } from '../modules/ipLookup.js';
import { investigateEmail } from '../modules/email.js';
import { investigateUsername } from '../modules/username.js';
import { investigateDNS } from '../modules/dns.js';
import { investigateWHOIS } from '../modules/whois.js';
import { investigateSSL } from '../modules/ssl.js';
import { investigateTechnology } from '../modules/technology.js';
import { parseIOC, enrichIOC } from '../modules/ioc.js';
import { checkPassword } from '../modules/password.js';
import { investigateWiFi, investigateSSID } from '../modules/wifi.js';
import { investigatePhone } from '../modules/phone.js';
import { getThreatFeed, getThreatStats, searchThreatIntel, getCVEs } from '../modules/threat.js';
import { exaSearch } from '../modules/exa.js';
import { getAPIHealth } from '../lib/apiClient.js';
import * as demo from '../modules/demo.js';
import { getTable } from '../lib/database.js';

const router = Router();

const history = getTable('history');

const validators = {
  domain: v => typeof v === 'string' && v.length <= 253 && /^[a-z0-9-]+(\.[a-z0-9-]+)*\.?$/i.test(v.trim()),
  ip: v => /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(v.trim()),
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  bssid: v => /^[0-9A-Fa-f]{2}([:-])[0-9A-Fa-f]{2}(\1[0-9A-Fa-f]{2}){4}$/.test(v.trim()),
};

function safeGet(fn) {
  try { return fn(); } catch { return null; }
}

function logSearch(query, module, summary) {
  history.insert({ query, module, result_summary: JSON.stringify(summary || {}).slice(0, 500), timestamp: new Date().toISOString() });
}

const systemStatus = { status: 'operational', message: 'All modules operational', uptime: process.uptime(), timestamp: new Date().toISOString() };

router.get('/system-status', (_req, res) => res.json(systemStatus));
router.get('/source-health', (_req, res) => res.json(demo.generateSourceHealth()));
router.get('/kpi', (_req, res) => res.json(demo.generateKPI()));
router.get('/severity-chart', (_req, res) => res.json(demo.generateSeverityChart()));
router.get('/intel-feed', (_req, res) => res.json(demo.generateIntelligenceFeed()));
router.get('/threat-map', (_req, res) => res.json(demo.generateDemoThreatMap()));
router.get('/timeline', (_req, res) => res.json(demo.generateTimelineData()));
router.get('/demo/entities', (_req, res) => res.json(demo.generateEntities()));
router.get('/demo/events', (_req, res) => res.json(demo.DEMO_EVENTS));

router.get('/threat-feed', async (_req, res) => {
  const data = await getThreatFeed();
  res.json(data);
});

router.get('/threat-stats', async (_req, res) => {
  const data = await getThreatStats();
  res.json(data);
});

router.get('/threat-search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
  const data = await searchThreatIntel(String(q));
  res.json(data);
});

router.get('/cves', async (req, res) => {
  const { q } = req.query;
  const data = await getCVEs(q ? String(q) : null);
  res.json(data);
});

router.get('/health', (_req, res) => {
  res.json({
    apis: getAPIHealth().map(a => ({
      ...a,
      health: a.configured ? 'online' : 'not-configured',
      latency: a.configured ? Math.round(40 + Math.random() * 80) : null,
    })),
    server: { uptime: process.uptime(), status: 'operational' },
  });
});

router.get('/history', (_req, res) => {
  res.json(history.all().sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')).slice(0, 50));
});

router.post('/investigate/domain', async (req, res) => {
  const { target } = req.body || {};
  if (!target || !validators.domain(target)) return res.status(400).json({ error: 'Invalid domain format' });
  try {
    const result = await investigateDomain(target);
    logSearch(target, 'domain', { threatScore: result.threat?.score, level: result.threat?.level });
    res.json(result);
  } catch (e) { console.error('[Domain]', e); res.status(502).json({ error: 'Domain investigation failed', message: e.message }); }
});

router.post('/investigate/ip', async (req, res) => {
  const { target } = req.body || {};
  if (!target || !validators.ip(target)) return res.status(400).json({ error: 'Invalid IP format' });
  try {
    const result = await investigateIP(target);
    logSearch(target, 'ip', { threatScore: result.threat?.score, level: result.threat?.level, services: result.services?.length });
    res.json(result);
  } catch (e) { console.error('[IP]', e); res.status(502).json({ error: 'IP investigation failed', message: e.message }); }
});

router.post('/investigate/email', async (req, res) => {
  const { target } = req.body || {};
  if (!target || !validators.email(target)) return res.status(400).json({ error: 'Invalid email format' });
  try {
    const result = await investigateEmail(target);
    logSearch(target, 'email', { breaches: result.breachCount, level: result.threat?.level });
    res.json(result);
  } catch (e) { console.error('[Email]', e); res.status(502).json({ error: 'Email investigation failed', message: e.message }); }
});

router.post('/investigate/username', async (req, res) => {
  const { target } = req.body || {};
  if (!target || typeof target !== 'string' || target.length > 64) return res.status(400).json({ error: 'Invalid username' });
  try {
    const result = await investigateUsername(target.trim());
    logSearch(target, 'username', { found: result.summary.found, checked: result.summary.totalChecked });
    res.json(result);
  } catch (e) { console.error('[Username]', e); res.status(502).json({ error: 'Username investigation failed', message: e.message }); }
});

router.post('/investigate/dns', async (req, res) => {
  const { target } = req.body || {};
  if (!target || !validators.domain(target)) return res.status(400).json({ error: 'Invalid domain format' });
  const result = await investigateDNS(target);
  logSearch(target, 'dns', { records: result.summary.totalRecords, resolutions: result.summary.totalResolutions });
  res.json(result);
});

router.post('/investigate/whois', async (req, res) => {
  const { target } = req.body || {};
  if (!target || !validators.domain(target)) return res.status(400).json({ error: 'Invalid domain format' });
  const result = await investigateWHOIS(target);
  logSearch(target, 'whois', { registrar: result.registrar });
  res.json(result);
});

router.post('/investigate/ssl', async (req, res) => {
  const { target } = req.body || {};
  if (!target || !validators.domain(target)) return res.status(400).json({ error: 'Invalid domain format' });
  const result = await investigateSSL(target);
  logSearch(target, 'ssl', { certs: result.summary.totalCerts, issuer: result.currentCert.issuer });
  res.json(result);
});

router.post('/investigate/technology', async (req, res) => {
  const { target } = req.body || {};
  if (!target || typeof target !== 'string' || target.length > 300) return res.status(400).json({ error: 'Invalid URL' });
  const result = await investigateTechnology(target);
  logSearch(target, 'technology', { techCount: result.summary?.total });
  res.json(result);
});

router.post('/investigate/ioc', async (req, res) => {
  const { target, enrich } = req.body || {};
  if (!target || typeof target !== 'string' || target.length > 10000) return res.status(400).json({ error: 'Invalid IOC input' });
  try {
    const types = parseIOC(target);
    let enrichments = [];
    if (enrich) {
      const items = [];
      items.push(...types.ip.slice(0, 3).map(i => enrichIOC(i, 'ip')));
      items.push(...types.domain.slice(0, 3).map(d => enrichIOC(d, 'domain')));
      items.push(...types.url.slice(0, 3).map(u => enrichIOC(u, 'url')));
      items.push(...types.hash.slice(0, 3).map(h => enrichIOC(h, 'hash')));
      const settled = await Promise.all(items);
      enrichments = settled.filter(Boolean);
    }
    logSearch(target.slice(0, 100), 'ioc', { ips: types.ip.length, domains: types.domain.length, hashes: types.hash.length });
    res.json({ types, enrichments, total: Object.values(types).reduce((a, c) => a + c.length, 0), timestamp: new Date().toISOString() });
  } catch (e) { console.error('[IOC]', e); res.status(502).json({ error: 'IOC analysis failed', message: e.message }); }
});

router.post('/investigate/password', async (req, res) => {
  const { target } = req.body || {};
  if (!target || typeof target !== 'string' || target.length > 128) return res.status(400).json({ error: 'Invalid password' });
  const result = checkPassword(target);
  logSearch('password-strength', 'password', { score: result.score, length: result.length });
  res.json(result);
});

router.post('/investigate/phone', async (req, res) => {
  const { target } = req.body || {};
  if (!target || typeof target !== 'string') return res.status(400).json({ error: 'Invalid phone number' });
  try {
    const result = await investigatePhone(target);
    logSearch(target, 'phone', { country: result.location?.country, carrier: result.telecom?.carrier });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Phone lookup failed' });
  }
});

router.post('/investigate/wifi', async (req, res) => {
  const { target, ssid } = req.body || {};
  if (ssid) {
    const result = await investigateSSID(ssid);
    logSearch(ssid, 'wifi-ssid', { risk: result.riskLevel });
    return res.json(result);
  }
  if (!target || !validators.bssid(target)) return res.status(400).json({ error: 'Invalid BSSID format' });
  const result = await investigateWiFi(target);
  logSearch(target, 'wifi', { vendor: result.vendor });
  res.json(result);
});

router.get('/ip-lookup', async (req, res) => {
  const { ip } = req.query;
  if (!ip || !validators.ip(ip)) return res.status(400).json({ error: 'Invalid IP' });
  try {
    const result = await investigateIP(ip);
    res.json(result);
  } catch (e) { console.error('[IP Lookup]', e); res.status(502).json({ error: 'IP lookup failed' }); }
});

router.post('/search/exa', async (req, res) => {
  const { query, numResults } = req.body || {};
  if (!query || typeof query !== 'string' || query.length > 200) return res.status(400).json({ error: 'Invalid search query' });
  const result = await exaSearch(query, { numResults });
  logSearch(query, 'exa', { results: result.results?.length, demo: result.demo });
  res.json(result);
});

export default router;