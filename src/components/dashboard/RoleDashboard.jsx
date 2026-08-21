import { lazy, Suspense } from 'react';
import { Activity, ChevronRight, Clock3, FileText, Plus, ShieldCheck, UploadCloud, UserCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import { Badge, Card } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { requests } from '../../data/requests';
import { ReadonlyDashboard as ReadonlyDashboardContent } from '../../pages/ReadonlyViews';
import { dashboardService } from '../../services/dashboardService';

const HeroModel = lazy(() => import('./HeroModel'));
const PolicyDocument3D = lazy(() => import('../policy/PolicyDocument3D'));

function DoctorDashboard({ user }) {
  const navigate = useNavigate();
  const dashboard = dashboardService.getDoctorDashboard(user.id);
  const stats = [
    { label: 'Total requests', value: dashboard.requests.length, note: 'All submitted requests', tone: 'blue', icon: FileText, path: '/doctor/requests' },
    { label: 'Need more information', value: dashboard.moreInformationRequests.length, note: 'Awaiting additional evidence', tone: 'amber', icon: UploadCloud, path: '/doctor/requests/need-information' },
    { label: 'Approved requests', value: dashboard.approvedRequests.length, note: 'Cleared for coverage', tone: 'green', icon: Activity, path: '/doctor/requests/approved' }
  ];
  return <AppLayout><div className="page dashboard"><div className="page-heading doctor-heading"><div><h1>Welcome, {user.name}</h1><a className="button primary" href="/new-authorization"><Plus size={16}/>New authorization</a></div><Suspense fallback={<div className="hero-model"/>}><HeroModel/></Suspense></div><div className="stat-grid doctor-stat-grid">{stats.map(stat => { const activate = () => navigate(stat.path); return <div className="card stat" role="button" tabIndex={0} key={stat.path} onClick={activate} onKeyDown={event => event.key === 'Enter' && activate()}><div><p>{stat.label}</p><h2>{stat.value}</h2><small className={stat.tone}>{stat.note}</small></div><stat.icon/></div>; })}</div><Card className="attention"><div className="section-title"><div><p className="eyebrow">MY PATIENTS</p><h3>Patient authorization status</h3></div><Badge type="blue">{dashboard.patients.length} patients</Badge></div><div className="request-table"><div className="thead" style={{gridTemplateColumns:'1fr 1.4fr 1.4fr .8fr 1.1fr 30px'}}><span>Patient ID</span><span>Patient Name</span><span>Diagnosis</span><span>Active Requests</span><span>Latest Status</span><span>Action</span></div>{dashboard.patients.map(patient => { const activate = () => navigate(`/doctor/patients/${patient.patientId}`); return <div className="trow" style={{gridTemplateColumns:'1fr 1.4fr 1.4fr .8fr 1.1fr 30px', cursor:'pointer'}} role="link" tabIndex="0" onClick={activate} onKeyDown={event => event.key === 'Enter' && activate()} key={patient.patientId}><strong>{patient.patientId}</strong><button className="text-button" type="button" onClick={event => { event.stopPropagation(); activate(); }}>{patient.patient}</button><span>{patient.diagnosis}</span><span>{patient.activeRequests}</span><Badge type={patient.latestStatus === 'Approved' ? 'green' : patient.latestStatus === 'Evidence needed' ? 'amber' : 'blue'}>{patient.latestStatus}</Badge><button className="open" type="button" onClick={event => { event.stopPropagation(); activate(); }}><ChevronRight size={17}/></button></div>; })}</div></Card></div></AppLayout>;
}

function ReviewerDashboard({ user }) {
  const navigate = useNavigate();
  const dashboard = dashboardService.getInsuranceDashboard();
  const stats = [
    { label: 'All requests', value: dashboard.requests.length, note: 'Across all patients', tone: 'blue', icon: FileText, path: '/insurance/requests' },
    { label: 'Automated approval', value: dashboard.automatedApprovals.length, note: 'Approved without manual review', tone: 'green', icon: Zap, path: '/insurance/requests/automated' },
    { label: 'Manual approval', value: dashboard.manualApprovals.length, note: 'Reviewer-confirmed approvals', tone: 'blue', icon: UserCheck, path: '/insurance/requests/manual' },
    { label: 'Pending cases', value: dashboard.pendingCases.length, note: 'Awaiting a final decision', tone: 'amber', icon: Clock3, path: '/queue' }
  ];
  const viewPatient = request => navigate(`/patients/${request.patientId || request.id}`);
  return <AppLayout><div className="page dashboard"><div className="page-heading"><div><h1>Welcome, {user.name}</h1></div><a className="button primary" href="/queue">Open queue <ChevronRight size={16}/></a></div><div className="stat-grid reviewer-stat-grid">{stats.map(stat => { const activate = () => navigate(stat.path); return <div className="card stat" role="button" tabIndex={0} key={stat.path} onClick={activate} onKeyDown={event => event.key === 'Enter' && activate()}><div><p>{stat.label}</p><h2>{stat.value}</h2><small className={stat.tone}>{stat.note}</small></div><stat.icon/></div>; })}</div><Card className="attention"><div className="section-title"><div><p className="eyebrow">POLICY INTELLIGENCE</p><h3>Policy Intelligence</h3></div><Badge type="blue">View only</Badge></div><Suspense fallback={<div style={{minHeight:240}}/>}><PolicyDocument3D/></Suspense></Card><Card className="attention reviewer-activity-card"><div className="section-title"><div><p className="eyebrow">RECENT DECISIONS</p><h3>Authorization activity</h3></div><Badge type="blue">Today</Badge></div><div className="reviewer-activity-list">{requests.map(request => <button className="attention-row" type="button" key={request.id} onClick={() => viewPatient(request)}><div><strong>{request.id} · {request.patient}</strong><small>{request.service}</small></div><Badge type={request.tone}>{request.status}</Badge><ChevronRight size={17}/></button>)}</div></Card></div></AppLayout>;
}

function NurseDashboard({ user }) {
  const navigate = useNavigate();
  const reviewRequests = requests.filter(request => request.prediction === 'Nurse review' || request.status === 'Evidence needed');
  const evidenceNeededCount = requests.filter(request => request.status === 'Evidence needed').length;
  const viewPatient = request => navigate(`/patients/${request.patientId || request.id}`);
  return <AppLayout><div className="page dashboard"><div className="page-heading"><div><h1>Welcome, {user.name}</h1></div><a className="button primary" href="/nurse/review">Open review queue <ChevronRight size={16}/></a></div><div className="stat-grid nurse-stat-grid">{[{ label: 'Pending clinical review', value: reviewRequests.length, note: 'Needs attention', tone: 'amber', icon: Clock3 }, { label: 'Evidence requests', value: evidenceNeededCount, note: 'Awaiting information', tone: 'blue', icon: FileText }].map(stat => { const activate = () => navigate('/nurse/review'); return <div className="card stat" role="button" tabIndex={0} key={stat.label} onClick={activate} onKeyDown={event => event.key === 'Enter' && activate()}><div><p>{stat.label}</p><h2>{stat.value}</h2><small className={stat.tone}>{stat.note}</small></div><stat.icon/></div>; })}</div><Card className="attention"><div className="section-title"><div><p className="eyebrow">CLINICAL REVIEW QUEUE</p><h3>Requests to review</h3></div><Badge type="blue">Human review</Badge></div>{reviewRequests.map(request => <button className="attention-row" type="button" key={request.id} onClick={() => viewPatient(request)}><div><strong>{request.id} · {request.patient}</strong><small>{request.service}</small></div><Badge type={request.tone}>{request.status}</Badge><ChevronRight size={17}/></button>)}</Card></div></AppLayout>;
}

function ReadonlyDashboard({ user }) { return <ReadonlyDashboardContent user={user}/>; }

export default function RoleDashboard() {
  const { user } = useAuth();
  if (user.role === 'doctor') return <DoctorDashboard user={user}/>;
  if (user.role === 'nurse') return <NurseDashboard user={user}/>;
  if (user.role === 'user' || user.role === 'readonly') return <ReadonlyDashboard user={user}/>;
  return <ReviewerDashboard user={user}/>;
}
