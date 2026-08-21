import { useEffect, useState } from 'react';
import { Activity, Clock3, UserCheck, Users, Zap } from 'lucide-react';
import { Badge, Card } from '../components/ui';
import { StatCard } from '../components/dashboard/DashboardWidgets';
import { dashboardService } from '../services/dashboardService';
import SimplePage from './SimplePage';
import './analytics.css';

const volumeData = [
  { day: 'Mon', count: 4 }, { day: 'Tue', count: 7 }, { day: 'Wed', count: 5 }, { day: 'Thu', count: 8 },
  { day: 'Fri', count: 7 }, { day: 'Sat', count: 9 }, { day: 'Sun', count: 8 }
];

function VolumeBar() {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [mounted, setMounted] = useState(false);
  const max = Math.max(...volumeData.map(d => d.count));
  useEffect(() => { const timer = setTimeout(() => setMounted(true), 60); return () => clearTimeout(timer); }, []);

  return <div className="bars enhanced-bars">{volumeData.map((d, i) => <div key={d.day} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
    {hoverIndex === i && <div className="chart-tooltip">{d.count} request{d.count === 1 ? '' : 's'}</div>}
    <i className={hoverIndex === i ? 'active' : ''} style={{ height: mounted ? `${(d.count / max) * 100}%` : '0%', transitionDelay: `${i * 40}ms` }}/>
    <span>{d.day}</span>
  </div>)}</div>;
}

function AutomatedGauge({ automated, total }) {
  const pct = total ? Math.round((automated / total) * 100) : 0;
  const [animatedPct, setAnimatedPct] = useState(0);
  const [hover, setHover] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setAnimatedPct(pct), 80); return () => clearTimeout(timer); }, [pct]);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return <div className="gauge-wrap" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
    <svg className="gauge-svg" viewBox="0 0 130 130">
      <circle className="gauge-track" cx="65" cy="65" r={radius}/>
      <circle className="gauge-progress" cx="65" cy="65" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - animatedPct / 100)}/>
    </svg>
    <div className="gauge-center"><strong>{automated}</strong><span>Automated</span></div>
    {hover && <div className="chart-tooltip gauge-tooltip">{automated} of {total} approvals · {pct}%</div>}
  </div>;
}

function ManualWaffle({ manual, total }) {
  const pct = total ? Math.round((manual / total) * 100) : 0;
  const filled = Math.round(pct / 10);
  const [hoverIndex, setHoverIndex] = useState(null);

  return <div className="waffle-wrap">
    <div className="waffle-grid">{Array.from({ length: 10 }, (_, i) => <div key={i} className={`waffle-cell ${i < filled ? 'filled' : ''}`} style={{ animationDelay: `${i * 35}ms` }} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}><UserCheck size={14}/></div>)}</div>
    <div className="waffle-legend">{hoverIndex !== null ? <span>Each square represents 10% of approvals</span> : <span><strong>{manual}</strong> of {total} approvals were manually reviewed · {pct}%</span>}</div>
  </div>;
}

export default function Analytics() {
  const dashboard = dashboardService.getInsuranceDashboard();
  const automated = dashboard.automatedApprovals.length;
  const manual = dashboard.manualApprovals.length;
  const totalApproved = automated + manual;

  return <SimplePage title="Authorization analytics" subtitle="Operational patterns across your authorization workflow.">
    <div className="analytics-grid">
      <StatCard label="Approval rate" value="61.8%" delta="+4.2%" tone="green" icon={<Activity/>}/>
      <StatCard label="Avg. processing" value="4m 12s" delta="-38s" tone="blue" icon={<Clock3/>}/>
      <StatCard label="Human override" value="7.2%" delta="Within target" tone="green" icon={<Users/>}/>
      <Card className="chart">
        <div className="section-title"><h3>Authorization volume</h3><Badge>Last 7 days</Badge></div>
        <VolumeBar/>
      </Card>
    </div>
    <div className="split-charts">
      <Card className="split-chart-card">
        <div className="section-title"><div><p className="eyebrow">STRAIGHT-THROUGH PROCESSING</p><h3>Automated approval</h3></div><Badge type="green"><Zap size={11}/>Automated</Badge></div>
        <AutomatedGauge automated={automated} total={totalApproved}/>
      </Card>
      <Card className="split-chart-card">
        <div className="section-title"><div><p className="eyebrow">HUMAN-IN-THE-LOOP</p><h3>Manual approval</h3></div><Badge type="blue"><UserCheck size={11}/>Reviewer-confirmed</Badge></div>
        <ManualWaffle manual={manual} total={totalApproved}/>
      </Card>
    </div>
  </SimplePage>;
}
