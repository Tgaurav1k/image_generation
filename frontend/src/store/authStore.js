import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),
  clearUser: () => set({ user: null, isAuthenticated: false, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

export default useAuthStore;
