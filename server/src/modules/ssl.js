import { apiRequest } from '../lib/apiClient.js';

export async function investigateSSL(domain) {
  const cleanDomain = domain.replace(/^(https?:\/\/)?/, '').replace(/\/.*$/, '').trim();

  const [vtResult, crtResult] = await Promise.allSettled([
    apiRequest('virustotal', `https://www.virustotal.com/api/v3/domains/${cleanDomain}`, {
      authHeader: 'x-apikey',
      noKeyRequired: true,
    }),
    apiRequest('crtsh', `https://crt.sh/?q=%25.${cleanDomain}&output=json`, {
      noKeyRequired: true,
      timeout: 10000,
    }),
  ]);

  const vtData = vtResult.status === 'fulfilled' && !vtResult.value.error ? vtResult.value.data : null;
  const crtData = crtResult.status === 'fulfilled' && !crtResult.value.error ? crtResult.value.data : null;

  const attrs = vtData?.data?.attributes || {};
  const lastSsl = attrs.last_https_certificate || {};

  const certificates = [];
  if (Array.isArray(crtData)) {
    const seen = new Set();
    for (const cert of crtData.slice(0, 100)) {
      const key = cert.common_name + cert.issuer_name;
      if (seen.has(key)) continue;
      seen.add(key);
      certificates.push({
        name: cert.common_name,
        issuer: cert.issuer_name,
        notBefore: cert.not_before,
        notAfter: cert.not_after,
        serialNumber: cert.serial_number,
      });
    }
  }

  return {
    module: 'ssl',
    target: cleanDomain,
    currentCert: {
      issuer: lastSsl.issuer?.CN || lastSsl.issuer?.O || null,
      subject: lastSsl.subject?.CN || null,
      validFrom: lastSsl.validity?.notBefore || null,
      validTo: lastSsl.validity?.notAfter || null,
      serialNumber: lastSsl.serialNumber || null,
      san: lastSsl.subject_alternative_names || [],
    },
    certificates,
    summary: {
      totalCerts: certificates.length,
      uniqueIssuers: new Set(certificates.map(c => c.issuer)).size,
    },
    timestamp: new Date().toISOString(),
  };
}
