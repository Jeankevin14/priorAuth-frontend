import { requests } from '../data/requests';
import { patientService } from './patientService';

export const dashboardService = {
  getDoctorDashboard(userId) {
    const ownRequests = requests.filter(request => request.ownerId === userId);
    return {
      requests: ownRequests,
      approvedRequests: ownRequests.filter(request => request.status === 'Approved'),
      moreInformationRequests: ownRequests.filter(request => request.status === 'Evidence needed' || request.prediction === 'More information'),
      patients: patientService.getPatients(userId)
    };
  },
  getNurseDashboard() {
    return { requests: requests.filter(request => request.prediction === 'Nurse review' || request.status === 'Evidence needed') };
  },
  getInsuranceDashboard() {
    return {
      requests,
      automatedApprovals: requests.filter(request => request.approvalType === 'automated'),
      manualApprovals: requests.filter(request => request.approvalType === 'manual'),
      pendingCases: requests.filter(request => request.status !== 'Approved')
    };
  },
  getUserDashboard(userId) {
    return { requests: requests.filter(request => request.ownerId === userId) };
  }
};
