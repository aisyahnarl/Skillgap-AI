export const studyPathService = {
  getAll: () => fetch('/api/study-paths').then((response) => response.json()),
  create: (payload: unknown) => fetch('/api/study-paths', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((response) => response.json()),
  update: (id: string, payload: unknown) => fetch(`/api/study-paths/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((response) => response.json()),
  remove: (id: string) => fetch(`/api/study-paths/${id}`, { method: 'DELETE' }).then((response) => response.json()),
};
