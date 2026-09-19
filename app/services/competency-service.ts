export const competencyService = {
  getAll: () => fetch('/api/competencies').then((response) => response.json()),
  create: (payload: unknown) => fetch('/api/competencies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((response) => response.json()),
  update: (id: string, payload: unknown) => fetch(`/api/competencies/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((response) => response.json()),
  remove: (id: string) => fetch(`/api/competencies/${id}`, { method: 'DELETE' }).then((response) => response.json()),
};
