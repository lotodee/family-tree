import { create } from "zustand";
import type { FamilyTreeNode } from "@/types";

interface TreeState {
  nodes: FamilyTreeNode[];
  selectedNodeId: string | null;
  isLoading: boolean;
  setNodes: (nodes: FamilyTreeNode[]) => void;
  updateNode: (nodeId: string, updates: Partial<FamilyTreeNode>) => void;
  selectNode: (nodeId: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  nodes: [],
  selectedNodeId: null,
  isLoading: true,
  setNodes: (nodes) => set({ nodes }),
  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    })),
  selectNode: (selectedNodeId) => set({ selectedNodeId }),
  setLoading: (isLoading) => set({ isLoading }),
}));
