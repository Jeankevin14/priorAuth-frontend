import React, { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { Badge, Card } from '../../../components/ui';
import { patientService } from '../../../services/patientService';
import AuthorizationDetail from '../../../components/authorization/AuthorizationDetail';
import { useSoundEffects } from '../../../hooks/useSoundEffects';
import { isHighPriorityRequest } from '../../../services/soundService';

const historyColumns = '.65fr .9fr .85fr 1.55fr .8fr .5fr .75fr .75fr .75fr .4fr';
const defaultTimeline = ['Submitted', 'Under review', 'Decision'];
const finalStatuses = ['Approved', 'Denied', 'Rejected'];

function docTone(status) {
  if (status === 'Missing') return 'amber';
  if (status === 'Evidence check pending') return 'blue';
  return 'green';
}

export default function ReviewerPatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = patientService.getPatientByIdAnyOwner(id);
  const { playHeartbeat } = useSoundEffects();

  useEffect(() => {
    if (patient?.latest) playHeartbeat(isHighPriorityRequest(patient.latest));
  }, [patient?.latest?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!patient) return <Navigate to="/patients" replace/>;

  const latest = patient.latest;
  const documents = [...new Map(patient.requests.flatMap(request => request.documents || []).map(([name, status]) => [name, status])).entries()];
  const timelineSteps = latest.timeline?.length ? latest.timeline : defaultTimeline;
  const currentIndex = finalStatuses.includes(latest.status) ? timelineSteps.length - 1 : Math.max(0, timelineSteps.length - 2);

  return <AppLayout><div className="page simple">
    <a className="text-button" href="/patients"><ChevronLeft size={15}/>Back to Patients</a>
    <div className="page-heading"><div><p className="eyebrow">PATIENT REVIEW PROFILE</p><h1>{patient.patient}</h1><p>Patient context and authorization requests under review.</p></div><Badge type="blue">{patient.activeRequests} request{patient.activeRequests === 1 ? '' : 's'}</Badge></div>

    <Card><div className="section-title"><div><p className="eyebrow">PATIENT OVERVIEW</p><h3>{patient.patient}</h3></div><Badge type={patient.tone}>{patient.latestStatus}</Badge></div>
      <div className="policy-meta"><span><b>Patient ID</b>{patient.patientId}</span><span><b>Date of birth</b>{patient.dateOfBirth || 'Not provided'}</span><span><b>Age</b>{patient.age || 'Not provided'}</span><span><b>Sex</b>{patient.sex || 'Not provided'}</span></div>
      <div className="policy-meta"><span><b>Insurance provider</b>{patient.insuranceProvider || 'Not provided'}</span><span><b>Insurance plan</b>{patient.planName || 'Not provided'}</span><span><b>Member ID</b>{patient.memberId || 'Not provided'}</span></div>
    </Card>

    <Card><div className="section-title"><div><p className="eyebrow">CLINICAL SUMMARY</p><h3>Diagnosis & history</h3></div></div>
      <div className="policy-meta"><span><b>Primary diagnosis</b>{latest.diagnosis || 'Not specified'}</span><span><b>ICD-10</b>{latest.icd10 || 'Not provided'}</span><span><b>Secondary diagnoses</b>{latest.secondaryDiagnoses || 'None reported'}</span></div>
      <p className="body-copy">{latest.clinicalHistory || 'No clinical history documented for this request.'}</p>
      <p className="hint">Current medications, previous procedures, and clinical observations are not captured in this demo dataset.</p>
    </Card>

    <div className="section-title patient-section-label"><div><p className="eyebrow">LATEST AI RECOMMENDATION</p><h3>{latest.id} · {latest.service}</h3></div></div>
    {latest.resultDetail ? <AuthorizationDetail request={latest}/> : <Card><p className="body-copy">AI triage detail is not available for this request yet.</p></Card>}

    <Card className="auth-history-card"><div className="section-title"><div><p className="eyebrow">AUTHORIZATION HISTORY</p><h3>All submitted requests</h3></div><FileText size={18}/></div>
      <div className="request-table"><div className="thead" style={{ gridTemplateColumns: historyColumns }}><span>Request ID</span><span>Requested Service</span><span>Diagnosis</span><span>Policy</span><span>AI Recommendation</span><span>Confidence</span><span>Status</span><span>Submitted</span><span>Last Updated</span><span>Action</span></div>
        {patient.requests.map(request => <div className="trow" style={{ gridTemplateColumns: historyColumns }} key={request.id}><strong>{request.id}</strong><span>{request.service}</span><span>{request.diagnosis}</span><span>{request.policyName || request.policy || 'Not specified'}</span><span>{request.prediction || '—'}</span><span>{request.confidence || '—'}</span><Badge type={request.tone}>{request.status}</Badge><small>{request.date}</small><small>{request.lastUpdated || request.date}</small><button className="open" type="button" onClick={() => navigate(`/request/${request.id}`)}><ChevronRight size={17}/></button></div>)}
      </div>
    </Card>

    <Card><div className="section-title"><div><p className="eyebrow">DOCUMENTS</p><h3>Supporting documents</h3></div></div>
      {documents.length > 0 ? documents.map(([name, status]) => <div className="doc-row" key={name}><div className="doc-icon"><FileText size={19}/></div><div><strong>{name}</strong></div><Badge type={docTone(status)}>{status}</Badge></div>) : <div className="empty"><FileText size={27}/><h3>No documents</h3><p>Documents attached to this patient's requests will appear here.</p></div>}
    </Card>

    <Card><div className="section-title"><div><p className="eyebrow">TIMELINE</p><h3>Latest request progress</h3></div></div>
      <div className="flow">{timelineSteps.map((step, index) => <React.Fragment key={step}><div className={`flow-step ${index === currentIndex ? 'current' : ''}`}><span>{index < currentIndex ? <Check size={14}/> : index + 1}</span><label>{step}</label></div>{index < timelineSteps.length - 1 && <div className={`flow-line ${index < currentIndex ? 'filled' : ''}`}/>}</React.Fragment>)}</div>
    </Card>
  </div></AppLayout>;
}
