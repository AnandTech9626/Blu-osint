import { apiRequest } from '../lib/apiClient.js';

export async function exaSearch(query, opts = {}) {
  const body = {
    query,
    type: 'auto',
    numResults: opts.numResults || 8,
    contents: { text: true, highlights: true },
  };

  const key = process.env.EXA_API;
  if (!key) {
    return {
      module: 'exa',
      demo: true,
      results: [
        {
          title: `Search results for "${query}" (demo mode - EXA API not configured)`,
          url: 'https://example.com',
          text: 'Connect your EXA API key in server/.env. This is synthetic data for demonstration purposes.',
          highlights: [],
        },
      ],
    };
  }

  try {
    const res = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      return { module: 'exa', error: `EXA HTTP ${res.status}`, demo: false };
    }
    const data = await res.json();
    return {
      module: 'exa',
      results: (data.results || []).map(r => ({
        title: r.title,
        url: r.url,
        text: (r.text || '').slice(0, 400),
        published: r.publishedDate || r.published_date || null,
        highlights: r.highlights || [],
      })),
      demo: false,
    };
  } catch (e) {
    return { module: 'exa', error: e.message, demo: false };
  }
}