import { ChevronRight, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../../../components/layout/AppLayout';
import { Badge, Card } from '../../../components/ui';
import { dashboardService } from '../../../services/dashboardService';

const filters = {
  '/insurance/requests': 'ALL',
  '/insurance/requests/automated': 'AUTOMATED',
  '/insurance/requests/manual': 'MANUAL'
};

const pageDetails = {
  ALL: { title: 'All requests', eyebrow: 'AUTHORIZATION REQUESTS' },
  AUTOMATED: { title: 'Automated approval', eyebrow: 'STRAIGHT-THROUGH DECISIONS' },
  MANUAL: { title: 'Manual approval', eyebrow: 'REVIEWER-CONFIRMED DECISIONS' }
};

const columns = '.8fr 1.25fr 1.25fr 1.3fr .85fr .6fr .85fr .9fr .45fr';

export default function ReviewerRequests() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const filter = filters[pathname] || 'ALL';
  const dashboard = dashboardService.getInsuranceDashboard();
  const detail = pageDetails[filter];
  const visibleRequests = filter === 'AUTOMATED' ? dashboard.automatedApprovals : filter === 'MANUAL' ? dashboard.manualApprovals : dashboard.requests;
  const viewPatient = request => navigate(`/patients/${request.patientId || request.id}`);

  return <AppLayout><div className="page queue"><div className="page-heading"><div><p className="eyebrow">{detail.eyebrow}</p><h1>{detail.title}</h1></div><Badge type="blue">{visibleRequests.length} request{visibleRequests.length === 1 ? '' : 's'}</Badge></div><Card><div className="request-table">
    <div className="thead" style={{ gridTemplateColumns: columns }}><span>Request ID</span><span>Patient</span><span>Diagnosis</span><span>Requested service</span><span>AI recommendation</span><span>Confidence</span><span>Status</span><span>Submitted</span><span>Action</span></div>
    {visibleRequests.map(request => <div className="trow" style={{ gridTemplateColumns: columns, cursor: 'pointer' }} role="link" tabIndex={0} key={request.id} onClick={() => viewPatient(request)} onKeyDown={event => event.key === 'Enter' && viewPatient(request)}><strong>{request.id}</strong><span>{request.patient}</span><span>{request.diagnosis}</span><span>{request.service}</span><span>{request.prediction || '—'}</span><span>{request.confidence || '—'}</span><Badge type={request.tone}>{request.status}</Badge><small>{request.date}</small><button className="open" type="button" onClick={event => { event.stopPropagation(); viewPatient(request); }}><ChevronRight size={17}/></button></div>)}
    {visibleRequests.length === 0 && <div className="empty"><FileText size={27}/><h3>No requests in this category</h3><p>Requests matching this filter will appear here.</p></div>}
  </div></Card></div></AppLayout>;
}
