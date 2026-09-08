import { apiRequest } from '../lib/apiClient.js';

export async function investigateWHOIS(domain) {
  const cleanDomain = domain.replace(/^(https?:\/\/)?/, '').replace(/\/.*$/, '').trim();

  const vtResult = await apiRequest('virustotal', `https://www.virustotal.com/api/v3/domains/${cleanDomain}`, {
    authHeader: 'x-apikey',
    noKeyRequired: true,
  });

  const data = vtResult.data?.data?.attributes || {};
  const whoisRaw = data.whois || '';
  const registrar = data.registrar || null;

  const parsed = {};
  if (whoisRaw) {
    const lines = whoisRaw.split('\n');
    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)/);
      if (match) {
        parsed[match[1].trim()] = match[2].trim();
      }
    }
  }

  return {
    module: 'whois',
    target: cleanDomain,
    registrar: registrar || parsed['Registrar'] || 'Unknown',
    registrant: {
      name: parsed['Registrant Name'] || parsed['Registrant'] || null,
      organization: parsed['Registrant Organization'] || parsed['OrgName'] || null,
      country: parsed['Registrant Country'] || parsed['Country'] || null,
      email: parsed['Registrant Email'] || null,
    },
    dates: {
      created: data.creation_date ? new Date(data.creation_date * 1000).toISOString() : (parsed['Creation Date'] || null),
      updated: data.last_update_date ? new Date(data.last_update_date * 1000).toISOString() : (parsed['Updated Date'] || null),
      expires: data.expiration_date ? new Date(data.expiration_date * 1000).toISOString() : (parsed['Expiry Date'] || null),
    },
    nameservers: data.last_dns_records?.filter(r => r.type === 'NS').map(r => r.value) || [],
    rawWhois: whoisRaw || null,
    timestamp: new Date().toISOString(),
  };
}
