import { useState } from 'react';
import { ChevronRight, UploadCloud } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../../../components/layout/AppLayout';
import { Badge, Card } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { dashboardService } from '../../../services/dashboardService';

const filters = {
  '/doctor/requests': 'ALL',
  '/doctor/requests/automated': 'AUTOMATED',
  '/doctor/requests/need-information': 'NEED_MORE_INFORMATION'
};

const pageDetails = {
  ALL: { title: 'Total requests' },
  AUTOMATED: { title: 'Automated requests' },
  NEED_MORE_INFORMATION: { title: 'Need more information' }
};

export default function DoctorRequests() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const filter = filters[pathname] || 'ALL';
  const dashboard = dashboardService.getDoctorDashboard(user.id);
  const detail = pageDetails[filter];
  const visibleRequests = filter === 'AUTOMATED' ? dashboard.automatedRequests : filter === 'NEED_MORE_INFORMATION' ? dashboard.moreInformationRequests : dashboard.requests;
  const [selectedRequest, setSelectedRequest] = useState(null);

  return <AppLayout><div className="page queue"><div className="page-heading"><div><h1>{detail.title}</h1></div></div><Card><div className="request-table">{filter === 'ALL' && <><div className="thead" style={{gridTemplateColumns:'1fr 1.3fr 1.4fr 1.4fr 1fr 1.1fr 30px'}}><span>Request ID</span><span>Patient</span><span>Diagnosis</span><span>Requested service</span><span>Status</span><span>Submitted date</span><span>Action</span></div>{visibleRequests.map(request => <div className="trow" style={{gridTemplateColumns:'1fr 1.3fr 1.4fr 1.4fr 1fr 1.1fr 30px'}} key={request.id}><strong>{request.id}</strong><span>{request.patient}</span><span>{request.diagnosis}</span><span>{request.service}</span><Badge type={request.tone}>{request.status}</Badge><small>{request.date}</small><button className="open" type="button" onClick={() => setSelectedRequest(request)}><ChevronRight size={17}/></button></div>)}</>}{filter === 'AUTOMATED' && <><div className="thead" style={{gridTemplateColumns:'1fr 1.2fr 1.4fr 1.2fr 1.2fr .8fr 1fr 1.1fr 30px'}}><span>Request ID</span><span>Patient</span><span>Requested service</span><span>Policy</span><span>AI recommendation</span><span>Confidence</span><span>Status</span><span>Date</span><span>Action</span></div>{visibleRequests.map(request => <div className="trow" style={{gridTemplateColumns:'1fr 1.2fr 1.4fr 1.2fr 1.2fr .8fr 1fr 1.1fr 30px'}} key={request.id}><strong>{request.id}</strong><span>{request.patient}</span><span>{request.service}</span><span>{request.policy}</span><span>{request.prediction}</span><span>{request.confidence}</span><Badge type={request.tone}>{request.status}</Badge><small>{request.date}</small><button className="open" type="button" onClick={() => setSelectedRequest(request)}><ChevronRight size={17}/></button></div>)}</>}{filter === 'NEED_MORE_INFORMATION' && <><div className="thead" style={{gridTemplateColumns:'1fr 1.3fr 1.5fr 1.5fr 1.5fr 1.1fr 1.8fr'}}><span>Request ID</span><span>Patient</span><span>Requested service</span><span>Missing information</span><span>Missing documents</span><span>Date requested</span><span>Action</span></div>{visibleRequests.map(request => <div className="trow" style={{gridTemplateColumns:'1fr 1.3fr 1.5fr 1.5fr 1.5fr 1.1fr 1.8fr'}} key={request.id}><strong>{request.id}</strong><span>{request.patient}</span><span>{request.service}</span><span>{request.missingInformation}</span><span>{request.requiredDocument || request.documents?.find(([, status]) => status === 'Missing')?.[0] || 'Not specified'}</span><small>{request.date}</small><span className="table-actions"><button className="text-button" type="button" onClick={() => setSelectedRequest(request)}>View</button><button className="text-button" type="button"><UploadCloud size={14}/>Upload Information</button><button className="text-button" type="button">Resubmit</button></span></div>)}</>}</div></Card>{selectedRequest && <Card className="attention"><div className="section-title"><div><p className="eyebrow">REQUEST DETAILS · {selectedRequest.id}</p><h3>{selectedRequest.patient}</h3></div><Badge type={selectedRequest.tone}>{selectedRequest.status}</Badge></div><p>{selectedRequest.service}{selectedRequest.diagnosis ? ` · ${selectedRequest.diagnosis}` : ''}</p></Card>}</div></AppLayout>;
}