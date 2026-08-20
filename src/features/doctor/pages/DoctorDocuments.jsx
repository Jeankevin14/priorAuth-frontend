import { FileText, UploadCloud } from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { Badge, Card } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { dashboardService } from '../../../services/dashboardService';

export default function DoctorDocuments() {
  const { user } = useAuth();
  const { requests } = dashboardService.getDoctorDashboard(user.id);
  const documents = requests.flatMap(request => (request.documents || []).map(([name, status]) => ({ name, status, request })));

  return <AppLayout><div className="page simple"><h1>Documents</h1><Card>{documents.length ? documents.map(document => <div className="doc-row" key={`${document.request.id}-${document.name}`}><div className="doc-icon"><FileText size={19}/></div><div><strong>{document.name}</strong><small>{document.request.id} · {document.request.patient}</small></div><Badge type={document.status === 'Missing' ? 'amber' : 'green'}>{document.status}</Badge><button className="button compact" type="button"><UploadCloud size={15}/>Upload</button></div>) : <div className="empty"><FileText size={27}/><h3>No documents yet</h3><p>Supporting documents from your authorization requests will appear here.</p></div>}</Card></div></AppLayout>;
}