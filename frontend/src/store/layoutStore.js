import { create } from 'zustand';

export const HEADER_HEIGHT_PX = 56;

const useLayoutStore = create((set) => ({
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
  detailImage: null,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
  openMobileDrawer: () => set({ mobileDrawerOpen: true }),
  closeMobileDrawer: () => set({ mobileDrawerOpen: false }),
  toggleMobileDrawer: () => set((s) => ({ mobileDrawerOpen: !s.mobileDrawerOpen })),
  setDetailImage: (img) => set({ detailImage: img }),
  clearDetailImage: () => set({ detailImage: null }),
}));

export default useLayoutStore;
