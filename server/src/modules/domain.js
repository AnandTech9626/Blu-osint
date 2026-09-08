import { apiRequest } from '../lib/apiClient.js';

export async function investigateDomain(domain) {
  const cleanDomain = domain.replace(/^(https?:\/\/)?/, '').replace(/\/.*$/, '').trim();

  const [vtResult, alienvaultResult, shodanResult] = await Promise.allSettled([
    apiRequest('virustotal', `https://www.virustotal.com/api/v3/domains/${cleanDomain}`, {
      authHeader: 'x-apikey',
      apiKeyParam: null,
      timeout: 10000,
    }),
    apiRequest('alienvault', `https://otx.alienvault.com/api/v1/indicators/domain/${cleanDomain}/general`, {
      otxHeaders: true, noKeyRequired: true,
      timeout: 10000,
    }),
    apiRequest('shodan', `https://api.shodan.io/dns/domain/${cleanDomain}?key=${process.env.SHODAN_API_KEY || ''}`, {
      otxHeaders: true, noKeyRequired: true,
      timeout: 10000,
    }),
  ]);

  const vtData = vtResult.status === 'fulfilled' && !vtResult.value.error ? vtResult.value.data : null;
  const avData = alienvaultResult.status === 'fulfilled' && !alienvaultResult.value.error ? alienvaultResult.value.data : null;
  const shodanData = shodanResult.status === 'fulfilled' && !shodanResult.value.error ? shodanResult.value.data : null;

  const reputation = vtData?.data?.attributes?.last_analysis_stats || {};
  const malicious = reputation.malicious || 0;
  const suspicious = reputation.suspicious || 0;
  const harmless = reputation.harmless || 0;

  let threatLevel = 'clean';
  let threatScore = 0;
  if (malicious > 5) { threatLevel = 'critical'; threatScore = 95; }
  else if (malicious > 2) { threatLevel = 'high'; threatScore = 75; }
  else if (malicious > 0 || suspicious > 3) { threatLevel = 'medium'; threatScore = 50; }
  else if (suspicious > 0) { threatLevel = 'low'; threatScore = 25; }

  return {
    module: 'domain',
    target: cleanDomain,
    threat: { level: threatLevel, score: threatScore, malicious, suspicious, harmless },
    dns: shodanData?.data?.map(r => ({
      hostname: r.hostname,
      type: r.type,
      value: r.value,
    })) || [],
    whois: vtData?.data?.attributes?.whois ? { raw: vtData.data.attributes.whois } : null,
    reputation: {
      categories: vtData?.data?.attributes?.categories || {},
      popularity: vtData?.data?.attributes?.popularity_ranks || {},
    },
    communityNotes: avData?.pulse_info?.count || 0,
    tags: avData?.tags || [],
    timestamp: new Date().toISOString(),
    source: 'blu-osint',
    dataSources: {
      virustotal: !vtData,
      alienvault: !!avData,
      shodan: !!shodanData,
    },
  };
}
