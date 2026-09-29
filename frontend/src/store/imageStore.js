import { create } from 'zustand';

const useImageStore = create((set, get) => ({
  images: [],
  selectedIds: [],
  isGenerating: false,
  progress: 0,

  setImages: (images) => set({ images }),
  addImages: (newImages) => set((s) => ({ images: [...newImages, ...s.images] })),
  setGenerating: (val) => set({ isGenerating: val, progress: val ? 0 : 100 }),
  setProgress: (val) => set((s) => ({
    progress: typeof val === 'function' ? val(s.progress) : val,
  })),

  toggleSelect: (id) => set((s) => {
    const exists = s.selectedIds.includes(id);
    return { selectedIds: exists ? s.selectedIds.filter(x => x !== id) : [...s.selectedIds, id] };
  }),
  selectAll: () => set((s) => ({ selectedIds: s.images.map(i => i.id) })),
  clearSelection: () => set({ selectedIds: [] }),
  removeImage: (id) => set((s) => ({
    images: s.images.filter(i => i.id !== id),
    selectedIds: s.selectedIds.filter(x => x !== id),
  })),
}));

export default useImageStore;
