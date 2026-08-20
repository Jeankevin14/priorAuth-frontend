import { useState } from 'react';
import { ArrowRight, Check, ClipboardCheck, Eye, HeartPulse, KeyRound, ShieldCheck, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const roles = [
  { id: 'doctor', label: 'Doctor', detail: 'Submit and track patient authorizations.', icon: Stethoscope },
  { id: 'nurse', label: 'Nurse', detail: 'Review clinical evidence and requests.', icon: ClipboardCheck },
  { id: 'insurance', label: 'Insurance', detail: 'Manage payer decisions and policy scope.', icon: ShieldCheck },
  { id: 'user', label: 'User / Member', detail: 'View your own authorization information.', icon: Eye }
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('doctor');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = event => {
    event.preventDefault();
    const authenticated = login(email.trim(), password, role);
    if (!authenticated) {
      setError('Invalid email, password, or role.');
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  return <div className="login-page"><div className="login-frame"><header className="login-header"><div className="login-brand"><span className="brand-mark"><HeartPulse size={19}/></span><span>PROAUTH <b>AI</b></span></div></header><main className="login-content"><section className="login-copy"><h1>One workspace.<br/><em>Right perspective.</em></h1></section><section className="login-panel"><div className="login-panel-top"><div className="login-panel-mark"><KeyRound size={19}/></div><div><p className="eyebrow">WELCOME BACK</p><h2>Sign in</h2></div></div><form onSubmit={submit}><fieldset className="role-picker"><div className="role-grid">{roles.map(({ id, label, detail, icon: Icon }) => <button type="button" key={id} className={`role-option ${role === id ? 'selected' : ''}`} onClick={() => setRole(id)}><span className="role-option-icon"><Icon size={18}/></span><span><strong>{label}</strong><small>{detail}</small></span><i>{role === id && <Check size={12}/>}</i></button>)}</div></fieldset><div className="login-inputs"><label className="login-field"><span>Email</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@proauth.ai" required /></label><label className="login-field"><span>Password</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="demo1234" required /></label></div>{error && <p className="login-error" role="alert">{error}</p>}<button className="login-submit" type="submit">Continue to workspace <ArrowRight size={17}/></button></form><div className="demo-credentials"><div><ShieldCheck size={15}/><strong>Demo credentials</strong></div><p>Use <b>demo1234</b> for any account below.</p><div className="credential-list">{roles.map(({ id, label }) => <span key={id}><b>{label}</b><small>{id}@proauth.ai</small></span>)}</div></div><p className="login-notice"><ShieldCheck size={14}/>Demo authentication only. No real backend or password security is used.</p></section></main></div></div>;
}
