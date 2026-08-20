import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RoleDashboard from '../components/dashboard/RoleDashboard';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import NurseReview from '../features/nurse/pages/NurseReview';
import AuthProtectedRoute from '../guards/ProtectedRoute';

const roleHome = '/dashboard';
const allowedRoutes = {
  doctor: ['/dashboard', '/new-authorization', '/new', '/patients', '/patients/:id', '/doctor/requests', '/doctor/requests/automated', '/doctor/requests/need-information', '/doctor/documents', '/doctor/notifications', '/authorizations/:id', '/request/:id'],
  nurse: ['/dashboard', '/nurse/review', '/patients', '/patients/:id', '/authorizations/:id', '/request/:id'],
  insurance: ['/dashboard', '/queue', '/patients', '/patients/:id', '/authorizations/:id', '/request/:id', '/policies', '/analytics', '/audit'],
  user: ['/dashboard', '/profile', '/my-policy', '/diagnosis', '/my-request', '/decision', '/documents', '/timeline', '/authorizations/:id'],
  reviewer: ['/dashboard', '/queue', '/patients', '/patients/:id', '/authorizations/:id', '/request/:id', '/policies', '/analytics', '/audit'],
  readonly: ['/dashboard', '/profile', '/my-policy', '/diagnosis', '/my-request', '/decision', '/documents', '/timeline', '/authorizations/:id']
};

function matchesRoute(pathname, pattern) {
  return new RegExp(`^${pattern.replace(/:[^/]+/g, '[^/]+')}$`).test(pathname);
}

function RoleRoute({ children, route }) {
  const { role } = useAuth();
  if (!allowedRoutes[role]?.some(pattern => matchesRoute(route, pattern))) return <Navigate to={roleHome} replace/>;
  return children;
}

export default function AppRouter({ pages }) {
  const protectedPage = (path, content) => <Route path={path} element={<AuthProtectedRoute><RoleRoute route={path}>{content}</RoleRoute></AuthProtectedRoute>}/>;
  return <BrowserRouter><Routes>
    <Route path="/" element={<Landing/>}/>
    <Route path="/login" element={<Login/>}/>
    {protectedPage('/dashboard', pages.dashboard || <RoleDashboard/>)}
    {protectedPage('/profile', pages.profile)}
    {protectedPage('/my-policy', pages.myPolicy)}
    {protectedPage('/diagnosis', pages.diagnosis)}
    {protectedPage('/my-request', pages.myRequest)}
    {protectedPage('/decision', pages.decision)}
    {protectedPage('/documents', pages.documents)}
    {protectedPage('/timeline', pages.timeline)}
    {protectedPage('/new-authorization', pages.newAuthorization)}
    {protectedPage('/new', pages.newAuthorization)}
    {protectedPage('/patients', pages.patients)}
    {protectedPage('/patients/:id', pages.patientDetail)}
    {protectedPage('/doctor/requests', pages.doctorRequests)}
    {protectedPage('/doctor/requests/automated', pages.doctorRequests)}
    {protectedPage('/doctor/requests/need-information', pages.doctorRequests)}
    {protectedPage('/nurse/review', pages.nurseReview || <NurseReview/>)}
    {protectedPage('/queue', pages.queue)}
    {protectedPage('/authorizations/:id', pages.authorization)}
    {protectedPage('/request/:id', pages.authorization)}
    {protectedPage('/policies', pages.policies)}
    {protectedPage('/analytics', pages.analytics)}
    {protectedPage('/audit', pages.audit)}
    {protectedPage('/doctor/documents', pages.doctorDocuments)}
    {protectedPage('/doctor/notifications', pages.notifications)}
    <Route path="*" element={<Navigate to={roleHome} replace/>}/>
  </Routes></BrowserRouter>;
}
