import { requests } from '../data/requests';

const toReadonlyRequest = ({ id, ownerId, patient, patientId, memberId, age, sex, dateOfBirth, planName, planId, coverageStatus, policyName, policyId, policyType, policyEffective, diagnosis, icd10, secondaryDiagnoses, clinicalHistory, service, procedureCode, urgency, careSetting, prediction, status, date, lastUpdated, tone, stage, decision, decisionExplanation, missingInformation, documents, timeline }) => ({
  id,
  ownerId,
  patient,
  patientId,
  memberId,
  age,
  sex,
  dateOfBirth,
  planName,
  planId,
  coverageStatus,
  policyName,
  policyId,
  policyType,
  policyEffective,
  diagnosis,
  icd10,
  secondaryDiagnoses,
  clinicalHistory,
  service,
  procedureCode,
  urgency,
  careSetting,
  prediction,
  status,
  date,
  lastUpdated,
  tone,
  stage,
  decision,
  decisionExplanation,
  missingInformation,
  documents,
  timeline
});

export const authorizationService = {
  getReadonlySummary(userId) {
    const readonlyRequests = requests.filter(request => request.ownerId === userId).map(toReadonlyRequest);
    const todayRequests = readonlyRequests.filter(request => request.date.startsWith('Today'));
    return {
      requestsToday: todayRequests.length,
      approved: readonlyRequests.filter(request => request.status === 'Approved').length,
      nurseReview: readonlyRequests.filter(request => request.prediction === 'Nurse review').length,
      moreInformation: readonlyRequests.filter(request => request.prediction === 'More information').length,
      requests: readonlyRequests,
      pipeline: readonlyRequests[0] ? { completed: readonlyRequests[0].stage === 'Decision' ? 6 : 4, inProgress: readonlyRequests[0].stage === 'Decision' ? 0 : 1, currentStage: readonlyRequests[0].stage } : { completed: 0, inProgress: 0, currentStage: null }
    };
  },
  getReadonlyAuthorization(userId, requestId) {
    const request = requests.find(item => item.ownerId === userId && item.id === requestId);
    return request ? toReadonlyRequest(request) : null;
  },
  getReadonlyRecord(userId) {
    const request = requests.find(item => item.ownerId === userId);
    return request ? toReadonlyRequest(request) : null;
  },
  getReadonlyAnalytics() {
    return { requestsToday: 128, approved: 76, nurseReview: 31, moreInformation: 21 };
  }
};
