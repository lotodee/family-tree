"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useCelebration } from "@/lib/contexts/celebration-context";
import { toast } from "sonner";
import { TreePreview } from "@/components/manage/tree-preview";
import { NodeForm } from "@/components/manage/node-form";
import { NodeDetail } from "@/components/manage/node-detail";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import type { FamilyTreeNode, AddTreeNodeFormData } from "@/types";
import { COLORS } from "@/lib/config/design";
import Link from "next/link";

type ManageTab = "tree" | "invitations" | "settings";
type FormMode = "add_root" | "add_child" | "add_spouse" | "edit";

export function ManageClient() {
  const { celebration, membership } = useCelebration();
  const [activeTab, setActiveTab] = useState<ManageTab>("tree");
  const [nodes, setNodes] = useState<FamilyTreeNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("add_root");
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formSpouseId, setFormSpouseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const canEdit = membership.can_add_to_tree;
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // Fetch tree nodes on mount
  const fetchNodes = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/tree?celebrationId=${celebration.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const { nodes: fetched } = await response.json();
      setNodes(fetched);
    } catch {
      toast.error("Failed to load family tree");
    } finally {
      setIsLoading(false);
    }
  }, [celebration.id]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  // Add a node
  const handleAddNode = useCallback(
    async (data: AddTreeNodeFormData) => {
      try {
        const response = await fetch("/api/tree", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            celebrationId: celebration.id,
            displayName: data.display_name,
            fullName: data.full_name,
            gender: data.gender,
            generation: data.generation,
            parentNodeId: data.parent_node_id,
            spouseNodeId: data.spouse_node_id,
            branch: data.branch,
            nodeType: data.node_type,
            isDeceased: data.is_deceased,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to add");
        }

        const { node } = await response.json();
        toast.success(`${data.display_name} added to the tree`);
        setIsFormOpen(false);
        setSelectedNodeId(node.id);
        await fetchNodes();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add family member"
        );
      }
    },
    [celebration.id, fetchNodes]
  );

  // Edit a node
  const handleEditNode = useCallback(
    async (nodeId: string, data: Partial<AddTreeNodeFormData>) => {
      try {
        const response = await fetch(`/api/tree/${nodeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: data.display_name,
            fullName: data.full_name,
            gender: data.gender,
            isDeceased: data.is_deceased,
            branch: data.branch,
          }),
        });

        if (!response.ok) throw new Error("Failed to update");
        toast.success("Updated");
        setIsFormOpen(false);
        await fetchNodes();
      } catch {
        toast.error("Failed to update");
      }
    },
    [fetchNodes]
  );

  // Remove a node
  const handleRemoveNode = useCallback(
    async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const hasChildren = nodes.some((n) => n.parent_node_id === nodeId);
      const confirmMsg = hasChildren
        ? `Remove ${node.display_name}? Their children will remain on the tree but will no longer be linked to a parent.`
        : `Remove ${node.display_name} from the tree?`;

      if (!confirm(confirmMsg)) return;

      try {
        const response = await fetch(`/api/tree/${nodeId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to remove");
        toast.success(`${node.display_name} removed`);
        setSelectedNodeId(null);
        await fetchNodes();
      } catch {
        toast.error("Failed to remove");
      }
    },
    [nodes, fetchNodes]
  );

  // Action handlers
  const handleAddChild = (parentId: string) => {
    setFormMode("add_child");
    setFormParentId(parentId);
    setFormSpouseId(null);
    setIsFormOpen(true);
  };

  const handleAddSpouse = (nodeId: string) => {
    setFormMode("add_spouse");
    setFormParentId(null);
    setFormSpouseId(nodeId);
    setIsFormOpen(true);
  };

  const handleAddRoot = () => {
    setFormMode("add_root");
    setFormParentId(null);
    setFormSpouseId(null);
    setIsFormOpen(true);
  };

  const handleEditRequest = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen"
      style={{ backgroundColor: COLORS.cream }}
    >
      {/* Page header */}
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

      {/* Tab navigation */}
      <div
        className="px-6 flex gap-6 border-b"
        style={{ borderColor: COLORS.goldLight }}
      >
        {(["tree", "invitations", "settings"] as ManageTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="py-3 text-sm font-medium transition-colors relative"
            style={{
              color:
                activeTab === tab ? COLORS.gold : COLORS.textSecondary,
            }}
          >
            {tab === "tree"
              ? "Family Tree"
              : tab === "invitations"
              ? "Invite Members"
              : "Settings"}
            {activeTab === tab && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: COLORS.gold }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === "tree" && (
          <div>
            {/* Header with count + add button */}
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                Family Tree ({nodes.length}{" "}
                {nodes.length === 1 ? "member" : "members"})
              </h2>
              {canEdit && nodes.length > 0 && (
                <Button onClick={handleAddRoot} size="sm">
                  + Add Person
                </Button>
              )}
            </div>

            {/* Loading state */}
            {isLoading && <Loading centered text="Loading tree..." />}

            {/* Empty state */}
            {!isLoading && nodes.length === 0 && (
              <div className="text-center py-16">
                <p
                  className="text-lg mb-2"
                  style={{ color: COLORS.textPrimary }}
                >
                  Start building your family tree
                </p>
                <p
                  className="text-sm mb-6"
                  style={{ color: COLORS.textSecondary }}
                >
                  Add the person being celebrated first, then their spouse,
                  children, and grandchildren.
                </p>
                {canEdit && (
                  <Button onClick={handleAddRoot}>
                    + Add First Person
                  </Button>
                )}
              </div>
            )}

            {/* Tree preview + selected node detail */}
            {!isLoading && nodes.length > 0 && (
              <div className="flex gap-6">
                {/* Tree visualization */}
                <div className="flex-1 min-w-0">
                  <TreePreview
                    nodes={nodes}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={setSelectedNodeId}
                    onAddChild={canEdit ? handleAddChild : undefined}
                    onAddSpouse={canEdit ? handleAddSpouse : undefined}
                  />
                </div>

                {/* Selected node detail panel */}
                {selectedNode && (
                  <div className="w-72 flex-shrink-0">
                    <NodeDetail
                      node={selectedNode}
                      nodes={nodes}
                      canEdit={canEdit}
                      onEdit={() => handleEditRequest(selectedNode.id)}
                      onRemove={() => handleRemoveNode(selectedNode.id)}
                      onAddChild={() => handleAddChild(selectedNode.id)}
                      onAddSpouse={() => handleAddSpouse(selectedNode.id)}
                      onClose={() => setSelectedNodeId(null)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Add/Edit form modal */}
            {isFormOpen && canEdit && (
              <NodeForm
                mode={formMode}
                nodes={nodes}
                parentNodeId={formParentId}
                spouseNodeId={formSpouseId}
                editNode={formMode === "edit" ? selectedNode : null}
                onSubmit={(data) => {
                  if (formMode === "edit" && selectedNode) {
                    handleEditNode(selectedNode.id, data);
                  } else {
                    handleAddNode(data);
                  }
                }}
                onClose={() => setIsFormOpen(false)}
              />
            )}
          </div>
        )}

        {activeTab === "invitations" && (
          <div
            className="text-center py-16"
            style={{ color: COLORS.textSecondary }}
          >
            Invite Members — Coming in Sprint 3
          </div>
        )}

        {activeTab === "settings" && (
          <div
            className="text-center py-16"
            style={{ color: COLORS.textSecondary }}
          >
            Celebration Settings — Coming in Sprint 8
          </div>
        )}
      </div>
    </div>
  );
}
