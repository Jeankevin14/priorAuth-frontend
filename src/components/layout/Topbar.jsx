import { Bell, LogOut, Menu, Search, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../hooks/useAuth';
import { useSoundEffects } from '../../hooks/useSoundEffects';

export default function Topbar() {
  const { profile } = useRole();
  const { logout } = useAuth(); const navigate = useNavigate();
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSoundEffects();
  const signOut = () => { logout(); navigate('/login', { replace: true }); };
  return <header className="topbar"><button className="mobile-menu" aria-label="Open menu"><Menu /></button><div className="search"><Search size={18}/><input placeholder="Search patients, requests, policies…" aria-label="Search patients, requests, policies"/></div><div className="top-actions"><div className="system"><span></span>All systems operational</div><div className="active-role"><small>{profile.name}</small><strong>{profile.label}</strong></div><button className="round-button" aria-label={soundEnabled ? 'Sound effects on — turn off' : 'Sound effects off — turn on'} aria-pressed={soundEnabled} title={soundEnabled ? 'Sound effects: On' : 'Sound effects: Off'} onClick={() => setSoundEnabled(!soundEnabled)}>{soundEnabled ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button><button className="round-button" aria-label="Notifications"><Bell size={18}/><i></i></button><div className="top-avatar">{profile.initials}</div><button className="logout-button" onClick={signOut}><LogOut size={15}/>Log out</button></div></header>;
}
