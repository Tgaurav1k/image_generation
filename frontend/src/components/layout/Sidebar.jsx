import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Images, Users, LogOut, X, History, ShieldCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLayoutStore, { HEADER_HEIGHT_PX } from '../../store/layoutStore';
import { logoutUser } from '../../services/authService';

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/generate', icon: Sparkles, label: 'Generate' },
  { to: '/admin/recent', icon: History, label: 'Recent history' },
];

const superAdminExtra = [
  { to: '/admin/admins', icon: ShieldCheck, label: 'Manage Admins' },
];

const userNav = [
  { to: '/dashboard/generate', icon: Sparkles, label: 'Generate' },
  { to: '/dashboard/gallery', icon: Images, label: 'Gallery' },
  { to: '/dashboard/recent', icon: History, label: 'Recent history' },
];

function NavTooltip({ label, show }) {
  if (!show) return null;
  return (
    <span style={{
      position: 'absolute', left: '100%', marginLeft: 8, top: '50%', transform: 'translateY(-50%)',
      background: 'var(--bg-elevated)', color: 'var(--text-primary)',
      padding: '4px 10px', borderRadius: 'var(--radius-full)',
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
      boxShadow: 'var(--shadow-md)', border: '1px solid var(--glass-border)',
      zIndex: 60, pointerEvents: 'none',
    }}>
      {label}
    </span>
  );
}

export default function Sidebar() {
  const {
    sidebarCollapsed: collapsed,
    setSidebarCollapsed,
    mobileDrawerOpen,
    closeMobileDrawer,
  } = useLayoutStore();
  const { user, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const isAdminLike = user?.role === 'admin' || user?.role === 'superadmin';
  const navItems = isAdminLike
    ? (user?.role === 'superadmin' ? [...adminNav, ...superAdminExtra] : adminNav)
    : userNav;
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px) and (max-width: 1024px)');
    const handler = (e) => { if (e.matches) setSidebarCollapsed(true); };
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [setSidebarCollapsed]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onWide = () => { if (mq.matches) useLayoutStore.getState().closeMobileDrawer(); };
    mq.addEventListener('change', onWide);
    return () => mq.removeEventListener('change', onWide);
  }, []);

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    clearUser();
    closeMobileDrawer();
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 68 : 240;
  const sidebarTop = HEADER_HEIGHT_PX;
  const sidebarHeight = `calc(100vh - ${HEADER_HEIGHT_PX}px)`;

  return (
    <>
      {/* Desktop / tablet: rail below app header */}
      <aside
        className="hidden md:flex flex-col fixed left-0 glass-surface"
        style={{
          top: sidebarTop,
          height: sidebarHeight,
          width: sidebarWidth,
          zIndex: 40,
          transition: 'width var(--duration-slow) var(--ease-out)',
          overflow: 'hidden',
          borderRight: '1px solid var(--glass-border)',
          borderTop: 'none',
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', margin: '8px 12px 0' }} />

        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{
                position: 'relative',
                justifyContent: collapsed ? 'center' : 'flex-start',
                paddingLeft: collapsed ? 0 : 12,
              }}
              aria-label={item.label}
              onMouseEnter={() => setHoveredItem(item.to)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <item.icon size={18} style={{ minWidth: 18 }} />
              <span style={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : 'auto',
                overflow: 'hidden',
                transition: 'opacity var(--duration-fast) var(--ease-out)',
                whiteSpace: 'nowrap',
              }}>
                {item.label}
              </span>
              {collapsed && <NavTooltip label={item.label} show={hoveredItem === item.to} />}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0 12px' }} />

        <div style={{
          padding: collapsed ? '12px 0' : '12px',
          display: 'flex', alignItems: 'center', gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-full)',
            background: 'var(--accent-sage-dim)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600,
            color: 'var(--text-primary)', flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.username}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 6, borderRadius: 'var(--radius-sm)',
                  transition: 'color var(--duration-fast) var(--ease-out)',
                  display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--status-error)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile drawer (opened from AppHeader) */}
      {mobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60]"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={closeMobileDrawer}
          role="presentation"
        >
          <div
            className="glass-surface"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(280px, 88vw)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid var(--glass-border)',
              animation: 'slideInLeft 0.28s var(--ease-out)',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              minHeight: HEADER_HEIGHT_PX, padding: '0 12px 0 16px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Menu</span>
              <button
                type="button"
                onClick={closeMobileDrawer}
                aria-label="Close menu"
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 8, borderRadius: 'var(--radius-md)', display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  style={{ paddingLeft: 12 }}
                  onClick={closeMobileDrawer}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0 12px' }} />

            <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-full)',
                background: 'var(--accent-sage-dim)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600,
                color: 'var(--text-primary)', flexShrink: 0,
              }}>
                {user?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{user?.username}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 6, borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
