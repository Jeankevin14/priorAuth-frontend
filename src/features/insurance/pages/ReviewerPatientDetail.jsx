import { Navigate, useParams } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { Badge, Card } from '../../../components/ui';
import { requests } from '../../../data/requests';

export default function ReviewerPatientDetail() {
  const { id } = useParams();
  const patientRequests = requests.filter(request => (request.patientId || request.id) === id);
  const patient = patientRequests[0];
  if (!patient) return <Navigate to="/queue" replace/>;

  return <AppLayout><div className="page simple"><a className="text-button" href="/queue"><ChevronLeft size={15}/>Back to queue</a><div className="page-heading"><div><p className="eyebrow">PATIENT REVIEW PROFILE</p><h1>{patient.patient}</h1><p>Patient context and authorization requests under review.</p></div><Badge type="blue">{patientRequests.length} request{patientRequests.length === 1 ? '' : 's'}</Badge></div><Card><div className="section-title"><div><p className="eyebrow">PATIENT DETAILS</p><h3>{patient.patient}</h3></div><Badge type={patient.tone}>{patient.status}</Badge></div><div className="policy-meta"><span><b>Patient ID</b>{patient.patientId || patient.id}</span><span><b>Diagnosis</b>{patient.diagnosis}</span><span><b>Requested service</b>{patient.service}</span><span><b>Submitted date</b>{patient.date}</span></div></Card><Card><div className="section-title"><div><p className="eyebrow">AUTHORIZATION REQUESTS</p><h3>Request history</h3></div><FileText size={18}/></div>{patientRequests.map(request => <div className="attention-row" key={request.id}><div><strong>{request.id}</strong><small>{request.service} · {request.date}</small></div><Badge type={request.tone}>{request.status}</Badge><span>{request.prediction}</span></div>)}</Card></div></AppLayout>;
}