import { create } from "zustand";

interface VerifyEmailGateStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useVerifyEmailGateStore = create<VerifyEmailGateStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
