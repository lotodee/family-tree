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
  const [isResetting, setIsResetting] = useState(false);

  const canEdit = membership.can_add_to_tree;
  const isOwner = membership.role === "owner";

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

  // Reset all connections (owner only)
  const handleResetConnections = useCallback(async () => {
    const confirmed = window.confirm(
      "This will delete ALL connections and reset the tree. You'll need to re-add connections manually. Are you sure?"
    );
    if (!confirmed) return;

    setIsResetting(true);
    try {
      const res = await fetch("/api/relationships/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ celebrationId: celebration.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset");
      }

      const data = await res.json();
      setNodes(data.nodes);
      setRelationships(data.relationships);
      toast.success("All connections reset. Start re-adding connections.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset connections");
    } finally {
      setIsResetting(false);
    }
  }, [celebration.id]);

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
          <div className="max-w-md mx-auto py-8">
            <p
              className="text-center mb-8"
              style={{ color: COLORS.textSecondary }}
            >
              Celebration Settings — Coming in Sprint 8
            </p>

            {isOwner && (
              <div
                className="p-4 rounded-lg border"
                style={{
                  borderColor: COLORS.error,
                  backgroundColor: `${COLORS.error}10`,
                }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: COLORS.error }}
                >
                  Danger Zone
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: COLORS.textSecondary }}
                >
                  Reset all family connections. This deletes all relationships
                  but keeps the people. You will need to re-add connections
                  manually.
                </p>
                <button
                  onClick={handleResetConnections}
                  disabled={isResetting}
                  className="px-4 py-2 text-sm font-medium rounded"
                  style={{
                    backgroundColor: COLORS.error,
                    color: "white",
                    opacity: isResetting ? 0.6 : 1,
                  }}
                >
                  {isResetting ? "Resetting..." : "Reset All Connections"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
