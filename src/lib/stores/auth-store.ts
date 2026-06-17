import { create } from "zustand";
import type { Profile, FamilyTreeNode } from "@/types";

interface AuthState {
  profile: Profile | null;
  treeNode: FamilyTreeNode | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setTreeNode: (node: FamilyTreeNode | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  treeNode: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setTreeNode: (treeNode) => set({ treeNode }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ profile: null, treeNode: null, isLoading: false }),
}));
