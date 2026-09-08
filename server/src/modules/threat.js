import { apiRequest } from '../lib/apiClient.js';

const DEMO_THREATS = [
  {
    id: '1', type: 'malware', name: 'LockBit 3.0 Ransomware', severity: 'critical',
    description: 'New LockBit variant observed with improved evasion techniques targeting Windows environments.',
    source: 'AlienVault OTX', timestamp: '2026-09-07T10:15:00Z', status: 'active',
  },
  {
    id: '2', type: 'phishing', name: 'Credential Harvesting Campaign', severity: 'high',
    description: 'Large-scale phishing campaign impersonating major banking institutions in EU region.',
    source: 'VirusTotal', timestamp: '2026-09-07T11:30:00Z', status: 'active',
  },
  {
    id: '3', type: 'cve', name: 'CVE-2026-4821', severity: 'critical',
    description: 'Remote Code Execution in widely deployed VPN solution. Exploitation in the wild.',
    source: 'NVD', timestamp: '2026-09-07T09:00:00Z', status: 'active',
  },
  {
    id: '4', type: 'botnet', name: 'Mirai-variant IoT Botnet', severity: 'high',
    description: 'New Mirai variant exploiting default credentials on IoT devices, DDoS capability.',
    source: 'Shodan', timestamp: '2026-09-07T08:45:00Z', status: 'active',
  },
  {
    id: '5', type: 'apt', name: 'APT Group Activity', severity: 'critical',
    description: 'State-sponsored APT observed using novel DLL side-loading technique.',
    source: 'AlienVault OTX', timestamp: '2026-09-07T07:20:00Z', status: 'active',
  },
  {
    id: '6', type: 'data_breach', name: 'Credentials Dump on Forum', severity: 'medium',
    description: 'Credential dump posted on underground forum containing 1.2M records.',
    source: 'VirusTotal', timestamp: '2026-09-07T06:10:00Z', status: 'watch',
  },
  {
    id: '7', type: 'scan', name: 'Mass Port Scanning Spike', severity: 'medium',
    description: 'Global scan intensity up 45% - possible reconnaissance for new CVE exploitation.',
    source: 'Shodan', timestamp: '2026-09-07T05:00:00Z', status: 'watch',
  },
  {
    id: '8', type: 'compliance', name: 'New IOC Feed Published', severity: 'low',
    description: 'Updated IOC feed with 152 new indicators across 4 threat groups.',
    source: 'AlienVault OTX', timestamp: '2026-09-07T04:30:00Z', status: 'resolved',
  },
];

export async function getThreatFeed() {
  const avResult = await apiRequest('alienvault', 'https://otx.alienvault.com/api/v1/pulses/subscribed?limit=20', {
    headers: { 'X-OTX-API-KEY': process.env.ALIENVAULT_API || '' },
    noKeyRequired: true, timeout: 8000,
  });

  const hasLive = avResult.status === 'ok';
  if (hasLive && avResult.data?.results?.length) {
    return avResult.data.results.map(pt => ({
      id: pt.id, type: 'pulse', name: pt.name,
      severity: pt.active ? 'high' : pt.adversary ? 'medium' : 'low',
      description: pt.description, source: 'AlienVault OTX',
      timestamp: pt.modified, status: 'active',
      tags: pt.tags, adversary: pt.adversary,
    }));
  }
  return DEMO_THREATS;
}

export async function getThreatStats() {
  const feed = await getThreatFeed();
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  feed.forEach(t => { bySeverity[t.severity] = (bySeverity[t.severity] || 0) + 1; });
  return {
    total: feed.length,
    active: feed.filter(t => t.status === 'active').length,
    bySeverity,
    byType: feed.reduce((acc, t) => { acc[t.type] = (acc[t.type] || 0) + 1; return acc; }, {}),
    lastUpdate: new Date().toISOString(),
  };
}

export async function searchThreatIntel(query) {
  const result = await apiRequest('alienvault', `https://otx.alienvault.com/api/v1/search/pulses?q=${encodeURIComponent(query)}`, {
    headers: { 'X-OTX-API-KEY': process.env.ALIENVAULT_API || '' },
    noKeyRequired: true, timeout: 8000,
  });

  if (result.status === 'ok' && result.data?.results) {
    return result.data.results.map(pt => ({
      id: pt.id, name: pt.name, description: pt.description,
      type: 'pulse', severity: pt.active ? 'high' : 'medium',
      source: 'AlienVault OTX', timestamp: pt.modified,
      tags: pt.tags, adversary: pt.adversary,
    }));
  }
  return DEMO_THREATS.filter(t => `${t.name} ${t.description}`.toLowerCase().includes(query.toLowerCase()) || query === '');
}

export async function getCVEs(query) {
  if (!process.env.NVD_API_KEY) {
    return DEMO_THREATS.filter(t => t.type === 'cve').map(t => ({
      id: t.name, description: t.description, severity: t.severity,
      published: t.timestamp, source: 'NVD (demo data - API key not configured)', demo: true,
    }));
  }
  const url = query
    ? `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(query)}`
    : 'https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=25';
  const result = await apiRequest('nvd', url, { noKeyRequired: true, timeout: 15000 });
  if (result.status !== 'ok') {
    return { error: true, message: result.message, demo: true };
  }
  return (result.data.vulnerabilities || []).map(v => ({
    id: v.cve.id, description: (v.cve.descriptions || []).find(d => d.lang === 'en')?.value || '',
    severity: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'unknown',
    score: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0,
    published: v.cve.published, source: 'NVD',
    cvssVector: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.vectorString || null,
  }));
}