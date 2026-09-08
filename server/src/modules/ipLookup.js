import { apiRequest } from '../lib/apiClient.js';

export async function investigateIP(ip) {
  const [vtResult, shodanResult, avResult] = await Promise.allSettled([
    apiRequest('virustotal', `https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      authHeader: 'x-apikey',
      otxHeaders: true, noKeyRequired: true,
    }),
    apiRequest('shodan', `https://api.shodan.io/shodan/host/${ip}?key=${process.env.SHODAN_API_KEY || ''}`, {
      otxHeaders: true, noKeyRequired: true,
    }),
    apiRequest('alienvault', `https://otx.alienvault.com/api/v1/indicators/IPv4/${ip}/general`, {
      otxHeaders: true, noKeyRequired: true,
    }),
  ]);

  const vtData = vtResult.status === 'fulfilled' && !vtResult.value.error ? vtResult.value.data : null;
  const shodanData = shodanResult.status === 'fulfilled' && !shodanResult.value.error ? shodanResult.value.data : null;
  const avData = avResult.status === 'fulfilled' && !avResult.value.error ? avResult.value.data : null;

  const attrs = vtData?.data?.attributes || {};
  const rep = attrs.last_analysis_stats || {};
  const malicious = rep.malicious || 0;
  const suspicious = rep.suspicious || 0;

  let threatLevel = 'clean';
  let threatScore = 0;
  if (malicious > 10) { threatLevel = 'critical'; threatScore = 95; }
  else if (malicious > 5) { threatLevel = 'high'; threatScore = 75; }
  else if (malicious > 0) { threatLevel = 'medium'; threatScore = 50; }
  else if (suspicious > 0) { threatLevel = 'low'; threatScore = 25; }

  const services = [];
  if (shodanData?.data) {
    for (const item of shodanData.data) {
      services.push({
        port: item.port,
        protocol: item.transport || 'tcp',
        service: item.product || item.name || 'unknown',
        banner: item.data?.slice(0, 200),
        version: item.version,
      });
    }
  }

  return {
    module: 'ip',
    target: ip,
    threat: { level: threatLevel, score: threatScore, malicious, suspicious },
    geo: {
      country: attrs.country || shodanData?.data?.[0]?.location?.country_name,
      city: attrs.city || shodanData?.data?.[0]?.location?.city,
      asn: attrs.asn,
      as_owner: attrs.as_owner,
      lat: shodanData?.data?.[0]?.location?.latitude,
      lng: shodanData?.data?.[0]?.location?.longitude,
      isp: attrs.whois || shodanData?.data?.[0]?.isp,
    },
    services,
    ports: services.map(s => s.port),
    tags: avData?.tags || [],
    communityPulses: avData?.pulse_info?.count || 0,
    timestamp: new Date().toISOString(),
  };
}
