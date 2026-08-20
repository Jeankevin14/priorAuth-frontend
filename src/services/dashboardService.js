import { requests } from '../data/requests';

export const dashboardService = {
  getDoctorDashboard(userId) {
    const ownRequests = requests.filter(request => request.ownerId === userId);
    const patients = [...new Map(ownRequests.map(request => [request.patient, request])).values()].map(patientRequest => ({
      patientId: patientRequest.patientId || patientRequest.id,
      patient: patientRequest.patient,
      diagnosis: patientRequest.diagnosis,
      activeRequests: ownRequests.filter(request => request.patient === patientRequest.patient).length,
      latestStatus: ownRequests.filter(request => request.patient === patientRequest.patient).at(-1)?.status || patientRequest.status
    }));
    return {
      requests: ownRequests,
      automatedRequests: ownRequests.filter(request => request.stage === 'Decision'),
      moreInformationRequests: ownRequests.filter(request => request.status === 'Evidence needed' || request.prediction === 'More information'),
      patients
    };
  },
  getNurseDashboard() {
    return { requests: requests.filter(request => request.prediction === 'Nurse review' || request.status === 'Evidence needed') };
  },
  getInsuranceDashboard() {
    return { requests };
  },
  getUserDashboard(userId) {
    return { requests: requests.filter(request => request.ownerId === userId) };
  }
};
