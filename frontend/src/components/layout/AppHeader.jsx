import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import useLayoutStore, { HEADER_HEIGHT_PX } from '../../store/layoutStore';

export default function AppHeader() {
  const { toggleSidebar, openMobileDrawer } = useLayoutStore();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleMenu = () => {
    if (isMobile) openMobileDrawer();
    else toggleSidebar();
  };

  return (
    <header
      className="glass-surface"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: HEADER_HEIGHT_PX,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <button
        type="button"
        onClick={handleMenu}
        aria-label={isMobile ? 'Open navigation menu' : 'Toggle sidebar'}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          padding: 6,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--glass-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Menu size={22} strokeWidth={2} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--accent-sage)', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>◈</span>
        <span style={{ fontWeight: 600, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          BulkGen
        </span>
      </div>
    </header>
  );
}
