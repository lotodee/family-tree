"use client";

import { useState, useEffect } from "react";
import type { FamilyTreeNode, AddTreeNodeFormData, Gender, NodeType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLORS, Z_INDEX } from "@/lib/config/design";

interface NodeFormProps {
  mode: "add_root" | "add_child" | "add_spouse" | "edit";
  nodes: FamilyTreeNode[];
  parentNodeId: string | null;
  spouseNodeId: string | null;
  editNode: FamilyTreeNode | null;
  onSubmit: (data: AddTreeNodeFormData) => void;
  onClose: () => void;
}

export function NodeForm({
  mode,
  nodes,
  parentNodeId,
  spouseNodeId,
  editNode,
  onSubmit,
  onClose,
}: NodeFormProps) {
  // Compute defaults based on mode
  const parent = parentNodeId
    ? nodes.find((n) => n.id === parentNodeId)
    : null;
  const partner = spouseNodeId
    ? nodes.find((n) => n.id === spouseNodeId)
    : null;

  const defaultGeneration = (() => {
    if (mode === "edit" && editNode) return editNode.generation;
    if (mode === "add_child" && parent) return parent.generation + 1;
    if (mode === "add_spouse" && partner) return partner.generation;
    return 0;
  })();

  const defaultBranch = (() => {
    if (mode === "edit" && editNode) return editNode.branch;
    if (mode === "add_child" && parent) {
      return parent.branch || parent.display_name.toLowerCase();
    }
    if (mode === "add_spouse" && partner) return partner.branch;
    return null;
  })();

  const defaultNodeType: NodeType = mode === "add_spouse" ? "spouse" : "biological";

  const [displayName, setDisplayName] = useState(editNode?.display_name || "");
  const [fullName, setFullName] = useState(editNode?.full_name || "");
  const [gender, setGender] = useState<Gender>(editNode?.gender || "unknown");
  const [isDeceased, setIsDeceased] = useState(editNode?.is_deceased || false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when mode changes
  useEffect(() => {
    if (mode === "edit" && editNode) {
      setDisplayName(editNode.display_name);
      setFullName(editNode.full_name || "");
      setGender(editNode.gender);
      setIsDeceased(editNode.is_deceased);
    } else if (mode !== "edit") {
      setDisplayName("");
      setFullName("");
      setGender("unknown");
      setIsDeceased(false);
    }
    setError("");
  }, [mode, editNode]);

  const handleSubmit = async () => {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError("Display name is required");
      return;
    }
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const data: AddTreeNodeFormData = {
      display_name: trimmedName,
      full_name: fullName.trim() || "",
      gender,
      generation: defaultGeneration,
      parent_node_id: mode === "add_child" ? parentNodeId : null,
      spouse_node_id: mode === "add_spouse" ? spouseNodeId : null,
      branch: defaultBranch,
      node_type: mode === "edit" ? (editNode?.node_type || "biological") : defaultNodeType,
      is_deceased: isDeceased,
    };

    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = (() => {
    switch (mode) {
      case "add_root":
        return "Add Person";
      case "add_child":
        return `Add Child of ${parent?.display_name || ""}`;
      case "add_spouse":
        return `Add Spouse of ${partner?.display_name || ""}`;
      case "edit":
        return `Edit ${editNode?.display_name || ""}`;
    }
  })();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: Z_INDEX.modal }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-xl p-6"
        style={{ backgroundColor: COLORS.white }}
      >
        <h2
          className="text-xl font-bold mb-4"
          style={{
            fontFamily: "var(--font-display)",
            color: COLORS.textPrimary,
          }}
        >
          {title}
        </h2>

        <div className="space-y-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g., Michael, Grandma Rose"
            error={error}
            autoFocus
          />

          <Input
            label="Full Name (optional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., Michael Ademiluyi Sr."
          />

          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: COLORS.textPrimary }}
            >
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
              style={{
                border: `1.5px solid ${COLORS.goldLight}`,
                backgroundColor: COLORS.white,
                color: COLORS.textPrimary,
              }}
            >
              <option value="unknown">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Read-only generation display */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: COLORS.textPrimary }}
            >
              Generation
            </label>
            <div
              className="px-4 py-3 rounded-lg text-sm"
              style={{
                backgroundColor: COLORS.cream,
                color: COLORS.textSecondary,
              }}
            >
              {defaultGeneration === 0
                ? "0 (Root)"
                : defaultGeneration === 1
                ? "1 (Child)"
                : defaultGeneration === 2
                ? "2 (Grandchild)"
                : `${defaultGeneration}`}
            </div>
          </div>

          {/* Deceased checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDeceased}
              onChange={(e) => setIsDeceased(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: COLORS.gold }}
            />
            <span className="text-sm" style={{ color: COLORS.textPrimary }}>
              Deceased
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!displayName.trim()}
            fullWidth
          >
            {mode === "edit" ? "Save Changes" : "Add Person"}
          </Button>
        </div>
      </div>
    </div>
  );
}
