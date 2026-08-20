import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../hooks/useAuth';

export default function Topbar() {
  const { profile } = useRole();
  const { logout } = useAuth(); const navigate = useNavigate();
  const signOut = () => { logout(); navigate('/login', { replace: true }); };
  return <header className="topbar"><button className="mobile-menu"><Menu /></button><div className="search"><Search size={18}/><input placeholder="Search patients, requests, policies…"/></div><div className="top-actions"><div className="system"><span></span>All systems operational</div><div className="active-role"><small>{profile.name}</small><strong>{profile.label}</strong></div><button className="round-button"><Bell size={18}/><i></i></button><div className="top-avatar">{profile.initials}</div><button className="logout-button" onClick={signOut}><LogOut size={15}/>Log out</button></div></header>;
}
