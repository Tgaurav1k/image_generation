import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';
import useLayoutStore, { HEADER_HEIGHT_PX } from '../store/layoutStore';

export default function UserLayout() {
  const { sidebarCollapsed } = useLayoutStore();
  const marginLeft = sidebarCollapsed ? 68 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppHeader />
      <Sidebar />
      <main
        style={{
          flex: 1,
          width: '100%',
          minWidth: 0,
          padding: `calc(${HEADER_HEIGHT_PX}px + 16px) 16px 24px`,
          maxWidth: '100%',
          transition: 'padding-left var(--duration-slow) var(--ease-out)',
        }}
      >
        <style>{`
          @media (min-width: 768px) {
            main {
              margin-left: ${marginLeft}px !important;
              padding: calc(${HEADER_HEIGHT_PX}px + 24px) 24px 32px !important;
            }
          }
        `}</style>
        <div style={{ maxWidth: 1800, margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
