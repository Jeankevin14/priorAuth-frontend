import { ArrowRight, CheckCircle2, ClipboardCheck, FileSearch, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../landing.css';

const trustPoints = [
  { icon: ShieldCheck, title: 'Human-led decisions', detail: 'AI recommendations never override reviewer action.' },
  { icon: ClipboardCheck, title: 'Traceable evidence', detail: 'Policy, document, and decision activity is auditable.' },
  { icon: HeartPulse, title: 'Designed for care teams', detail: 'Clear workflows for providers and reviewers.' }
];

export default function Landing() {
  return <div className="landing">
    <header className="landing-nav"><div className="brand"><span className="brand-mark"><HeartPulse size={20}/></span><span>PROAUTH <b>AI</b></span></div><Link to="/login" className="landing-login">Sign in <ArrowRight size={15}/></Link></header>
    <main className="landing-main"><section className="landing-hero"><div className="landing-copy"><p className="eyebrow">CLINICAL INTELLIGENCE PLATFORM</p><h1>Prior authorization,<br/><em>made transparent.</em></h1><p className="landing-lead">Evidence-backed authorization triage that keeps clinical judgment and final decisions with people.</p><p className="landing-detail">ProAuth AI brings intake, AI/ML triage, policy retrieval, and clinical review into one workspace. Every request is scored against retrieved payer policy and routed to the right reviewer — doctor, nurse, or insurance admin — with each recommendation, evidence citation, and decision logged to a complete audit trail.</p><div className="landing-actions"><Link to="/login" className="landing-primary">Access your workspace <ArrowRight size={17}/></Link><span>Decision support, not autonomous decision-making.</span></div></div><div className="landing-visual"><div className="landing-orbit orbit-a"></div><div className="landing-orbit orbit-b"></div><div className="landing-dot-grid"></div><div className="landing-card card-a"><span className="landing-card-icon"><Sparkles size={18}/></span><div><small>AI triage</small><strong>Evidence prepared</strong></div><CheckCircle2 size={16} className="landing-card-check"/></div><div className="landing-card card-b"><span className="landing-card-icon alt"><FileSearch size={18}/></span><div><small>Policy intelligence</small><strong>Relevant criteria retrieved</strong></div></div></div></section><section className="landing-trust">{trustPoints.map(({ icon: Icon, title, detail }) => <div key={title}><Icon size={20}/><span><strong>{title}</strong><small>{detail}</small></span></div>)}</section></main>
  </div>;
}
