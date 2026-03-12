"use client";

import { useState, useEffect } from "react";
import { useCelebration } from "@/lib/contexts/celebration-context";
import { FamilyTreeView } from "@/components/tree/family-tree-view";
import { toast } from "sonner";
import type { FamilyTreeNode, FamilyRelationship } from "@/types";

export function TreeClient() {
  const { celebration } = useCelebration();
  const [nodes, setNodes] = useState<FamilyTreeNode[]>([]);
  const [relationships, setRelationships] = useState<FamilyRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTree() {
      try {
        const res = await fetch(`/api/tree?celebrationId=${celebration.id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setNodes(data.nodes);
        setRelationships(data.relationships);
      } catch {
        toast.error("Failed to load family tree");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTree();
  }, [celebration.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Loading family tree...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1
          className="text-xl font-bold mb-1"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          The Family Tree
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {nodes.length} family members · Scroll to explore
        </p>
      </div>

      {/* Tree */}
      <FamilyTreeView
        nodes={nodes}
        relationships={relationships}
        honoreeNodeId={celebration.honoree_node_id}
      />
    </div>
  );
}
