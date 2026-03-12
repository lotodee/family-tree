"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { COLORS } from "@/lib/config/design";
import { getRelationshipLabel } from "@/lib/utils/relationships";
import { X } from "lucide-react";
import type { FamilyTreeNode, FamilyRelationship, RelationshipType, Gender } from "@/types";

interface Connection {
  relationship: FamilyRelationship;
  relatedNode: FamilyTreeNode;
}

interface Props {
  node: FamilyTreeNode;
  connections: Connection[];
  isHonoree: boolean;
  canEdit: boolean;
  onSelectNode: (id: string) => void;
  onAddConnection: () => void;
  onEdit: (data: Record<string, unknown>) => void;
  onRemove: () => void;
}

export function NodeDetail({
  node,
  connections,
  isHonoree,
  canEdit,
  onSelectNode,
  onAddConnection,
  onEdit,
  onRemove,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.display_name);
  const [editGender, setEditGender] = useState<Gender>(node.gender);
  const [editDeceased, setEditDeceased] = useState(node.is_deceased);

  const handleSave = () => {
    onEdit({
      displayName: editName,
      gender: editGender,
      isDeceased: editDeceased,
    });
    setIsEditing(false);
  };

  const genderLabel =
    node.gender === "male" ? "Male" : node.gender === "female" ? "Female" : "Unknown";

  // Group connections by type
  const groupedConnections = connections.reduce((acc, conn) => {
    const type = conn.relationship.relationship_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(conn);
    return acc;
  }, {} as Record<string, Connection[]>);

  return (
    <Card className="p-4">
      {/* Header with close */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mb-2"
              autoFocus
            />
          ) : (
            <h3
              className="text-lg font-bold"
              style={{ color: COLORS.textPrimary }}
            >
              {node.display_name}
              {node.is_deceased && " †"}
            </h3>
          )}

          {/* Gender + Honoree badge */}
          <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <select
                value={editGender}
                onChange={(e) => setEditGender(e.target.value as Gender)}
                className="text-sm px-2 py-1 rounded border"
                style={{
                  borderColor: COLORS.goldLight,
                  backgroundColor: COLORS.ivory,
                }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            ) : (
              <span
                className="text-sm"
                style={{ color: COLORS.textSecondary }}
              >
                {genderLabel}
              </span>
            )}

            {isHonoree && (
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: COLORS.gold,
                  color: "white",
                }}
              >
                ★ Being Celebrated
              </span>
            )}
          </div>

          {/* Deceased checkbox in edit mode */}
          {isEditing && (
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input
                type="checkbox"
                checked={editDeceased}
                onChange={(e) => setEditDeceased(e.target.checked)}
              />
              <span style={{ color: COLORS.textSecondary }}>Deceased</span>
            </label>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={() => onSelectNode(node.id)}
            className="p-1 rounded hover:bg-gray-100"
            title="Close"
          >
            <X size={18} style={{ color: COLORS.textSecondary }} />
          </button>
        )}
      </div>

      {/* Edit mode save/cancel */}
      {isEditing && (
        <div className="flex gap-2 mb-4">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setIsEditing(false);
              setEditName(node.display_name);
              setEditGender(node.gender);
              setEditDeceased(node.is_deceased);
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Connections */}
      {!isEditing && connections.length > 0 && (
        <div className="mb-4">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: COLORS.textSecondary }}
          >
            Connections
          </p>
          <div className="space-y-1">
            {Object.entries(groupedConnections).map(([type, conns]) => (
              <div key={type}>
                {conns.map((conn) => (
                  <button
                    key={conn.relationship.id}
                    onClick={() => onSelectNode(conn.relatedNode.id)}
                    className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-[var(--color-ivory)] transition-colors"
                  >
                    <span
                      className="text-xs"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {getRelationshipLabel(type as RelationshipType)}:
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {conn.relatedNode.display_name}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No connections message */}
      {!isEditing && connections.length === 0 && (
        <p
          className="text-sm mb-4"
          style={{ color: COLORS.textSecondary }}
        >
          No connections yet
        </p>
      )}

      {/* Actions */}
      {!isEditing && canEdit && (
        <div
          className="pt-4 border-t space-y-2"
          style={{ borderColor: COLORS.goldLight }}
        >
          <Button size="sm" fullWidth onClick={onAddConnection}>
            + Add Connection
          </Button>
          <Button size="sm" variant="secondary" fullWidth onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          {!isHonoree && (
            <Button
              size="sm"
              variant="secondary"
              fullWidth
              onClick={onRemove}
              className="!text-red-600 hover:!bg-red-50"
            >
              Remove
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
