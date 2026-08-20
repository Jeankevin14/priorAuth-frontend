import { ChevronRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../components/layout/AppLayout';
import { Badge, Card } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { dashboardService } from '../../../services/dashboardService';

const columns = '.8fr 1.3fr .45fr .5fr 1.3fr .8fr 1fr .95fr 1fr';

export default function DoctorPatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { patients } = dashboardService.getDoctorDashboard(user.id);

  return <AppLayout><div className="page simple"><h1>Patients</h1><Card><div className="section-title"><div><p className="eyebrow">MY PATIENTS</p><h3>Patient authorization status</h3></div><Badge type="blue">{patients.length} patients</Badge></div><div className="request-table"><div className="thead" style={{ gridTemplateColumns: columns }}><span>Patient ID</span><span>Patient Name</span><span>Age</span><span>Sex</span><span>Primary Diagnosis</span><span>Active Requests</span><span>Latest Status</span><span>Last Updated</span><span>Action</span></div>{patients.map(patient => { const activate = () => navigate(`/doctor/patients/${patient.patientId}`); return <div className="trow" style={{ gridTemplateColumns: columns, cursor: 'pointer' }} role="link" tabIndex={0} key={patient.patientId} onClick={activate} onKeyDown={event => event.key === 'Enter' && activate()}><strong>{patient.patientId}</strong><span>{patient.patient}</span><span>{patient.age || '—'}</span><span>{patient.sex || '—'}</span><span>{patient.diagnosis}</span><span>{patient.activeRequests}</span><Badge type={patient.latestStatus === 'Approved' ? 'green' : patient.latestStatus === 'Evidence needed' ? 'amber' : 'blue'}>{patient.latestStatus}</Badge><span>{patient.lastUpdated}</span><button className="text-button" type="button" onClick={event => { event.stopPropagation(); activate(); }}>View Patient <ChevronRight size={14}/></button></div>; })}</div>{patients.length === 0 && <div className="empty"><Users size={27}/><h3>No patients yet</h3><p>Patients from your authorization requests will appear here.</p></div>}</Card></div></AppLayout>;
}
