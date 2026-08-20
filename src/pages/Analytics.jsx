import { Activity, Clock3, Users } from 'lucide-react';
import { Badge, Card } from '../components/ui';
import { StatCard } from '../components/dashboard/DashboardWidgets';
import SimplePage from './SimplePage';

export default function Analytics(){return <SimplePage title="Authorization analytics" subtitle="Operational patterns across your authorization workflow."><div className="analytics-grid"><StatCard label="Approval rate" value="61.8%" delta="+4.2%" tone="green" icon={<Activity/>}/><StatCard label="Avg. processing" value="4m 12s" delta="-38s" tone="blue" icon={<Clock3/>}/><StatCard label="Human override" value="7.2%" delta="Within target" tone="green" icon={<Users/>}/><Card className="chart"><div className="section-title"><h3>Authorization volume</h3><Badge>Last 7 days</Badge></div><div className="bars">{[46,70,55,84,72,96,81].map((x,i)=><div key={i}><i style={{height:x+'%'}}></i><span>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span></div>)}</div></Card></div></SimplePage>}
