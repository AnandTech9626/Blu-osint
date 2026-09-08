export async function investigateTechnology(url) {
  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

  let headers = {};
  let html = '';
  let finalUrl = cleanUrl;
  
  try {
    const res = await fetch(cleanUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'BluOSINT/1.0 (Security Research)' },
    });
    headers = Object.fromEntries(res.headers.entries());
    finalUrl = res.url || cleanUrl;
    const buffer = await res.arrayBuffer();
    html = new TextDecoder('utf-8', { fatal: false }).decode(buffer).slice(0, 500000);
  } catch {
    return { module: 'technology', target: cleanUrl, error: 'Unable to reach target', headers: {}, timestamp: new Date().toISOString() };
  }

  const server = headers['server'] || '';
  const poweredBy = headers['x-powered-by'] || '';
  const cf = headers['cf-ray'] ? 'Cloudflare' : null;
  const contentType = headers['content-type'] || '';
  const csp = headers['content-security-policy'] || '';

  const tech = [];
  if (server) tech.push({ name: server, category: 'Server', confidence: 'high' });
  if (poweredBy) tech.push({ name: poweredBy, category: 'Framework', confidence: 'high' });
  if (cf) tech.push({ name: cf, category: 'CDN/Proxy', confidence: 'high' });

  const patterns = [
    { name: 'WordPress', regex: /wp-content|wp-includes/gmi, category: 'CMS', confidence: 'high' },
    { name: 'Drupal', regex: /drupal/gmi, category: 'CMS', confidence: 'medium' },
    { name: 'Joomla', regex: /joomla/gmi, category: 'CMS', confidence: 'medium' },
    { name: 'React', regex: /__REACT_DEVTOOLS_GLOBAL_HOOK__|_reactRootContainer/g, category: 'JS Framework', confidence: 'high' },
    { name: 'Vue.js', regex: /__VUE__|vue\.js/gm, category: 'JS Framework', confidence: 'high' },
    { name: 'Angular', regex: /ng-version=|ng-app/gm, category: 'JS Framework', confidence: 'high' },
    { name: 'Next.js', regex: /__NEXT_DATA__/g, category: 'JS Framework', confidence: 'high' },
    { name: 'Nuxt.js', regex: /__NUXT__/g, category: 'JS Framework', confidence: 'high' },
    { name: 'jQuery', regex: /jquery[-.]/gi, category: 'JS Library', confidence: 'high' },
    { name: 'Bootstrap', regex: /bootstrap/gi, category: 'CSS Framework', confidence: 'medium' },
    { name: 'Tailwind', regex: /tailwind/gi, category: 'CSS Framework', confidence: 'medium' },
    { name: 'Google Analytics', regex: /gtag|google-analytics/gi, category: 'Analytics', confidence: 'high' },
    { name: 'Google Tag Manager', regex: /gtm\.js|dataLayer/g, category: 'Analytics', confidence: 'high' },
    { name: 'Cloudflare', regex: /__cfduid|cf-optical/gi, category: 'CDN/Proxy', confidence: 'medium' },
    { name: 'Nginx', regex: /nginx/gi, category: 'Server', confidence: 'medium' },
    { name: 'Apache', regex: /apache/gi, category: 'Server', confidence: 'medium' },
    { name: 'ASP.NET', regex: /asp\.net|__VIEWSTATE/gmi, category: 'Framework', confidence: 'high' },
    { name: 'Microsoft IIS', regex: /iis\.?\d*$/gim, category: 'Server', confidence: 'medium' },
    { name: 'Shopify', regex: /myshopify\.com|Shopify/gi, category: 'eCommerce', confidence: 'high' },
    { name: 'WooCommerce', regex: /woocommerce/gi, category: 'eCommerce', confidence: 'high' },
    { name: 'Magento', regex: /magento|mage\./gi, category: 'eCommerce', confidence: 'high' },
  ];

  for (const p of patterns) {
    try {
      if (p.regex.test(html) || p.regex.test(server) || p.regex.test(poweredBy)) {
        const exists = tech.some(t => t.name.toLowerCase() === p.name.toLowerCase());
        if (!exists) tech.push({ name: p.name, category: p.category, confidence: p.confidence });
      }
    } catch { /* continue */ }
  }

  return {
    module: 'technology',
    target: cleanUrl,
    finalUrl,
    http: {
      status: headers[':status'] || null,
      server,
      poweredBy,
      contentType,
      cspConfigured: !!csp,
      hstsConfigured: !!headers['strict-transport-security'],
      cookies: (headers['set-cookie'] || []).length || 0,
      location: headers['location'] || null,
    },
    technologies: tech,
    summary: {
      total: tech.length,
      categories: [...new Set(tech.map(t => t.category))],
    },
    timestamp: new Date().toISOString(),
  };
}