import { Check } from 'lucide-react';

const assurances = [
  ['Human-led workflow', 'Recommendations support qualified reviewers.'],
  ['Permission-aware access', 'Each workspace only contains assigned review tools.']
];

export default function LoginIntro() {
  return <aside className="login-intro"><p className="eyebrow">CLINICAL OPERATIONS</p><h1>Decisions with a clearer trail.</h1><p>Access a workspace designed around evidence, accountability, and the people responsible for every authorization decision.</p>{assurances.map(([title, text]) => <div className="login-assurance" key={title}><div><Check size={15}/></div><span><strong>{title}</strong><small>{text}</small></span></div>)}</aside>;
}
