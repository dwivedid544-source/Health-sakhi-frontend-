import { Navigate, useLocation } from 'react-router-dom';

/** Auth-aware Root Redirect for wildcard routes */
const RootRedirect = () => {
  const { pathname } = useLocation();
  const currentMember = sessionStorage.getItem('hs_current_member');
  const currentRole = sessionStorage.getItem('temp_role');

  // If session exists, redirect to their role's dashboard
  if (currentMember || currentRole) {
    const role = currentRole || 'user';
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'advisor') return <Navigate to="/advisor" replace />;
    if (role === 'affiliate') return <Navigate to="/affiliate" replace />;
    
    return <Navigate to="/app" replace />;
  }

  // If no session exists, redirect dashboard-prefixed paths to Landing page
  if (
    pathname.startsWith('/app') ||
    pathname.startsWith('/academy') ||
    pathname.startsWith('/advisor') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/affiliate')
  ) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/" replace />;
};

export default RootRedirect;
