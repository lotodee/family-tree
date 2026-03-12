"use client";

import type { FamilyTreeNode } from "@/types";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/lib/config/design";
import { X } from "lucide-react";

interface NodeDetailProps {
  node: FamilyTreeNode;
  nodes: FamilyTreeNode[];
  canEdit: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onAddChild: () => void;
  onAddSpouse: () => void;
  onClose: () => void;
}

export function NodeDetail({
  node,
  nodes,
  canEdit,
  onEdit,
  onRemove,
  onAddChild,
  onAddSpouse,
  onClose,
}: NodeDetailProps) {
  // Look up relationships
  const parent = nodes.find((n) => n.id === node.parent_node_id);
  const spouse = nodes.find((n) => n.id === node.spouse_node_id);
  const children = nodes.filter(
    (n) => n.parent_node_id === node.id && n.node_type === "biological"
  );

  // Generate initials for avatar placeholder
  const initials = node.display_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const generationLabel = (() => {
    switch (node.generation) {
      case 0:
        return "Root";
      case 1:
        return "Child";
      case 2:
        return "Grandchild";
      case 3:
        return "Great-Grandchild";
      default:
        return `Generation ${node.generation}`;
    }
  })();

  const genderLabel =
    node.gender === "male"
      ? "Male"
      : node.gender === "female"
      ? "Female"
      : "Unknown";

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: COLORS.ivory,
        border: `1px solid ${COLORS.goldLight}`,
      }}
    >
      {/* Header with close button */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
            style={{
              backgroundColor: COLORS.goldLight,
              color: COLORS.burgundy,
            }}
          >
            {initials}
          </div>
          <div>
            <h3
              className="font-semibold"
              style={{
                fontFamily: "var(--font-display)",
                color: COLORS.textPrimary,
              }}
            >
              {node.display_name}
              {node.is_deceased && (
                <span style={{ color: COLORS.textSecondary }}> †</span>
              )}
            </h3>
            {node.full_name && (
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                {node.full_name}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full transition-colors hover:bg-black/5"
        >
          <X size={18} style={{ color: COLORS.textSecondary }} />
        </button>
      </div>

      {/* Info rows */}
      <div className="space-y-2 mb-4">
        <InfoRow label="Generation" value={`${node.generation} (${generationLabel})`} />
        <InfoRow label="Gender" value={genderLabel} />
        {node.branch && <InfoRow label="Branch" value={node.branch} />}
        <InfoRow
          label="Status"
          value={node.is_deceased ? "† Deceased" : "Active"}
        />
        <InfoRow
          label="Type"
          value={node.node_type === "spouse" ? "Spouse" : "Biological"}
        />
        <InfoRow
          label="Claimed"
          value={node.is_claimed ? "Yes" : "No"}
        />
      </div>

      {/* Relationships */}
      <div
        className="border-t pt-3 mb-4 space-y-2"
        style={{ borderColor: COLORS.goldLight }}
      >
        {parent && (
          <InfoRow label="Parent" value={parent.display_name} />
        )}
        {spouse && (
          <InfoRow label="Spouse" value={spouse.display_name} />
        )}
        {children.length > 0 && (
          <InfoRow
            label="Children"
            value={children.map((c) => c.display_name).join(", ")}
          />
        )}
        {!parent && !spouse && children.length === 0 && (
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
            No relationships yet
          </p>
        )}
      </div>

      {/* Actions */}
      {canEdit && (
        <div
          className="border-t pt-3 space-y-2"
          style={{ borderColor: COLORS.goldLight }}
        >
          <Button
            variant="secondary"
            onClick={onAddChild}
            fullWidth
            size="sm"
          >
            + Add Child
          </Button>
          {!spouse && (
            <Button
              variant="secondary"
              onClick={onAddSpouse}
              fullWidth
              size="sm"
            >
              + Add Spouse
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onEdit}
            fullWidth
            size="sm"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={onRemove}
            fullWidth
            size="sm"
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: COLORS.textSecondary }}>{label}</span>
      <span className="font-medium" style={{ color: COLORS.textPrimary }}>
        {value}
      </span>
    </div>
  );
}
