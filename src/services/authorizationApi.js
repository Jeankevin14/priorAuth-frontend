import { requests } from '../data/requests';

// Mock contract mirroring the future Express API. Replace internals with apiClient calls when the backend is available.
export const authorizationApi = {
  async getAuthorizations() { return requests; },
  async getAuthorizationById(id) { return requests.find(request => request.id === id) || null; },
  async createAuthorization(payload) { return { ...payload, id: `PA-${Date.now()}` }; },
  async submitAuthorization(id) { return requests.find(request => request.id === id) || null; },
  async getEvaluation(id) { return requests.find(request => request.id === id) || null; },
  async getPolicyEvidence(id) { return requests.find(request => request.id === id)?.policy || null; },
  async getAuditTrail(id) { return requests.find(request => request.id === id)?.timeline || []; }
};
