import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BrainCircuit, Check, CircleHelp, Clock3, FileText, ShieldCheck } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { requests } from '../data/requests';
import { useSoundEffects } from '../hooks/useSoundEffects';
import './processing.css';

const DEFAULT_REQUEST_ID = 'PA-10482';
const TICK_MS = 50;

const evidenceAgents = [
  { key: 'policy', icon: ShieldCheck, name: 'Policy Agent', short: 'Policy', angle: 'top', activity: 'Retrieving applicable coverage policy…', done: 'Policy identified · coverage criteria retrieved', duration: 2200 },
  { key: 'clinical', icon: Activity, name: 'Clinical Agent', short: 'Clinical', angle: 'right', activity: 'Evaluating clinical evidence…', done: 'Clinical evidence evaluated', duration: 2700 },
  { key: 'document', icon: FileText, name: 'Document Agent', short: 'Document', angle: 'left', activity: 'Scanning submitted documents…', done: 'Documents analyzed', duration: 1900 }
];
const reasoningAgent = { key: 'reasoning', icon: BrainCircuit, name: 'Coverage Reasoning Agent', short: 'Reasoning', activity: 'Comparing evidence against policy criteria…', done: 'Recommendation synthesized', duration: 2400 };
const REASONING_START = Math.max(...evidenceAgents.map(a => a.duration));
const REVEAL_START = REASONING_START + reasoningAgent.duration;
const REVEAL_COUNT_MS = 900;
const NAVIGATE_AT = REVEAL_START + 1700;

const decisionIcons = { clock: Clock3, check: Check, help: CircleHelp };

// SVG-unit coordinates (0-360 viewBox) for the three orbit nodes around the center hub at (180,180).
const NODE_COORDS = { top: [180, 62], right: [282, 239], left: [78, 239] };
const RING_R = 160;
const RING_C = 2 * Math.PI * RING_R;
const pct = v => `${(v / 3.6).toFixed(2)}%`;

function agentStatus(agent, elapsedMs, startAt = 0) {
  const localElapsed = elapsedMs - startAt;
  const status = localElapsed < 0 ? 'idle' : localElapsed >= agent.duration ? 'done' : 'running';
  const progress = Math.max(0, Math.min(100, (localElapsed / agent.duration) * 100));
  return { status, progress };
}

function OrbitNode({ agent, elapsedMs }) {
  const Icon = agent.icon;
  const { status } = agentStatus(agent, elapsedMs);
  const [x, y] = NODE_COORDS[agent.angle];
  return <div className="orbit-node" style={{ left: pct(x), top: pct(y) }}>
    <div className={`orbit-node-icon ${status}`}>
      <Icon size={22} />
      {status === 'running' && <span className="orbit-ring" />}
      {status === 'done' && <span className="node-check"><Check size={9} /></span>}
    </div>
    <span className="orbit-node-label">{agent.short}</span>
  </div>;
}

function StatusRow({ agent, elapsedMs, startAt = 0 }) {
  const Icon = agent.icon;
  const { status, progress } = agentStatus(agent, elapsedMs, startAt);
  return <div className={`pstatus-row ${status}`}>
    <div className="pstatus-icon"><Icon size={15} />{status === 'done' && <span className="pstatus-check"><Check size={8} /></span>}</div>
    <div className="pstatus-body">
      <strong>{agent.name}</strong>
      <small>{status === 'idle' ? 'Queued' : status === 'done' ? agent.done : agent.activity}</small>
    </div>
    <div className="pstatus-bar"><em style={{ width: `${progress}%` }} /></div>
  </div>;
}

export default function Processing({ requestId = DEFAULT_REQUEST_ID }) {
  const nav = useNavigate();
  const [elapsedMs, setElapsedMs] = useState(0);
  const target = requests.find(r => r.id === requestId);
  const result = target?.resultDetail;
  const { playSuccess, playAlert, playReview } = useSoundEffects();
  const revealSoundPlayed = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMs(prev => {
        const next = prev + TICK_MS;
        if (next >= NAVIGATE_AT) {
          clearInterval(interval);
          setTimeout(() => nav(`/request/${requestId}`), 0);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [nav, requestId]);

  const revealed = elapsedMs >= REVEAL_START;
  const revealProgress = Math.max(0, Math.min(1, (elapsedMs - REVEAL_START) / REVEAL_COUNT_MS));
  const targetConfidence = parseInt(target?.confidence) || 0;
  const displayConfidence = Math.round(revealProgress * targetConfidence);
  const RevealIcon = result ? (decisionIcons[result.icon] || Clock3) : Clock3;
  const overallProgress = Math.max(0, Math.min(1, elapsedMs / NAVIGATE_AT));
  const coreStatus = agentStatus(reasoningAgent, elapsedMs, REASONING_START).status;
  const showResult = revealed && Boolean(result);
  const CoreIcon = showResult ? RevealIcon : BrainCircuit;

  useEffect(() => {
    if (!showResult || revealSoundPlayed.current) return;
    revealSoundPlayed.current = true;
    if (target?.prediction === 'Approve') playSuccess();
    else if (target?.prediction === 'More information') playAlert();
    else if (target?.prediction === 'Nurse review') playReview();
  }, [showResult, target?.prediction, playSuccess, playAlert, playReview]);

  return <AppLayout><div className="processing page orbit-page">
    <p className="eyebrow">AUTHORIZATION {target?.id}</p>
    <h1>Analyzing your request</h1>
    <p className="lead">Four specialized agents gather and reason over policy, clinical, and document evidence — then converge on a recommendation.</p>

    <div className="orbit-stage">
      <svg className="orbit-svg" viewBox="0 0 360 360">
        <defs>
          <linearGradient id="orbitGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4b9b95" />
            <stop offset="100%" stopColor="#2e70ad" />
          </linearGradient>
        </defs>
        <circle className="orbit-track" cx="180" cy="180" r={RING_R} />
        <circle className="orbit-progress" cx="180" cy="180" r={RING_R}
          strokeDasharray={RING_C} strokeDashoffset={RING_C * (1 - overallProgress)} />
        {evidenceAgents.map(agent => {
          const { status } = agentStatus(agent, elapsedMs);
          const [x, y] = NODE_COORDS[agent.angle];
          return <line key={agent.key} className={`orbit-line ${status}`} x1="180" y1="180" x2={x} y2={y} />;
        })}
      </svg>

      {evidenceAgents.map(agent => <OrbitNode key={agent.key} agent={agent} elapsedMs={elapsedMs} />)}

      <div className={`orbit-core ${coreStatus} ${showResult ? `revealed ${result.reviewBadgeTone}` : ''}`}>
        <CoreIcon size={showResult ? 28 : 24} />
        {coreStatus === 'running' && !showResult && <span className="orbit-ring core-ring" />}
        {showResult && <strong className="orbit-confidence">{displayConfidence}%</strong>}
      </div>
    </div>

    {showResult && <div className="orbit-result">
      <p className="eyebrow">RECOMMENDATION READY</p>
      <h2>{result.headline}</h2>
    </div>}

    <div className="pstatus-list">
      {evidenceAgents.map(agent => <StatusRow key={agent.key} agent={agent} elapsedMs={elapsedMs} />)}
      <StatusRow agent={reasoningAgent} elapsedMs={elapsedMs} startAt={REASONING_START} />
    </div>

    <p className="safe-note"><ShieldCheck size={16} />This is a decision-support workflow. A qualified reviewer retains final authority.</p>
  </div></AppLayout>;
}
