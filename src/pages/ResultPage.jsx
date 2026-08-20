import { Navigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { requests } from '../data/requests';
import AuthorizationDetail from '../components/authorization/AuthorizationDetail';

export default function ResultPage() {
  const { id } = useParams();
  const request = requests.find(item => item.id === id);
  if (!request || !request.resultDetail) return <Navigate to="/dashboard" replace />;

  return <AppLayout><div className="page result">
    <div className="crumb">Authorization queue <ChevronRight size={14} /><span> {request.id}</span></div>
    <div className="result-top">
      <div><p className="eyebrow">AI TRIAGE RECOMMENDATION · DEMO DATA</p><h1>Authorization <span>{request.id}</span></h1><p>{request.patient} · {request.service} · Submitted {request.date}</p></div>
      <div className="result-actions"><button className="button">Export summary</button><button className="button primary">Open reviewer workspace <ChevronRight size={16} /></button></div>
    </div>
    <AuthorizationDetail request={request} />
  </div></AppLayout>;
}
