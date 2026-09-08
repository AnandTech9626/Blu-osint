import { apiRequest } from '../lib/apiClient.js';

export function parseIOC(input) {
  const types = { ip: [], domain: [], url: [], hash: [], email: [], cve: [] };
  const lines = input.split(/[\n,;]/).map(l => l.trim()).filter(Boolean);
  
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
  const domainRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/i;
  const urlRegex = /(https?:\/\/)[^\s]+/i;
  const hashRegex = /\b[a-f0-9]{32}\b|\b[a-f0-9]{40}\b|\b[a-f0-9]{64}\b|\b[a-f0-9]{128}\b/i;
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const cveRegex = /\bCVE-\d{4}-\d{4,}\b/i;
  const sha256Regex = /\b[a-f0-9]{64}\b/i;

  for (const line of lines) {
    if (cveRegex.test(line)) { types.cve.push(line); continue; }
    if (sha256Regex.test(line)) { types.hash.push(line); continue; }
    if (hashRegex.test(line)) { types.hash.push(line); continue; }
    if (urlRegex.test(line)) { types.url.push(line); continue; }
    if (ipRegex.test(line)) { types.ip.push(line); continue; }
    if (emailRegex.test(line)) { types.email.push(line); continue; }
    if (domainRegex.test(line)) { types.domain.push(line); continue; }
  }

  return types;
}

export async function enrichIOC(ioc, type) {
  switch (type) {
    case 'ip': return enrichIPIOC(ioc);
    case 'domain': return enrichDomainIOC(ioc);
    case 'url': return enrichURLIOC(ioc);
    case 'hash': return enrichHashIOC(ioc);
    default: return { ioc, type, enrichment: [], timestamp: new Date().toISOString() };
  }
}

async function enrichIPIOC(ip) {
  const [vt, av] = await Promise.allSettled([
    apiRequest('virustotal', `https://www.virustotal.com/api/v3/ip_addresses/${ip}`, { authHeader: 'x-apikey', noKeyRequired: true }),
    apiRequest('alienvault', `https://otx.alienvault.com/api/v1/indicators/IPv4/${ip}/general`, { noKeyRequired: true }),
  ]);
  const vtData = vt.status === 'fulfilled' && !vt.value.error ? vt.value.data?.data?.attributes : null;
  const avData = av.status === 'fulfilled' && !av.value.error ? av.value.data : null;
  const stats = vtData?.last_analysis_stats || {};
  const verdict = stats.malicious > 0 ? 'malicious' : 'clean';
  return {
    ioc: ip, type: 'ip', verdict, maliciousCount: stats.malicious || 0,
    sources: ['VirusTotal', 'AlienVault'],
    score: verdict === 'malicious' ? 90 : 10,
    tags: avData?.tags || [],
    detections: vtData?.last_analysis_results ? Object.entries(vtData.last_analysis_results).filter(([,v]) => v.result).map(([k,v]) => ({ engine: k, result: v.result })) : [],
    timestamp: new Date().toISOString(),
  };
}

async function enrichDomainIOC(domain) {
  const [vt, av] = await Promise.allSettled([
    apiRequest('virustotal', `https://www.virustotal.com/api/v3/domains/${domain}`, { authHeader: 'x-apikey', noKeyRequired: true }),
    apiRequest('alienvault', `https://otx.alienvault.com/api/v1/indicators/domain/${domain}/general`, { noKeyRequired: true }),
  ]);
  const vtData = vt.status === 'fulfilled' && !vt.value.error ? vt.value.data?.data?.attributes : null;
  const avData = av.status === 'fulfilled' && !av.value.error ? av.value.data : null;
  const stats = vtData?.last_analysis_stats || {};
  const verdict = stats.malicious > 0 ? 'malicious' : 'clean';
  return {
    ioc: domain, type: 'domain', verdict, maliciousCount: stats.malicious || 0,
    sources: ['VirusTotal', 'AlienVault'],
    score: verdict === 'malicious' ? 88 : 10,
    tags: avData?.tags || [],
    detections: vtData?.last_analysis_results ? Object.entries(vtData.last_analysis_results).filter(([,v]) => v.result).map(([k,v]) => ({ engine: k, result: v.result })) : [],
    timestamp: new Date().toISOString(),
  };
}

async function enrichURLIOC(url) {
  const vt = await apiRequest('virustotal', `https://www.virustotal.com/api/v3/urls/${Buffer.from(url).toString('base64url')}`, {
    authHeader: 'x-apikey', noKeyRequired: true,
  });
  const vtData = vt.data?.data?.attributes || null;
  const stats = vtData?.last_analysis_stats || {};
  const verdict = stats.malicious > 0 ? 'malicious' : 'clean';
  return {
    ioc: url, type: 'url', verdict, maliciousCount: stats.malicious || 0,
    sources: ['VirusTotal'],
    score: verdict === 'malicious' ? 85 : 10,
    timestamp: new Date().toISOString(),
  };
}

async function enrichHashIOC(hash) {
  const [vt, av] = await Promise.allSettled([
    apiRequest('virustotal', `https://www.virustotal.com/api/v3/files/${hash}`, { authHeader: 'x-apikey', noKeyRequired: true }),
    apiRequest('alienvault', `https://otx.alienvault.com/api/v1/indicators/file/${hash}/general`, { noKeyRequired: true }),
  ]);
  const vtData = vt.status === 'fulfilled' && !vt.value.error ? vt.value.data?.data?.attributes : null;
  const avData = av.status === 'fulfilled' && !av.value.error ? av.value.data : null;
  const stats = vtData?.last_analysis_stats || {};
  const verdict = stats.malicious > 0 ? 'malicious' : 'clean';
  const magic = vtData?.magic || 'Unknown';
  return {
    ioc: hash, type: 'hash', verdict, maliciousCount: stats.malicious || 0,
    fileType: magic, size: vtData?.size,
    name: vtData?.meaningful_name,
    tlsh: vtData?.tlsh,
    sources: ['VirusTotal', 'AlienVault'],
    score: verdict === 'malicious' ? 95 : 10,
    detections: vtData?.last_analysis_results ? Object.entries(vtData.last_analysis_results).filter(([,v]) => v.result).map(([k,v]) => ({ engine: k, result: v.result })) : [],
    timestamp: new Date().toISOString(),
  };
}