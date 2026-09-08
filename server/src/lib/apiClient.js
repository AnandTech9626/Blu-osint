import fetch from 'node-fetch';

const rateLimits = {};

function checkRateLimit(provider, maxPerMinute = 30) {
  const now = Date.now();
  if (!rateLimits[provider]) rateLimits[provider] = [];
  rateLimits[provider] = rateLimits[provider].filter(t => now - t < 60000);
  if (rateLimits[provider].length >= maxPerMinute) {
    throw new Error(`Rate limit exceeded for ${provider}. Try again in a moment.`);
  }
  rateLimits[provider].push(now);
}

function getAPIKey(provider) {
  const keys = {
    shodan: process.env.SHODAN_API_KEY,
    virustotal: process.env.VIRUS_TOTAL,
    alienvault: process.env.ALIENVAULT_API,
    exa: process.env.EXA_API,
    nvd: process.env.NVD_API_KEY,
  };
  return keys[provider];
}

export async function apiRequest(provider, url, options = {}) {
  checkRateLimit(provider, options.rateLimit || 30);
  const key = getAPIKey(provider);
  if (!key && !options.noKeyRequired) {
    return { error: true, message: `API key not configured for ${provider}`, source: provider, demo: true };
  }

  const startTime = Date.now();
  try {
    const headers = { 'Accept': 'application/json', ...options.headers };
    if (options.authHeader && key) headers[options.authHeader] = key;
    if (options.otxHeaders && process.env.ALIENVAULT_API) headers['X-OTX-API-KEY'] = process.env.ALIENVAULT_API;
    if (options.apiKeyParam && key) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}${options.apiKeyParam}=${key}`;
    }
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(options.timeout || 15000),
    });
    const latency = Date.now() - startTime;
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { error: true, message: `HTTP ${res.status}: ${text.slice(0, 200)}`, source: provider, latency };
    }
    const data = await res.json();
    return { data, source: provider, latency, status: 'ok' };
  } catch (err) {
    return { error: true, message: err.message, source: provider, latency: Date.now() - startTime };
  }
}

export function getAPIHealth() {
  const providers = ['shodan', 'virustotal', 'alienvault', 'exa', 'nvd'];
  return providers.map(p => ({
    provider: p,
    configured: !!getAPIKey(p),
  }));
}

export { getAPIKey };
