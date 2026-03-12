"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { TreePreview } from "./tree-preview";
import { NodeDetail } from "./node-detail";
import { AddConnectionForm } from "./add-connection-form";
import { COLORS } from "@/lib/config/design";
import type { FamilyTreeNode, FamilyRelationship } from "@/types";

interface Props {
  nodes: FamilyTreeNode[];
  relationships: FamilyRelationship[];
  celebrationId: string;
  honoreeNodeId: string | null;
  canEdit: boolean;
  onTreeUpdate: (data: {
    nodes: FamilyTreeNode[];
    relationships: FamilyRelationship[];
  }) => void;
  onRefresh: () => void;
}

export function TreeTab({
  nodes,
  relationships,
  celebrationId,
  honoreeNodeId,
  canEdit,
  onTreeUpdate,
  onRefresh,
}: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    honoreeNodeId
  );
  const [showAddForm, setShowAddForm] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // Get direct relationships for a node (outgoing from this node)
  const getNodeConnections = useCallback(
    (nodeId: string) => {
      return relationships
        .filter((r) => r.from_node_id === nodeId)
        .map((r) => ({
          relationship: r,
          relatedNode: nodes.find((n) => n.id === r.to_node_id),
        }))
        .filter(
          (r): r is { relationship: FamilyRelationship; relatedNode: FamilyTreeNode } =>
            r.relatedNode !== undefined
        );
    },
    [relationships, nodes]
  );

  const handleAddConnection = useCallback(
    async (data: {
      fromNodeId: string;
      relationshipType: string;
      newPersonName: string;
      newPersonGender: string;
      toNodeId?: string;
    }) => {
      try {
        const res = await fetch("/api/relationships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            celebrationId,
            fromNodeId: data.fromNodeId,
            relationshipType: data.relationshipType,
            newPersonName: data.newPersonName,
            newPersonGender: data.newPersonGender,
            toNodeId: data.toNodeId || null,
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          toast.error(result.error || "Failed to add connection");
          return;
        }

        onTreeUpdate({ nodes: result.nodes, relationships: result.relationships });
        setShowAddForm(false);

        if (result.createdNode) {
          setSelectedNodeId(result.createdNode.id);
          toast.success(`${data.newPersonName} added to the tree`);
        } else {
          toast.success("Connection added");
        }
      } catch {
        toast.error("Failed to add connection");
      }
    },
    [celebrationId, onTreeUpdate]
  );

  const handleRemoveNode = useCallback(
    async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      if (nodeId === honoreeNodeId) {
        toast.error("You can't remove the person being celebrated");
        return;
      }

      if (!confirm(`Remove ${node.display_name} and all their connections?`))
        return;

      try {
        const res = await fetch(`/api/tree/${nodeId}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        toast.success(`${node.display_name} removed`);
        setSelectedNodeId(null);
        onRefresh();
      } catch {
        toast.error("Failed to remove");
      }
    },
    [nodes, honoreeNodeId, onRefresh]
  );

  const handleEditNode = useCallback(
    async (nodeId: string, data: Record<string, unknown>) => {
      try {
        const res = await fetch(`/api/tree/${nodeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error();
        toast.success("Updated");
        onRefresh();
      } catch {
        toast.error("Failed to update");
      }
    },
    [onRefresh]
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-lg font-semibold"
          style={{ color: COLORS.textPrimary }}
        >
          Family Tree ({nodes.length} {nodes.length === 1 ? "person" : "people"})
        </h2>
      </div>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg mb-2" style={{ color: COLORS.textPrimary }}>
            The person being celebrated will appear here
          </p>
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
            They were added when the celebration was created.
          </p>
        </div>
      )}

      {/* Tree + Detail layout */}
      {nodes.length > 0 && (
        <div className="flex gap-6">
          {/* Tree preview */}
          <div className="flex-1 min-w-0">
            <TreePreview
              nodes={nodes}
              relationships={relationships}
              honoreeNodeId={honoreeNodeId}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          </div>

          {/* Detail panel */}
          {selectedNode && (
            <div className="w-80 flex-shrink-0">
              <NodeDetail
                node={selectedNode}
                connections={getNodeConnections(selectedNode.id)}
                isHonoree={selectedNode.id === honoreeNodeId}
                canEdit={canEdit}
                onSelectNode={setSelectedNodeId}
                onAddConnection={() => setShowAddForm(true)}
                onEdit={(data) => handleEditNode(selectedNode.id, data)}
                onRemove={() => handleRemoveNode(selectedNode.id)}
              />
            </div>
          )}
        </div>
      )}

      {/* Add connection modal */}
      {showAddForm && selectedNode && canEdit && (
        <AddConnectionForm
          fromNode={selectedNode}
          existingNodes={nodes}
          existingRelationships={relationships}
          onSubmit={handleAddConnection}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
