"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { FamilyTreeNode } from "@/types";
import { FamilyOrganogram } from "@/components/tree/family-organogram";
import { TreeBackground } from "@/components/tree/tree-background";

interface TreeRealtimeWrapperProps {
  initialNodes: FamilyTreeNode[];
  currentUserNodeId: string | null;
}

/**
 * Client component wrapper that subscribes to Supabase Realtime
 * for live updates when family members join or update.
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
      {/* Header with join count */}
      <div className="flex items-center justify-between border-b border-gold/20 bg-ivory/80 px-4 py-3 backdrop-blur-sm">
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
      </div>

      {/* Tree visualization */}
      <div className="relative flex-1">
        <TreeBackground />
        <FamilyOrganogram nodes={nodes} currentUserNodeId={currentUserNodeId} />
      </div>
    </div>
  );
}
