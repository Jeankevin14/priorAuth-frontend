import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { Badge, Card } from '../../../components/ui';
import { requests } from '../../../data/requests';
import { useSoundEffects } from '../../../hooks/useSoundEffects';
import { isHighPriorityRequest } from '../../../services/soundService';

export default function ReviewerAuthorization() {
  const { id } = useParams();
  const request = requests.find(item => item.id === id);
  const { playHeartbeat } = useSoundEffects();

  useEffect(() => {
    if (request) playHeartbeat(isHighPriorityRequest(request));
  }, [request?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!request) return <Navigate to="/queue" replace/>;

  return <AppLayout><div className="page result"><a className="text-button" href="/queue"><ChevronLeft size={15}/>Back to queue</a><div className="result-top"><div><p className="eyebrow">AUTHORIZATION REVIEW · DEMO DATA</p><h1>Authorization <span>{request.id}</span></h1><p>{request.patient} · {request.service} · Submitted {request.date}</p></div></div><Card><div className="section-title"><div><p className="eyebrow">REQUEST DETAILS</p><h3>{request.service}</h3></div><Badge type={request.tone}>{request.status}</Badge></div><div className="policy-meta"><span><b>Request ID</b>{request.id}</span><span><b>Patient</b>{request.patient}</span><span><b>Diagnosis</b>{request.diagnosis}</span><span><b>Requested service</b>{request.service}</span><span><b>Policy</b>{request.policy || request.policyName || 'Not specified'}</span><span><b>AI recommendation</b>{request.prediction}</span><span><b>Confidence</b>{request.confidence}</span><span><b>Submitted date</b>{request.date}</span></div></Card><Card><div className="section-title"><div><p className="eyebrow">EVIDENCE</p><h3>Supporting documents</h3></div><FileText size={18}/></div>{request.documents?.length ? request.documents.map(([name, status]) => <div className="doc-row" key={name}><div className="doc-icon"><FileText size={19}/></div><div><strong>{name}</strong><small>{request.id} · {request.patient}</small></div><Badge type={status === 'Missing' ? 'amber' : 'green'}>{status}</Badge></div>) : <p className="body-copy">No supporting documents are attached to this request.</p>}</Card></div></AppLayout>;
}