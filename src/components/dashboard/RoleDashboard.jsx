import { lazy, Suspense } from 'react';
import { Check, ChevronRight, Clock3, FileText, Plus, ShieldCheck } from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { Badge, Card } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { requests } from '../../data/requests';
import { ReadonlyDashboard as ReadonlyDashboardContent } from '../../pages/ReadonlyViews';
import { dashboardService } from '../../services/dashboardService';
import PolicyDocument3D from '../policy/PolicyDocument3D';

const HeroModel = lazy(() => import('./HeroModel'));

function DoctorDashboard({ user }) {
  const dashboard = dashboardService.getDoctorDashboard(user.id);
  return <AppLayout><div className="page dashboard"><div className="page-heading doctor-heading"><div><h1>Welcome, {user.name}</h1><a className="button primary" href="/new-authorization"><Plus size={16}/>New authorization</a></div><Suspense fallback={<div className="hero-model"/>}><HeroModel/></Suspense></div><Card className="attention"><div className="section-title"><div><p className="eyebrow">MY PATIENTS</p><h3>Patient authorization status</h3></div><Badge type="blue">{dashboard.patients.length} patients</Badge></div><div className="request-table"><div className="thead" style={{gridTemplateColumns:'1fr 1.4fr 1.4fr .8fr 1.1fr 30px'}}><span>Patient ID</span><span>Patient Name</span><span>Diagnosis</span><span>Active Requests</span><span>Latest Status</span><span>Action</span></div>{dashboard.patients.map(patient => <div className="trow" style={{gridTemplateColumns:'1fr 1.4fr 1.4fr .8fr 1.1fr 30px', cursor:'pointer'}} role="link" tabIndex="0" onClick={() => location.href=`/patients/${patient.patientId}`} onKeyDown={event => event.key === 'Enter' && (location.href=`/patients/${patient.patientId}`)} key={patient.patientId}><strong>{patient.patientId}</strong><button className="text-button" type="button" onClick={event => { event.stopPropagation(); location.href=`/patients/${patient.patientId}`; }}>{patient.patient}</button><span>{patient.diagnosis}</span><span>{patient.activeRequests}</span><Badge type={patient.latestStatus === 'Approved' ? 'green' : patient.latestStatus === 'Evidence needed' ? 'amber' : 'blue'}>{patient.latestStatus}</Badge><button className="open" type="button" onClick={event => { event.stopPropagation(); location.href=`/patients/${patient.patientId}`; }}><ChevronRight size={17}/></button></div>)}</div></Card></div></AppLayout>;
}

function ReviewerDashboard({ user }) {
  return <AppLayout><div className="page dashboard"><div className="page-heading"><div><h1>Welcome, {user.name}</h1></div><a className="button primary" href="/queue">Open queue <ChevronRight size={16}/></a></div><div className="stat-grid"><div className="card stat"><div><p>Requests reviewed</p><h2>128</h2><small className="blue">+12.4%</small></div><FileText/></div><div className="card stat"><div><p>Approved</p><h2>76</h2><small className="green">59.4% rate</small></div><Check/></div><div className="card stat"><div><p>Pending review</p><h2>31</h2><small className="amber">6 urgent</small></div><Clock3/></div></div><Card className="attention"><div className="section-title"><div><p className="eyebrow">POLICY INTELLIGENCE</p><h3>Policy Intelligence</h3></div><Badge type="blue">View only</Badge></div><PolicyDocument3D/></Card><Card className="attention reviewer-activity-card"><div className="section-title"><div><p className="eyebrow">RECENT DECISIONS</p><h3>Authorization activity</h3></div><Badge type="blue">Today</Badge></div><div className="reviewer-activity-list">{requests.map(request => <button className="attention-row" type="button" key={request.id} onClick={() => location.href=`/request/${request.id}`}><div><strong>{request.id} · {request.patient}</strong><small>{request.service}</small></div><Badge type={request.tone}>{request.status}</Badge><ChevronRight size={17}/></button>)}</div></Card></div></AppLayout>;
}

function NurseDashboard({ user }) {
  const reviewRequests = requests.filter(request => request.prediction === 'Nurse review' || request.status === 'Evidence needed');
  return <AppLayout><div className="page dashboard"><div className="page-heading"><div><h1>Welcome, {user.name}</h1></div><a className="button primary" href="/nurse/review">Open review queue <ChevronRight size={16}/></a></div><div className="stat-grid nurse-stat-grid"><div className="card stat"><div><p>Pending clinical review</p><h2>{reviewRequests.length}</h2><small className="amber">Needs attention</small></div><Clock3/></div><div className="card stat"><div><p>Evidence requests</p><h2>1</h2><small className="blue">Awaiting information</small></div><FileText/></div></div><Card className="attention"><div className="section-title"><div><p className="eyebrow">CLINICAL REVIEW QUEUE</p><h3>Requests to review</h3></div><Badge type="blue">Human review</Badge></div>{reviewRequests.map(request => <div className="attention-row" key={request.id}><div><strong>{request.id} · {request.patient}</strong><small>{request.service}</small></div><Badge type={request.tone}>{request.status}</Badge><ChevronRight size={17}/></div>)}</Card></div></AppLayout>;
}

function ReadonlyDashboard({ user }) { return <ReadonlyDashboardContent user={user}/>; }

export default function RoleDashboard() {
  const { user } = useAuth();
  if (user.role === 'doctor') return <DoctorDashboard user={user}/>;
  if (user.role === 'nurse') return <NurseDashboard user={user}/>;
  if (user.role === 'user' || user.role === 'readonly') return <ReadonlyDashboard user={user}/>;
  return <ReviewerDashboard user={user}/>;
}
