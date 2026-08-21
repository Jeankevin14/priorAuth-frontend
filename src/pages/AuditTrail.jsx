import { useState } from 'react';
import { Check, CircleHelp, Clock3, Download, UserCheck, Zap } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { Badge, Card } from '../components/ui';
import { dashboardService } from '../services/dashboardService';

const csvColumns = ['Request ID', 'Patient', 'Diagnosis', 'Service', 'AI Recommendation', 'Confidence', 'Status', 'Submitted'];

function toCsvRow(request) {
  return [request.id, request.patient, request.diagnosis, request.service, request.prediction || '', request.confidence || '', request.status, request.date];
}

function downloadCsv(filename, requestList) {
  const rows = [csvColumns, ...requestList.map(toCsvRow)];
  const csv = rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function eventFor(request) {
  if (request.approvalType === 'automated') return { icon: Zap, tone: 'green', text: `Automatically approved · ${request.confidence} confidence` };
  if (request.approvalType === 'manual') return { icon: UserCheck, tone: 'blue', text: `Manually approved by reviewer · ${request.confidence} confidence` };
  if (request.status === 'Evidence needed') return { icon: CircleHelp, tone: 'amber', text: 'Additional evidence requested from provider' };
  return { icon: Clock3, tone: 'blue', text: `AI triage recommended ${(request.prediction || 'review').toLowerCase()} · ${request.confidence || '—'} confidence` };
}

export default function AuditTrail() {
  const dashboard = dashboardService.getInsuranceDashboard();
  const [downloadState, setDownloadState] = useState({});

  const categories = [
    { key: 'automated', label: 'Automated Approved', icon: Zap, tone: 'green', requests: dashboard.automatedApprovals, filename: 'automated-approved-requests.csv' },
    { key: 'manual', label: 'Manual Approval', icon: UserCheck, tone: 'blue', requests: dashboard.manualApprovals, filename: 'manual-approval-requests.csv' },
    { key: 'pending', label: 'Pending', icon: Clock3, tone: 'amber', requests: dashboard.pendingCases, filename: 'pending-requests.csv' }
  ];

  const handleDownload = category => {
    setDownloadState(prev => ({ ...prev, [category.key]: 'preparing' }));
    setTimeout(() => {
      downloadCsv(category.filename, category.requests);
      setDownloadState(prev => ({ ...prev, [category.key]: 'done' }));
      setTimeout(() => setDownloadState(prev => ({ ...prev, [category.key]: 'idle' })), 1400);
    }, 650);
  };

  return <AppLayout><div className="page simple">
    <h1>Audit trail</h1>
    <p className="lead">A transparent event record for every authorization.</p>

    <Card><div className="section-title"><div><p className="eyebrow">EVENT LOG</p><h3>Authorization activity</h3></div><Badge type="blue">{dashboard.requests.length} events</Badge></div>
      {dashboard.requests.map(request => { const event = eventFor(request); const EventIcon = event.icon; return <div className="attention-row" key={request.id}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <div className={`mini-avatar ${event.tone}`}><EventIcon size={14}/></div>
          <div><strong>{request.id} · {request.patient}</strong><small>{event.text}</small></div>
        </div>
        <Badge type={request.tone}>{request.status}</Badge>
        <small>{request.lastUpdated || request.date}</small>
      </div>; })}
    </Card>

    <Card><div className="section-title"><div><p className="eyebrow">EXPORT</p><h3>Download requests</h3></div></div>
      <p className="body-copy">Export authorization records grouped by decision pathway.</p>
      <div className="download-grid">{categories.map(category => {
        const state = downloadState[category.key] || 'idle';
        const Icon = category.icon;
        return <div className={`download-card ${state}`} key={category.key}>
          <div className={`download-icon ${category.tone}`}>
            {state === 'preparing' ? <span className="download-spinner"/> : state === 'done' ? <span className="download-check"><Check size={18}/></span> : <Icon size={18}/>}
          </div>
          <div className="download-body"><strong>{category.label}</strong><small>{category.requests.length} request{category.requests.length === 1 ? '' : 's'}</small></div>
          <button className="button compact" type="button" disabled={state !== 'idle'} onClick={() => handleDownload(category)}>
            {state === 'preparing' ? 'Preparing…' : state === 'done' ? 'Downloaded' : <><Download size={14}/>CSV</>}
          </button>
        </div>;
      })}</div>
    </Card>
  </div></AppLayout>;
}
