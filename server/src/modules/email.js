import { apiRequest } from '../lib/apiClient.js';

export async function investigateEmail(email) {
  const localPart = email.split('@')[0];
  const domain = email.split('@')[1];

  const [vtResult, avResult] = await Promise.allSettled([
    apiRequest('virustotal', `https://www.virustotal.com/api/v3/emails/${encodeURIComponent(email)}`, {
      authHeader: 'x-apikey',
      otxHeaders: true, noKeyRequired: true,
    }),
    apiRequest('alienvault', `https://otx.alienvault.com/api/v1/indicators/email/${email}/general`, {
      otxHeaders: true, noKeyRequired: true,
    }),
  ]);

  const vtData = vtResult.status === 'fulfilled' && !vtResult.value.error ? vtResult.value.data : null;
  const avData = avResult.status === 'fulfilled' && !avResult.value.error ? avResult.value.data : null;

  const hasMx = vtData?.data?.attributes?.has_widget;
  const rep = vtData?.data?.attributes?.last_analysis_stats || {};
  const malicious = rep.malicious || 0;

  let threatLevel = 'clean';
  let threatScore = 0;
  if (malicious > 3) { threatLevel = 'high'; threatScore = 80; }
  else if (malicious > 0) { threatLevel = 'medium'; threatScore = 50; }

  const breaches = [];
  if (avData) {
    breaches.push(...(avData.pulse_info?.pulses?.slice(0, 10).map(p => ({
      name: p.name,
      description: p.description,
      created: p.created,
      adversary: p.adversary,
    })) || []));
  }

  return {
    module: 'email',
    target: email,
    threat: { level: threatLevel, score: threatScore, malicious },
    reputation: { categories: vtData?.data?.attributes?.categories || {} },
    breaches,
    breachCount: breaches.length,
    domain: {
      name: domain,
      isFreemail: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'protonmail.com'].includes(domain),
    },
    username: localPart,
    timestamp: new Date().toISOString(),
  };
}
