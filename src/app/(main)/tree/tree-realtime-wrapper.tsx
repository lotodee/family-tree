"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { FamilyTreeNode } from "@/types";
import { HorizontalFamilyTree } from "@/components/tree/horizontal-family-tree";
import { TreeBackground } from "@/components/tree/tree-background";

interface TreeRealtimeWrapperProps {
  initialNodes: FamilyTreeNode[];
  currentUserNodeId: string | null;
}

/**
 * Client component wrapper that subscribes to Supabase Realtime
 * for live updates when family members join or update.
 * Features horizontal tree layout with native scrolling.
 */
export function TreeRealtimeWrapper({
  initialNodes,
  currentUserNodeId,
}: TreeRealtimeWrapperProps) {
  const [nodes, setNodes] = useState<FamilyTreeNode[]>(initialNodes);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to changes on family_tree_nodes table
    const channel = supabase
      .channel("tree-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "family_tree_nodes",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updatedNode = payload.new as FamilyTreeNode;
            const oldNode = payload.old as Partial<FamilyTreeNode>;

            // Check if someone just joined (is_claimed changed from false to true)
            if (!oldNode.is_claimed && updatedNode.is_claimed) {
              toast.success(`${updatedNode.display_name} joined the family tree!`, {
                duration: 4000,
              });
            }

            // Update the node in state
            setNodes((prev) =>
              prev.map((n) => (n.id === updatedNode.id ? updatedNode : n))
            );
          } else if (payload.eventType === "INSERT") {
            const newNode = payload.new as FamilyTreeNode;

            // Add new node to state
            setNodes((prev) => [...prev, newNode]);

            if (newNode.is_claimed) {
              toast.success(`${newNode.display_name} joined the family tree!`, {
                duration: 4000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate join count
  const joinedCount = nodes.filter((n) => n.is_claimed || n.is_deceased).length;
  const totalCount = nodes.length;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Sticky header with frosted glass */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gold/20 bg-ivory/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="font-display text-lg font-semibold text-text-primary">
          The Ademiluyi Family
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-ivory">
            {joinedCount}
          </div>
          <span className="text-sm text-text-secondary">
            of {totalCount} joined
          </span>
        </div>
      </header>

      {/* Scrollable tree container */}
      <div className="relative flex-1 overflow-auto bg-cream">
        <TreeBackground />
        <div className="relative z-10 pb-24">
          <HorizontalFamilyTree
            nodes={nodes}
            currentUserNodeId={currentUserNodeId || undefined}
          />
        </div>
      </div>

      {/* Floating legend pill */}
      <div className="fixed bottom-20 left-1/2 z-30 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-full bg-ivory/90 px-4 py-2 text-xs shadow-lg backdrop-blur-sm">
          <span className="text-text-secondary">← Scroll to explore →</span>
          <span className="h-3 w-px bg-gold/30" />
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-gold" />
            <span className="text-text-secondary">Joined</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full border border-dashed border-gold/40" />
            <span className="text-text-secondary">Not yet</span>
          </span>
        </div>
      </div>
    </div>
  );
}
