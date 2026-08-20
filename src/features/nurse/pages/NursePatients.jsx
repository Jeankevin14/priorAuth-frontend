import { ChevronRight, Users } from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { Badge, Card } from '../../../components/ui';
import { dashboardService } from '../../../services/dashboardService';

export function getNursePatients() {
  const { requests } = dashboardService.getNurseDashboard();
  return [...new Map(requests.map(request => [request.patient, request])).values()].map(patientRequest => ({
    patientId: patientRequest.patientId || patientRequest.id,
    patient: patientRequest.patient,
    diagnosis: patientRequest.diagnosis,
    activeRequests: requests.filter(request => request.patient === patientRequest.patient).length,
    latestStatus: requests.filter(request => request.patient === patientRequest.patient).at(-1)?.status || patientRequest.status
  }));
}

export default function NursePatients() {
  const patients = getNursePatients();
  return <AppLayout><div className="page simple"><h1>Patients</h1><Card><div className="section-title"><div><p className="eyebrow">PATIENT REVIEW STATUS</p><h3>Patients needing attention</h3></div><Badge type="blue">{patients.length} patients</Badge></div><div className="request-table"><div className="thead" style={{gridTemplateColumns:'1fr 1.5fr 1.5fr .9fr 1.2fr 30px'}}><span>Patient ID</span><span>Patient</span><span>Diagnosis</span><span>Requests</span><span>Latest status</span><span>Action</span></div>{patients.map(patient => <button className="trow" style={{gridTemplateColumns:'1fr 1.5fr 1.5fr .9fr 1.2fr 30px', width:'100%', border:0, textAlign:'left', cursor:'pointer'}} type="button" key={patient.patientId} onClick={() => location.href=`/patients/${patient.patientId}`}><strong>{patient.patientId}</strong><span>{patient.patient}</span><span>{patient.diagnosis}</span><span>{patient.activeRequests}</span><Badge type={patient.latestStatus === 'Evidence needed' ? 'amber' : 'blue'}>{patient.latestStatus}</Badge><ChevronRight size={17}/></button>)}</div>{patients.length === 0 && <div className="empty"><Users size={27}/><h3>No patients require review</h3><p>Patients connected to clinical review requests will appear here.</p></div>}</Card></div></AppLayout>;
}