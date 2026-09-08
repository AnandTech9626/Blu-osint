import { apiRequest } from '../lib/apiClient.js';

export async function investigateDNS(domain) {
  const cleanDomain = domain.replace(/^(https?:\/\/)?/, '').replace(/\/.*$/, '').trim();
  
  const [vtResult, shodanResult] = await Promise.allSettled([
    apiRequest('virustotal', `https://www.virustotal.com/api/v3/domains/${cleanDomain}/resolutions`, {
      authHeader: 'x-apikey',
      noKeyRequired: true,
    }),
    apiRequest('shodan', `https://api.shodan.io/dns/domain/${cleanDomain}?key=${process.env.SHODAN_API_KEY || ''}`, {
      noKeyRequired: true,
    }),
  ]);

  const vtData = vtResult.status === 'fulfilled' && !vtResult.value.error ? vtResult.value.data : null;
  const shodanData = shodanResult.status === 'fulfilled' && !shodanResult.value.error ? shodanResult.value.data : null;

  const records = [];
  
  if (shodanData?.data) {
    for (const r of shodanData.data) {
      records.push({
        type: r.type,
        value: r.value,
        hostname: r.hostname,
        ttl: r.ttl,
      });
    }
  }

  const resolutions = [];
  if (vtData?.data) {
    for (const res of vtData.data.slice(0, 50)) {
      resolutions.push({
        ip: res.attributes?.ip_address,
        hostName: res.attributes?.host_name,
        lastResolved: res.attributes?.date,
      });
    }
  }

  const recordTypes = {};
  records.forEach(r => { recordTypes[r.type] = (recordTypes[r.type] || 0) + 1; });

  return {
    module: 'dns',
    target: cleanDomain,
    records,
    recordTypes,
    resolutions,
    summary: {
      totalRecords: records.length,
      totalResolutions: resolutions.length,
      uniqueIPs: new Set(resolutions.map(r => r.ip)).size,
      recordTypeBreakdown: recordTypes,
    },
    timestamp: new Date().toISOString(),
  };
}
