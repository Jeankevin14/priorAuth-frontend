import { Navigate, useParams } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { Badge, Card } from '../../../components/ui';
import { dashboardService } from '../../../services/dashboardService';

export default function NursePatientDetail() {
  const { id } = useParams();
  const { requests } = dashboardService.getNurseDashboard();
  const patientRequests = requests.filter(request => (request.patientId || request.id) === id || request.patient === id);
  const patient = patientRequests[0];
  if (!patient) return <Navigate to="/patients" replace/>;

  return <AppLayout><div className="page simple"><a className="text-button" href="/patients"><ChevronLeft size={15}/>Back to patients</a><div className="page-heading"><div><p className="eyebrow">PATIENT REVIEW PROFILE</p><h1>{patient.patient}</h1><p>Clinical review context and request history.</p></div><Badge type="blue">{patientRequests.length} request{patientRequests.length === 1 ? '' : 's'}</Badge></div><Card><div className="section-title"><div><p className="eyebrow">PATIENT DETAILS</p><h3>{patient.patient}</h3></div><Badge type={patient.tone}>{patient.status}</Badge></div><div className="policy-meta"><span><b>Patient ID</b>{patient.patientId || patient.id}</span><span><b>Diagnosis</b>{patient.diagnosis}</span><span><b>Requested service</b>{patient.service}</span><span><b>Latest submitted</b>{patient.date}</span></div></Card><Card><div className="section-title"><div><p className="eyebrow">CLINICAL REVIEW REQUESTS</p><h3>Request history</h3></div><FileText size={18}/></div>{patientRequests.map(request => <div className="attention-row" key={request.id}><div><strong>{request.id}</strong><small>{request.service} · {request.diagnosis}</small></div><Badge type={request.tone}>{request.status}</Badge><span>{request.prediction}</span></div>)}</Card></div></AppLayout>;
}