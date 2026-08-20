import { ShieldCheck } from 'lucide-react';

export default function AssignedRoleCard({ role }) {
  return <div className="selected-role"><ShieldCheck size={18}/><div><small>ASSIGNED ROLE</small><strong>{role.title}</strong><span>{role.text}</span></div></div>;
}
