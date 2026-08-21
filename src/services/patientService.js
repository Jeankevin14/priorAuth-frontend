import { requests } from '../data/requests';

function groupByPatient(ownRequests) {
  const byPatient = new Map();
  ownRequests.forEach(request => {
    const key = request.patientId || request.id;
    if (!byPatient.has(key)) byPatient.set(key, []);
    byPatient.get(key).push(request);
  });
  return byPatient;
}

function toPatientSummary(patientRequests) {
  const latest = patientRequests.at(-1);
  return {
    patientId: latest.patientId || latest.id,
    patient: latest.patient,
    initials: latest.initials,
    dateOfBirth: latest.dateOfBirth,
    age: latest.age,
    sex: latest.sex,
    insuranceProvider: latest.insuranceProvider || 'Not specified',
    planName: latest.planName,
    memberId: latest.memberId,
    diagnosis: latest.diagnosis,
    activeRequests: patientRequests.length,
    latestStatus: latest.status,
    lastUpdated: latest.lastUpdated || latest.date,
    tone: latest.tone
  };
}

function buildPatientDetail(patientRequests) {
  if (!patientRequests.length) return null;
  return { ...toPatientSummary(patientRequests), requests: patientRequests, latest: patientRequests.at(-1) };
}

export const patientService = {
  getPatients(ownerId) {
    const ownRequests = requests.filter(request => request.ownerId === ownerId);
    return [...groupByPatient(ownRequests).values()].map(toPatientSummary);
  },
  getPatientById(ownerId, patientId) {
    const ownRequests = requests.filter(request => request.ownerId === ownerId);
    return buildPatientDetail(ownRequests.filter(request => (request.patientId || request.id) === patientId));
  },
  getAllPatients() {
    return [...groupByPatient(requests).values()].map(toPatientSummary);
  },
  getPatientByIdAnyOwner(patientId) {
    return buildPatientDetail(requests.filter(request => (request.patientId || request.id) === patientId));
  },
  // For roles scoped to an arbitrary pre-filtered request list (e.g. nurse: only
  // requests currently needing clinical review) rather than by ownerId or "all".
  getPatientsFromList(requestList) {
    return [...groupByPatient(requestList).values()].map(toPatientSummary);
  },
  getPatientByIdFromList(requestList, patientId) {
    return buildPatientDetail(requestList.filter(request => (request.patientId || request.id) === patientId));
  }
};
