"use client";

import { useState, useEffect, useCallback } from "react";
import { useCelebration } from "@/lib/contexts/celebration-context";
import { toast } from "sonner";
import { TreeTab } from "@/components/manage/tree-tab";
import { InviteTab } from "@/components/manage/invite-tab";
import { Loading } from "@/components/ui/loading";
import { COLORS } from "@/lib/config/design";
import Link from "next/link";
import type { FamilyTreeNode, FamilyRelationship } from "@/types";

type Tab = "tree" | "invitations" | "settings";

export function ManageClient() {
  const { celebration, membership } = useCelebration();
  const [tab, setTab] = useState<Tab>("tree");
  const [nodes, setNodes] = useState<FamilyTreeNode[]>([]);
  const [relationships, setRelationships] = useState<FamilyRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const canEdit = membership.can_add_to_tree;

  const fetchTree = useCallback(async () => {
    try {
      const res = await fetch(`/api/tree?celebrationId=${celebration.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNodes(data.nodes || []);
      setRelationships(data.relationships || []);
    } catch {
      toast.error("Failed to load family tree");
    } finally {
      setIsLoading(false);
    }
  }, [celebration.id]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // Called after any mutation — updates local state from the API response
  const handleTreeUpdate = useCallback(
    (data: { nodes: FamilyTreeNode[]; relationships: FamilyRelationship[] }) => {
      setNodes(data.nodes);
      setRelationships(data.relationships);
    },
    []
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <Link
          href="/dashboard"
          className="text-sm mb-2 inline-block"
          style={{ color: COLORS.textSecondary }}
        >
          &larr; Dashboard
        </Link>
        <h1
          className="text-2xl font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: COLORS.textPrimary,
          }}
        >
          {celebration.name}
        </h1>
      </div>

      {/* Tabs */}
      <div
        className="px-6 flex gap-6 border-b"
        style={{ borderColor: COLORS.goldLight }}
      >
        {(["tree", "invitations", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="py-3 text-sm font-medium relative"
            style={{
              color: tab === t ? COLORS.gold : COLORS.textSecondary,
            }}
          >
            {t === "tree"
              ? "Family Tree"
              : t === "invitations"
              ? "Invite Members"
              : "Settings"}
            {tab === t && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: COLORS.gold }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {tab === "tree" && (
          <>
            {isLoading ? (
              <Loading centered text="Loading family tree..." />
            ) : (
              <TreeTab
                nodes={nodes}
                relationships={relationships}
                celebrationId={celebration.id}
                honoreeNodeId={celebration.honoree_node_id}
                canEdit={canEdit}
                onTreeUpdate={handleTreeUpdate}
                onRefresh={fetchTree}
              />
            )}
          </>
        )}

        {tab === "invitations" && <InviteTab nodes={nodes} />}

        {tab === "settings" && (
          <p
            className="text-center py-16"
            style={{ color: COLORS.textSecondary }}
          >
            Celebration Settings — Coming in Sprint 8
          </p>
        )}
      </div>
    </div>
  );
}
