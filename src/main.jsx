import { createRoot } from 'react-dom/client';
import { RoleProvider } from './context/RoleContext';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AppRouter from './router/AppRouter';
import RoleDashboard from './components/dashboard/RoleDashboard';
import DoctorRequests from './features/doctor/pages/DoctorRequests';
import DoctorDocuments from './features/doctor/pages/DoctorDocuments';
import DoctorPatientDetail from './features/doctor/pages/DoctorPatientDetail';
import DoctorPatients from './features/doctor/pages/DoctorPatients';
import ReviewerAuthorization from './features/insurance/pages/ReviewerAuthorization';
import ReviewerPatientDetail from './features/insurance/pages/ReviewerPatientDetail';
import ReviewerPatients from './features/insurance/pages/ReviewerPatients';
import NursePatients from './features/nurse/pages/NursePatients';
import NursePatientDetail from './features/nurse/pages/NursePatientDetail';
import { ReadonlyAuthorizationPage, ReadonlyDiagnosisPage, ReadonlyDocumentsPage, ReadonlyPolicyCategoryPage, ReadonlyProfilePage, ReadonlyRequestPage, ReadonlyDecisionPage, ReadonlyTimelinePage } from './pages/ReadonlyViews';
import ResultPage from './pages/ResultPage';
import NewAuthorization from './pages/NewAuthorization';
import Queue from './pages/Queue';
import SimplePage from './pages/SimplePage';
import Analytics from './pages/Analytics';
import './styles.css';
import './access.css';
import './sidebar.css';
import './login.css';
import './readonly.css';
import './layout-consistency.css';

function RoleScopedPage({ readonly, standard, doctor, insurance, nurse }){const { role } = useAuth();const insuranceRole = role === 'insurance' || role === 'reviewer';return role === 'user' || role === 'readonly' ? readonly : role === 'doctor' && doctor ? doctor : insuranceRole && insurance ? insurance : role === 'nurse' && nurse ? nurse : standard;}
function Root(){return <AppRouter pages={{dashboard:<RoleScopedPage readonly={<ReadonlyProfilePage/>} standard={<RoleDashboard/>}/>,profile:<ReadonlyProfilePage/>,myPolicy:<ReadonlyPolicyCategoryPage/>,diagnosis:<ReadonlyDiagnosisPage/>,myRequest:<ReadonlyRequestPage/>,decision:<ReadonlyDecisionPage/>,documents:<ReadonlyDocumentsPage/>,doctorDocuments:<DoctorDocuments/>,timeline:<ReadonlyTimelinePage/>,newAuthorization:<NewAuthorization/>,patients:<RoleScopedPage doctor={<DoctorPatients/>} nurse={<NursePatients/>} insurance={<ReviewerPatients/>} standard={<SimplePage title="Patient profiles" subtitle="Your patients and authorization status."/>}/>,patientDetail:<RoleScopedPage doctor={<DoctorPatientDetail/>} nurse={<NursePatientDetail/>} insurance={<ReviewerPatientDetail/>} standard={<SimplePage title="Patient profile" subtitle="Patient authorization details."/>}/>,doctorRequests:<DoctorRequests/>,notifications:<SimplePage title="Notifications"/>,queue:<Queue/>,authorization:<RoleScopedPage readonly={<ReadonlyAuthorizationPage/>} insurance={<ReviewerAuthorization/>} standard={<ResultPage/>}/>,policies:<SimplePage title="Policy explorer" subtitle="Search policies and surface evidence for a clear review experience."/>,analytics:<Analytics/>,audit:<SimplePage title="Audit trail" subtitle="A transparent event record for every authorization."/>}}/>}
createRoot(document.getElementById('root')).render(<AuthProvider><RoleProvider><Root/></RoleProvider></AuthProvider>);
