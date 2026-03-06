"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { gsap } from "@/lib/gsap/config";
import type { FamilyTreeNode, FamilyTreeNodeWithProfile } from "@/types";
import { HorizontalFamilyTree } from "@/components/tree/horizontal-family-tree";
import { TreeBackground } from "@/components/tree/tree-background";

interface TreePageClientProps {
  initialNodes: FamilyTreeNodeWithProfile[];
  currentUserNodeId: string | null;
}

/**
 * Client component for the family tree page.
 * - Subscribes to Supabase Realtime for live updates
 * - Plays GSAP celebration animation when someone joins
 * - Features horizontal tree layout with native scrolling
 */
export function TreePageClient({
  initialNodes,
  currentUserNodeId,
}: TreePageClientProps) {
  const [nodes, setNodes] = useState<FamilyTreeNodeWithProfile[]>(initialNodes);

  // GSAP celebration animation for newly claimed nodes
  const celebrate = useCallback((nodeId: string, name: string) => {
    // Wait a tick for React to re-render the node as "claimed"
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-node-id="${nodeId}"]`);
      if (!el) return;

      const tl = gsap.timeline();

      // 1. Burst: scale up with golden glow
      tl.to(el, {
        scale: 1.2,
        boxShadow: "0 0 30px rgba(196,151,59,0.6), 0 0 60px rgba(196,151,59,0.2)",
        duration: 0.25,
        ease: "power2.out",
      })
        // 2. Small bounce back
        .to(el, {
          scale: 1.08,
          duration: 0.15,
          ease: "power1.inOut",
        })
        // 3. Elastic settle to resting state
        .to(el, {
          scale: 1,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          duration: 0.6,
          ease: "elastic.out(1, 0.4)",
        });
    });
  }, []);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("tree-live")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "family_tree_nodes" },
        (payload) => {
          const updated = payload.new as FamilyTreeNode;
          const old = payload.old as Partial<FamilyTreeNode>;

          // Update the node in state, preserving profile data
          setNodes((prev) =>
            prev.map((n) =>
              n.id === updated.id ? { ...updated, profile: n.profile } : n
            )
          );

          // Check if someone just joined
          if (updated.is_claimed && !old.is_claimed) {
            toast.success(`${updated.display_name} just joined the family tree!`, {
              duration: 4000,
            });
            celebrate(updated.id, updated.display_name);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "family_tree_nodes" },
        (payload) => {
          const newNode = payload.new as FamilyTreeNode;
          setNodes((prev) => [...prev, newNode]);

          if (newNode.is_claimed) {
            toast.success(`${newNode.display_name} was added to the family tree!`, {
              duration: 4000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [celebrate]);

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
          <span className="text-sm text-text-secondary">of {totalCount} joined</span>
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
          <span className="text-text-secondary">Scroll to explore</span>
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
