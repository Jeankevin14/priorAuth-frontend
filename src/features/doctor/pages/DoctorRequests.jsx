import { ChevronRight, UploadCloud } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../../../components/layout/AppLayout';
import { Badge, Card } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { dashboardService } from '../../../services/dashboardService';

const filters = {
  '/doctor/requests': 'ALL',
  '/doctor/requests/approved': 'APPROVED',
  '/doctor/requests/need-information': 'NEED_MORE_INFORMATION'
};

const pageDetails = {
  ALL: { title: 'Total requests' },
  APPROVED: { title: 'Approved requests' },
  NEED_MORE_INFORMATION: { title: 'Need more information' }
};

export default function DoctorRequests() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const filter = filters[pathname] || 'ALL';
  const dashboard = dashboardService.getDoctorDashboard(user.id);
  const detail = pageDetails[filter];
  const visibleRequests = filter === 'APPROVED' ? dashboard.approvedRequests : filter === 'NEED_MORE_INFORMATION' ? dashboard.moreInformationRequests : dashboard.requests;
  const viewPatient = request => navigate(`/doctor/patients/${request.patientId || request.id}`);

  return <AppLayout><div className="page queue"><div className="page-heading"><div><h1>{detail.title}</h1></div></div><Card><div className="request-table">
    {filter === 'ALL' && <><div className="thead" style={{gridTemplateColumns:'1fr 1.3fr 1.4fr 1.4fr 1fr 1.1fr 30px'}}><span>Request ID</span><span>Patient</span><span>Diagnosis</span><span>Requested service</span><span>Status</span><span>Submitted date</span><span>Action</span></div>{visibleRequests.map(request => <div className="trow" style={{gridTemplateColumns:'1fr 1.3fr 1.4fr 1.4fr 1fr 1.1fr 30px', cursor:'pointer'}} role="link" tabIndex={0} key={request.id} onClick={() => viewPatient(request)} onKeyDown={event => event.key === 'Enter' && viewPatient(request)}><strong>{request.id}</strong><span>{request.patient}</span><span>{request.diagnosis}</span><span>{request.service}</span><Badge type={request.tone}>{request.status}</Badge><small>{request.date}</small><button className="open" type="button" onClick={event => { event.stopPropagation(); viewPatient(request); }}><ChevronRight size={17}/></button></div>)}</>}
    {filter === 'APPROVED' && <><div className="thead" style={{gridTemplateColumns:'1fr 1.2fr 1.4fr 1.2fr 1.2fr .8fr 1fr 1.1fr 30px'}}><span>Request ID</span><span>Patient</span><span>Requested service</span><span>Policy</span><span>AI recommendation</span><span>Confidence</span><span>Status</span><span>Date</span><span>Action</span></div>{visibleRequests.map(request => <div className="trow" style={{gridTemplateColumns:'1fr 1.2fr 1.4fr 1.2fr 1.2fr .8fr 1fr 1.1fr 30px', cursor:'pointer'}} role="link" tabIndex={0} key={request.id} onClick={() => viewPatient(request)} onKeyDown={event => event.key === 'Enter' && viewPatient(request)}><strong>{request.id}</strong><span>{request.patient}</span><span>{request.service}</span><span>{request.policy}</span><span>{request.prediction}</span><span>{request.confidence}</span><Badge type={request.tone}>{request.status}</Badge><small>{request.date}</small><button className="open" type="button" onClick={event => { event.stopPropagation(); viewPatient(request); }}><ChevronRight size={17}/></button></div>)}</>}
    {filter === 'NEED_MORE_INFORMATION' && <><div className="thead" style={{gridTemplateColumns:'1fr 1.3fr 1.5fr 1.5fr 1.5fr 1.1fr 1.8fr'}}><span>Request ID</span><span>Patient</span><span>Requested service</span><span>Missing information</span><span>Missing documents</span><span>Date requested</span><span>Action</span></div>{visibleRequests.map(request => <div className="trow" style={{gridTemplateColumns:'1fr 1.3fr 1.5fr 1.5fr 1.5fr 1.1fr 1.8fr', cursor:'pointer'}} role="link" tabIndex={0} key={request.id} onClick={() => viewPatient(request)} onKeyDown={event => event.key === 'Enter' && viewPatient(request)}><strong>{request.id}</strong><span>{request.patient}</span><span>{request.service}</span><span>{request.missingInformation}</span><span>{request.requiredDocument || request.documents?.find(([, status]) => status === 'Missing')?.[0] || 'Not specified'}</span><small>{request.date}</small><span className="table-actions"><button className="text-button" type="button" onClick={event => { event.stopPropagation(); viewPatient(request); }}>View</button><button className="text-button" type="button" onClick={event => event.stopPropagation()}><UploadCloud size={14}/>Upload Information</button><button className="text-button" type="button" onClick={event => event.stopPropagation()}>Resubmit</button></span></div>)}</>}
  </div></Card></div></AppLayout>;
}
