const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),

  investigate: (module, target, extra = {}) => api.post(`/investigate/${module}`, { target, ...extra }),

  health: () => api.get('/health'),
  kpi: () => api.get('/kpi'),
  severityChart: () => api.get('/severity-chart'),
  intelFeed: () => api.get('/intel-feed'),
  threatMap: () => api.get('/threat-map'),
  timelineData: () => api.get('/timeline'),
  sourceHealth: () => api.get('/source-health'),
  threatFeed: () => api.get('/threat-feed'),
  threatStats: () => api.get('/threat-stats'),
  cves: (q) => api.get(`/cves${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  threatSearch: (q) => api.get(`/threat-search?q=${encodeURIComponent(q)}`),
  exaSearch: (query, numResults = 8) => api.post('/search/exa', { query, numResults }),

  cases: {
    list: () => api.get('/cases'),
    get: (id) => api.get(`/cases/${id}`),
    create: (data) => api.post('/cases', data),
    update: (id, data) => api.put(`/cases/${id}`, data),
    remove: (id) => api.delete(`/cases/${id}`),
    timeline: (id, data) => api.post(`/cases/${id}/timeline`, data),
    entity: (id, data) => api.post(`/cases/${id}/entities`, data),
    report: (id, data) => api.post(`/cases/${id}/report`, data),
    reports: (id) => api.get(`/cases/${id}/reports`),
  },

  graph: (caseId) => api.get(`/graph${caseId ? `?caseId=${caseId}` : ''}`),
  demoEntities: () => api.get('/demo/entities'),
};