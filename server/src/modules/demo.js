export const DEMO_EVENTS = [
  { type: 'blocked', severity: 'high', sourceIP: '185.220.101.35', targetService: 'SSH (22)', fakeTime: '0 sec ago', lat: 48.1374, lng: 11.5755, country: 'DE', actor: 'LockBit affiliate cluster' },
  { type: 'blocked', severity: 'critical', sourceIP: '61.249.78.4', targetService: 'WordPress Admin', fakeTime: '12 sec ago', lat: 39.9042, lng: 116.4074, country: 'CN', actor: 'Credential stuffing botnet' },
  { type: 'flagged', severity: 'medium', sourceIP: '45.155.205.233', targetService: 'VPN Gateway', fakeTime: '27 sec ago', lat: 65.0, lng: 25.0, country: 'FI', actor: 'IP join sweep' },
  { type: 'blocked', severity: 'high', sourceIP: '91.214.124.143', targetService: 'RDP (3389)', fakeTime: '41 sec ago', lat: 55.7558, lng: 37.6173, country: 'RU', actor: 'Port scan cluster' },
  { type: 'blocked', severity: 'high', sourceIP: '223.82.0.0/16', targetService: 'Web App', fakeTime: '58 sec ago', lat: 35.6762, lng: 139.6503, country: 'JP', actor: 'OWASP scan wave' },
  { type: 'flagged', severity: 'medium', sourceIP: '152.58.113.14', targetService: 'Mail Server', fakeTime: '1 min ago', lat: 22.5726, lng: 88.3639, country: 'IN', actor: 'Email enumeration' },
  { type: 'blocked', severity: 'critical', sourceIP: '185.61.149.13', targetService: 'DNS Rebinding', fakeTime: '83 sec ago', lat: 38.6260, lng: -90.1994, country: 'US', actor: 'DNS rebinding kit' },
  { type: 'blocked', severity: 'high', sourceIP: '199.151.168.47', targetService: 'File Share', fakeTime: '95 sec ago', lat: 51.1657, lng: 10.4515, country: 'DE', actor: 'SMB sweep' },
  { type: 'flagged', severity: 'low', sourceIP: '103.120.115.93', targetService: 'API Gateway', fakeTime: '2 min ago', lat: -25.0, lng: 134.0, country: 'AU', actor: 'Endpoint probing' },
  { type: 'blocked', severity: 'high', sourceIP: '197.210.224.101', targetService: 'SSH (22)', fakeTime: '2 min ago', lat: 9.1450, lng: 40.4897, country: 'ET', actor: 'SSH dictionary attack' },
  { type: 'blocked', severity: 'medium', sourceIP: '186.227.84.9', targetService: 'Web App', fakeTime: '3 min ago', lat: 19.4326, lng: -99.1332, country: 'MX', actor: 'SQLi probe' },
  { type: 'flagged', severity: 'high', sourceIP: '195.161.41.214', targetService: 'All Vectors', fakeTime: '3 min ago', lat: 56.8796, lng: 24.6032, country: 'LV', actor: 'Mass scan (Censys-like)' },
];

export function generateDemoThreatMap() {
  const nodeSeeds = [
    { lat: 40.7128, lng: -74.0060, severity: 'critical', label: 'Ransomware', country: 'US' },
    { lat: 51.5074, lng: -0.1278, severity: 'high', label: 'APT Campaign', country: 'GB' },
    { lat: 48.8566, lng: 2.3522, severity: 'medium', label: 'Phishing', country: 'FR' },
    { lat: 55.7558, lng: 37.6173, severity: 'critical', label: 'Botnet C2', country: 'RU' },
    { lat: 31.2304, lng: 121.4737, severity: 'high', label: 'Credential Dump', country: 'CN' },
    { lat: 22.3964, lng: 114.1095, severity: 'medium', label: 'Scan Wave', country: 'HK' },
    { lat: 34.0522, lng: -118.2437, severity: 'low', label: 'Recon', country: 'US' },
    { lat: -33.8688, lng: 151.2093, severity: 'medium', label: 'Shadow IT', country: 'AU' },
    { lat: 52.5200, lng: 13.4050, severity: 'high', label: 'Exploit Kit', country: 'DE' },
    { lat: 35.6762, lng: 139.6503, severity: 'medium', label: 'JP Scanning', country: 'JP' },
    { lat: 25.2048, lng: 55.2708, severity: 'low', label: 'Nav Point', country: 'AE' },
    { lat: 6.5244, lng: 3.3792, severity: 'low', label: 'Nav Point', country: 'NG' },
    { lat: -23.5505, lng: -46.6333, severity: 'medium', label: 'Malware', country: 'BR' },
    { lat: 37.5665, lng: 126.9780, severity: 'high', label: 'APT', country: 'KR' },
    { lat: -1.2921, lng: 36.8219, severity: 'low', label: 'Probe', country: 'KE' },
    { lat: 60.1699, lng: 24.9384, severity: 'low', label: 'VPN Abuse', country: 'FI' },
  ];

  const lines = [
    { from: { lat: 40.7128, lng: -74.0060 }, to: { lat: 55.7558, lng: 37.6173 }, intensity: 0.9 },
    { from: { lat: 34.0522, lng: -118.2437 }, to: { lat: 51.5074, lng: -0.1278 }, intensity: 0.7 },
    { from: { lat: 48.8566, lng: 2.3522 }, to: { lat: 31.2304, lng: 121.4737 }, intensity: 0.6 },
    { from: { lat: 22.3964, lng: 114.1095 }, to: { lat: 52.5200, lng: 13.4050 }, intensity: 0.8 },
    { from: { lat: -33.8688, lng: 151.2093 }, to: { lat: 60.1699, lng: 24.9384 }, intensity: 0.5 },
    { from: { lat: 35.6762, lng: 139.6503 }, to: { lat: 55.7558, lng: 37.6173 }, intensity: 0.6 },
    { from: { lat: 37.5665, lng: 126.9780 }, to: { lat: 48.8566, lng: 2.3522 }, intensity: 0.7 },
    { from: { lat: -23.5505, lng: -46.6333 }, to: { lat: 6.5244, lng: 3.3792 }, intensity: 0.4 },
    { from: { lat: 25.2048, lng: 55.2708 }, to: { lat: 21.4500, lng: 89.8000 }, intensity: 0.5 },
    { from: { lat: 6.5244, lng: 3.3792 }, to: { lat: -1.2921, lng: 36.8219 }, intensity: 0.3 },
    { from: { lat: -1.2921, lng: 36.8219 }, to: { lat: 25.2048, lng: 55.2708 }, intensity: 0.4 },
    { from: { lat: 34.0522, lng: -118.2437 }, to: { lat: 55.7558, lng: 37.6173 }, intensity: 0.8 },
  ];

  return { nodes: nodeSeeds, lines };
}

export function generateIntelligenceFeed() {
  return [
    { id: Date.now() + 1, level: 'alert', title: 'Ransomware wave peak in EU', detail: 'LockBit affiliate activity +180% in last 24h window', time: '2 min ago' },
    { id: Date.now() + 2, level: 'warn', title: 'New C2 domain observed', detail: 'cluster-7q.business-crm[.]online resolving in 3 regions', time: '5 min ago' },
    { id: Date.now() + 3, level: 'info', title: 'False positive reviewed', detail: '445 scan from classified corp ASN marked benign', time: '8 min ago' },
    { id: Date.now() + 4, level: 'alert', title: 'DDoS target change', detail: 'Financial services vertical now primary attack surface', time: '11 min ago' },
    { id: Date.now() + 5, level: 'warn', title: 'Exploit kit updated', detail: 'Fallout EK refactored to use new obfuscation layer', time: '14 min ago' },
    { id: Date.now() + 6, level: 'info', title: 'IOC cleanup', detail: '146 stale indicators retired from feed', time: '17 min ago' },
    { id: Date.now() + 7, level: 'info', title: 'New threat actor tracked', detail: 'UNC5217 - social engineering + QR code lure focus', time: '21 min ago' },
    { id: Date.now() + 8, level: 'warn', title: 'GeoIP anomaly', detail: 'Login from 5 countries in under 2 minutes detected', time: '26 min ago' },
    { id: Date.now() + 9, level: 'alert', title: 'CVE-2026-4821 exploitation', detail: 'Public PoC published for edge device RCE', time: '31 min ago' },
    { id: Date.now() + 10, level: 'info', title: 'Sensor sync', detail: 'All 12 global sensors reporting normal', time: '36 min ago' },
  ];
}

export function generateKPI() {
  return {
    incidentsToday: 24 + Math.floor(Math.random() * 8),
    threatsContained: 19 + Math.floor(Math.random() * 5),
    activeThreats: 3 + Math.floor(Math.random() * 3),
    investigationsOpen: 12 + Math.floor(Math.random() * 4),
    blockedRequests: 4832 + Math.floor(Math.random() * 400),
    avgResponseTimeMs: 28 + Math.floor(Math.random() * 12),
    casesResolved: 8 + Math.floor(Math.random() * 3),
    iocCount: 1542 + Math.floor(Math.random() * 100),
  };
}

export function generateSeverityChart() {
  return [
    { hour: '00:00', critical: 2, high: 5, medium: 8, low: 12 },
    { hour: '02:00', critical: 1, high: 4, medium: 6, low: 9 },
    { hour: '04:00', critical: 3, high: 6, medium: 7, low: 11 },
    { hour: '06:00', critical: 1, high: 7, medium: 9, low: 14 },
    { hour: '08:00', critical: 4, high: 9, medium: 12, low: 18 },
    { hour: '10:00', critical: 2, high: 8, medium: 15, low: 22 },
    { hour: '12:00', critical: 5, high: 12, medium: 14, low: 19 },
    { hour: '14:00', critical: 3, high: 10, medium: 10, low: 16 },
    { hour: '16:00', critical: 6, high: 11, medium: 13, low: 21 },
    { hour: '18:00', critical: 4, high: 7, medium: 9, low: 15 },
    { hour: '20:00', critical: 2, high: 6, medium: 8, low: 10 },
    { hour: '22:00', critical: 1, high: 5, medium: 7, low: 8 },
  ];
}

export function generateSourceHealth() {
  return [
    { name: 'VirusTotal', status: 'healthy', latency: 142, requests: 3842, errRate: 0.1, ok: true },
    { name: 'Shodan', status: 'healthy', latency: 98, requests: 1241, errRate: 0.2, ok: true },
    { name: 'AlienVault OTX', status: 'healthy', latency: 176, requests: 2913, errRate: 0.5, ok: true },
    { name: 'EXA Search', status: 'healthy', latency: 220, requests: 610, errRate: 1.2, ok: true },
    { name: 'NVD', status: 'degraded', latency: 480, requests: 88, errRate: 12.5, ok: false },
    { name: 'WiGLE - GeoDB', status: 'healthy', latency: 120, requests: 340, errRate: 0.9, ok: true },
  ];
}

export function generateTimelineData() {
  return [
    { event: 'Case Opened', date: 'Sep 04', time: '08:12', actor: 'Analyst mk1', detail: 'Initial report filed for suspicious network activity' },
    { event: 'IOC Enrichment', date: 'Sep 04', time: '09:45', actor: 'System', detail: '14 IPs enriched from VirusTotal + AlienVault' },
    { event: 'Correlation', date: 'Sep 05', time: '13:20', actor: 'Analyst mk1', detail: 'Linked 3 maldocs via C2 overlap' },
    { event: 'Evidence', date: 'Sep 05', time: '18:02', actor: 'Analyst agent-7', detail: 'Memory dump analysis - Beacon C2 pattern' },
    { event: 'Containment', date: 'Sep 06', time: '09:30', actor: 'IR Team', detail: 'Infected host isolated across 2 environments' },
    { event: 'Call', date: 'Sep 06', time: '15:41', actor: 'Client', detail: 'Weekly intelligence briefing delivered' },
    { event: 'Report', date: 'Sep 06', time: '17:00', actor: 'System', detail: 'PDF report generated and stored to case dossier' },
  ];
}

export function generateEntities() {
  return [
    { id: 'e1', type: 'ip', value: '185.220.101.35', label: 'C2 Server', group: 1 },
    { id: 'e2', type: 'domain', value: 'malicious-domain.com', label: 'C2 Domain', group: 1 },
    { id: 'e3', type: 'email', value: 'spoofed@example.com', label: 'Sender', group: 2 },
    { id: 'e4', type: 'hash', value: 'sha256:9f86...', label: 'Malware Sample', group: 1 },
    { id: 'e5', type: 'file', value: 'invoice.doc.lnk', label: 'Lure Document', group: 2 },
    { id: 'e6', type: 'domain', value: 'cdn-cloud-cache.net', label: 'Staging Domain', group: 1 },
  ];
}