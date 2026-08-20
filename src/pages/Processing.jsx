import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BrainCircuit, Check, CircleHelp, Clock3, FileText, ShieldCheck } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { requests } from '../data/requests';
import './processing.css';

const TARGET_REQUEST_ID = 'PA-10482';
const TICK_MS = 50;

const evidenceAgents = [
  { key: 'policy', icon: ShieldCheck, name: 'Policy Agent', activity: 'Retrieving applicable coverage policy…', done: 'Policy identified · coverage criteria retrieved', duration: 2200 },
  { key: 'clinical', icon: Activity, name: 'Clinical Agent', activity: 'Evaluating clinical evidence…', done: 'Clinical evidence evaluated', duration: 2700 },
  { key: 'document', icon: FileText, name: 'Document Agent', activity: 'Scanning submitted documents…', done: 'Documents analyzed', duration: 1900 }
];
const reasoningAgent = { key: 'reasoning', icon: BrainCircuit, name: 'Coverage Reasoning Agent', activity: 'Comparing evidence against policy criteria…', done: 'Recommendation synthesized', duration: 2400 };
const REASONING_START = Math.max(...evidenceAgents.map(a => a.duration));
const REVEAL_START = REASONING_START + reasoningAgent.duration;
const REVEAL_COUNT_MS = 900;
const NAVIGATE_AT = REVEAL_START + 1700;

const decisionIcons = { clock: Clock3, check: Check, help: CircleHelp };

function AgentCard({ agent, elapsedMs, startAt = 0, className = '' }) {
  const Icon = agent.icon;
  const localElapsed = elapsedMs - startAt;
  const status = localElapsed < 0 ? 'idle' : localElapsed >= agent.duration ? 'done' : 'running';
  const progress = Math.max(0, Math.min(100, (localElapsed / agent.duration) * 100));
  return <div className={`agent-card ${status} ${className}`}>
    <div className="agent-icon"><Icon size={19} />{status === 'running' && <span className="agent-ring" />}</div>
    <div className="agent-body">
      <div className="agent-heading"><strong>{agent.name}</strong>{status === 'done' && <Check size={13} />}</div>
      <small>{status === 'idle' ? 'Queued' : status === 'done' ? agent.done : agent.activity}</small>
      <div className="agent-bar"><em style={{ width: `${progress}%` }} /></div>
    </div>
  </div>;
}

export default function Processing() {
  const nav = useNavigate();
  const [elapsedMs, setElapsedMs] = useState(0);
  const target = requests.find(r => r.id === TARGET_REQUEST_ID);
  const result = target?.resultDetail;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMs(prev => {
        const next = prev + TICK_MS;
        if (next >= NAVIGATE_AT) {
          clearInterval(interval);
          setTimeout(() => nav(`/request/${TARGET_REQUEST_ID}`), 0);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [nav]);

  const revealed = elapsedMs >= REVEAL_START;
  const revealProgress = Math.max(0, Math.min(1, (elapsedMs - REVEAL_START) / REVEAL_COUNT_MS));
  const targetConfidence = parseInt(target?.confidence) || 0;
  const displayConfidence = Math.round(revealProgress * targetConfidence);
  const RevealIcon = result ? (decisionIcons[result.icon] || Clock3) : Clock3;

  return <AppLayout><div className="processing page">
    <p className="eyebrow">AUTHORIZATION {target?.id}</p>
    <h1>Analyzing your request</h1>
    <p className="lead">Specialized agents are gathering and reasoning over policy, clinical, and document evidence in parallel.</p>

    <div className="agent-pipeline">
      <div className="agent-grid">
        {evidenceAgents.map(agent => <AgentCard key={agent.key} agent={agent} elapsedMs={elapsedMs} />)}
      </div>
      <div className={`pipeline-connector ${elapsedMs >= REASONING_START ? 'active' : ''} ${revealed ? 'done' : ''}`}><span className="connector-dot" /></div>
      <AgentCard agent={reasoningAgent} elapsedMs={elapsedMs} startAt={REASONING_START} className="reasoning-card" />
    </div>

    <p className="safe-note"><ShieldCheck size={16} />This is a decision-support workflow. A qualified reviewer retains final authority.</p>

    {revealed && result && <div className="reveal-overlay"><div className={`reveal-card ${result.reviewBadgeTone}`}>
      <div className="reveal-ring"><RevealIcon size={30} /></div>
      <p className="eyebrow">RECOMMENDATION READY</p>
      <h2>{result.headline}</h2>
      <div className="reveal-confidence"><strong>{displayConfidence}%</strong><span>model confidence</span></div>
    </div></div>}
  </div></AppLayout>;
}
