import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { loginUser } from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { setUser, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated && user) {
    const target = (user.role === 'admin' || user.role === 'superadmin') ? '/admin/dashboard' : '/dashboard/generate';
    navigate(target, { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      setUser(data.user);
      const target = (data.user.role === 'admin' || data.user.role === 'superadmin') ? '/admin/dashboard' : '/dashboard/generate';
      navigate(target, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Blob 1 — sage */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,158,138,0.15) 0%, transparent 70%)',
        top: '-10%', left: '-5%', animation: 'float1 15s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      {/* Blob 2 — blue */}
      <div style={{
        position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,141,239,0.10) 0%, transparent 70%)',
        bottom: '-10%', right: '-5%', animation: 'float2 18s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      {/* Blob 3 — warm accent */}
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,164,76,0.08) 0%, transparent 70%)',
        top: '60%', left: '55%', animation: 'float3 21s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-2xl)',
          padding: 48, width: 420, maxWidth: '90vw',
          background: 'var(--glass-bg)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative', zIndex: 1,
          animation: shaking ? 'shake 0.45s ease-out' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <span style={{ color: 'var(--accent-sage)', fontSize: 28, fontWeight: 700 }}>◈</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>BulkGen</span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Welcome back</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <Button type="submit" disabled={loading || !username || !password} style={{ width: '100%', marginTop: 8, height: 44 }}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'rgba(224,100,90,0.1)', color: 'var(--status-error)',
              fontSize: 13, border: '1px solid rgba(224,100,90,0.2)',
            }}
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
