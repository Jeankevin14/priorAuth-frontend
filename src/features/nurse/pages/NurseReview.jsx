import { CircleHelp, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../components/layout/AppLayout';
import { Badge, Card } from '../../../components/ui';
import { dashboardService } from '../../../services/dashboardService';
import '../nurse-review.css';

export default function NurseReview() {
  const navigate = useNavigate();
  const requests = dashboardService.getNurseDashboard().requests;
  const viewPatient = request => navigate(`/patients/${request.patientId || request.id}`);

  return <AppLayout><div className="page queue"><div className="page-heading"><div><h1>Clinical review queue</h1></div></div><Card><div className="section-title"><div><p className="eyebrow">PENDING CLINICAL REVIEW</p><h3>Requests needing attention</h3></div><Badge type="blue">Human review</Badge></div><div className="request-table clinical-review-table"><div className="thead"><span>Request ID</span><span>Patient</span><span>Diagnosis</span><span>Requested Service</span><span>Policy</span><span>ML Prediction</span><span className="confidence-column">Confidence</span><span>Status</span><span>Submitted</span></div>{requests.map(request => <div className="trow" style={{ cursor: 'pointer' }} role="link" tabIndex={0} key={request.id} onClick={() => viewPatient(request)} onKeyDown={event => event.key === 'Enter' && viewPatient(request)}><strong>{request.id}</strong><span className="truncate-cell" title={request.patient}>{request.patient}</span><span className="truncate-cell" title={request.diagnosis}>{request.diagnosis || '—'}</span><span className="truncate-cell" title={request.service}>{request.service}</span><span className="truncate-cell" title={request.policy || request.policyName}>{request.policy || request.policyName || '—'}</span><span><Badge type={request.tone}>{request.prediction || '—'}</Badge></span><span className="confidence-column">{request.confidence || '—'}</span><span><Badge type={request.tone}>{request.status}</Badge></span><small>{request.date}</small></div>)}</div>{requests.length === 0 && <div className="empty"><FileText size={27}/><h3>No requests require review</h3><p>Clinical review items will appear here.</p></div>}</Card><Card className="attention"><div className="section-title"><div><p className="eyebrow">REVIEW GUIDANCE</p><h3>Human-in-the-loop workflow</h3></div><CircleHelp size={18}/></div><p className="body-copy">Review patient context, submitted evidence, policy criteria, and the AI recommendation before requesting information or making a clinical recommendation.</p></Card></div></AppLayout>;
}
