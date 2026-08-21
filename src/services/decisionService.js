import { requests } from '../data/requests';
import { soundService } from './soundService';

function timestamp() {
  return `Today, ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

export const decisionService = {
  // Nurse approves the case: becomes a reviewer-confirmed ("manual") approval,
  // visible in insurance's Manual Approval bucket.
  approve(requestId) {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;
    request.status = 'Approved';
    request.approvalType = 'manual';
    request.prediction = 'Approve';
    request.tone = 'green';
    request.lastUpdated = timestamp();
    if (request.resultDetail) {
      request.resultDetail.icon = 'check';
      request.resultDetail.headline = 'Approve';
      request.resultDetail.headlineNote = 'Approved by clinical reviewer following nurse review.';
      request.resultDetail.reviewBadge = 'Approved';
      request.resultDetail.reviewBadgeTone = 'green';
    }
    soundService.playSuccess();
  },
  // Nurse requests more information: routes back to the doctor's "Need More
  // Information" queue.
  requestMoreInformation(requestId) {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;
    request.status = 'Evidence needed';
    request.prediction = 'More information';
    request.tone = 'amber';
    request.lastUpdated = timestamp();
    if (request.resultDetail) {
      request.resultDetail.icon = 'help';
      request.resultDetail.headline = 'Request more information';
      request.resultDetail.headlineNote = 'A clinical reviewer requested additional documentation before a decision can be made.';
      request.resultDetail.reviewBadge = 'More information needed';
      request.resultDetail.reviewBadgeTone = 'amber';
    }
    soundService.playAlert();
  }
};
