import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function BrandedSpinner() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-base)', gap: 24,
    }}>
      <div style={{ animation: 'logo-pulse 1.6s ease-in-out infinite' }}>
        <span style={{ fontSize: 48, color: 'var(--accent-sage)', fontWeight: 700 }}>◈</span>
      </div>
      <div style={{
        width: 40, height: 40, border: '3px solid var(--border-subtle)',
        borderTopColor: 'var(--accent-sage)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Loading BulkGen...</span>
    </div>
  );
}

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) return <BrandedSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isAdminLike = user?.role === 'admin' || user?.role === 'superadmin';

  if (requiredRole && user?.role !== requiredRole) {
    if (requiredRole === 'admin' && isAdminLike) {
      // superadmin can access admin routes
    } else {
      const redirect = isAdminLike ? '/admin/dashboard' : '/dashboard/generate';
      return <Navigate to={redirect} replace />;
    }
  }

  return children;
}
