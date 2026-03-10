import { create } from "zustand";
import type { FamilyTreeNode } from "@/types";

interface TreeState {
  nodes: FamilyTreeNode[];
  isLoading: boolean;
  setNodes: (nodes: FamilyTreeNode[]) => void;
  updateNode: (nodeId: string, updates: Partial<FamilyTreeNode>) => void;
  setLoading: (loading: boolean) => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  nodes: [],
  isLoading: true,
  setNodes: (nodes) => set({ nodes }),
  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
