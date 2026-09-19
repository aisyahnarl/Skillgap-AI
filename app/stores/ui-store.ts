import { create } from 'zustand';

interface UIState {
  activeModal: string | null;
  activeTab: string;
  theme: 'light' | 'dark';
  draftStep: number;
  setActiveModal: (modal: string | null) => void;
  setActiveTab: (tab: string) => void;
  toggleTheme: () => void;
  setDraftStep: (step: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  activeTab: 'overview',
  theme: 'light',
  draftStep: 1,
  setActiveModal: (modal) => set({ activeModal: modal }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setDraftStep: (step) => set({ draftStep: step }),
}));
