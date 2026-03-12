"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { COLORS } from "@/lib/config/design";
import { getRelationshipOptions } from "@/lib/utils/relationships";
import { X } from "lucide-react";
import type { FamilyTreeNode, FamilyRelationship, RelationshipType, Gender } from "@/types";

interface Props {
  fromNode: FamilyTreeNode;
  existingNodes: FamilyTreeNode[];
  existingRelationships: FamilyRelationship[];
  onSubmit: (data: {
    fromNodeId: string;
    relationshipType: string;
    newPersonName: string;
    newPersonGender: string;
    toNodeId?: string;
  }) => void;
  onClose: () => void;
}

function preSelectGender(type: RelationshipType): Gender {
  const femaleTypes: RelationshipType[] = [
    "wife",
    "daughter",
    "mother",
    "sister",
    "aunt",
    "niece",
  ];
  const maleTypes: RelationshipType[] = [
    "husband",
    "son",
    "father",
    "brother",
    "uncle",
    "nephew",
  ];
  if (femaleTypes.includes(type)) return "female";
  if (maleTypes.includes(type)) return "male";
  return "unknown";
}

export function AddConnectionForm({
  fromNode,
  existingNodes,
  existingRelationships,
  onSubmit,
  onClose,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<RelationshipType | null>(null);
  const [personName, setPersonName] = useState("");
  const [personGender, setPersonGender] = useState<Gender>("unknown");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const relationshipOptions = getRelationshipOptions();

  // Check if a relationship type already exists for this person
  const existingTypes = new Set(
    existingRelationships
      .filter((r) => r.from_node_id === fromNode.id)
      .map((r) => r.relationship_type)
  );

  const handleSelectType = (type: RelationshipType) => {
    setSelectedType(type);
    setPersonGender(preSelectGender(type));
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedType || !personName.trim()) return;

    setIsSubmitting(true);
    await onSubmit({
      fromNodeId: fromNode.id,
      relationshipType: selectedType,
      newPersonName: personName.trim(),
      newPersonGender: personGender,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100"
        >
          <X size={20} style={{ color: COLORS.textSecondary }} />
        </button>

        {/* Step 1: Pick relationship type */}
        {step === 1 && (
          <>
            <h2
              className="text-lg font-bold mb-2"
              style={{ color: COLORS.textPrimary }}
            >
              Add a connection
            </h2>
            <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
              This person is <strong>{fromNode.display_name}</strong>'s:
            </p>

            <div className="space-y-4">
              {relationshipOptions.map((group) => (
                <div key={group.label}>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.types.map(({ value, label }) => {
                      const isUsed = existingTypes.has(value);
                      // For spouse types, only allow one
                      const isSpouseType = value === "wife" || value === "husband";
                      const hasSpouse = existingTypes.has("wife") || existingTypes.has("husband");
                      const disabled = isSpouseType && hasSpouse;

                      return (
                        <button
                          key={value}
                          onClick={() => !disabled && handleSelectType(value)}
                          disabled={disabled}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            disabled
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-[var(--color-gold-light)]"
                          }`}
                          style={{
                            backgroundColor: COLORS.ivory,
                            border: `1px solid ${COLORS.goldLight}`,
                            color: COLORS.textPrimary,
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t" style={{ borderColor: COLORS.goldLight }}>
              <Button variant="secondary" fullWidth onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Enter person details */}
        {step === 2 && selectedType && (
          <>
            <h2
              className="text-lg font-bold mb-2"
              style={{ color: COLORS.textPrimary }}
            >
              Add {fromNode.display_name}'s{" "}
              {selectedType.charAt(0).toLowerCase() + selectedType.slice(1)}
            </h2>
            <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
              Enter their details:
            </p>

            <div className="space-y-4">
              <Input
                label="Name"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Enter their name"
                autoFocus
              />

              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: COLORS.textPrimary }}
                >
                  Gender
                </label>
                <select
                  value={personGender}
                  onChange={(e) => setPersonGender(e.target.value as Gender)}
                  className="w-full h-12 px-4 rounded-lg border text-base"
                  style={{
                    backgroundColor: COLORS.ivory,
                    borderColor: COLORS.goldLight,
                    color: COLORS.textPrimary,
                  }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div
              className="mt-6 pt-4 border-t flex gap-2"
              style={{ borderColor: COLORS.goldLight }}
            >
              <Button
                variant="secondary"
                onClick={() => {
                  setStep(1);
                  setSelectedType(null);
                  setPersonName("");
                }}
              >
                ← Back
              </Button>
              <Button
                fullWidth
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!personName.trim()}
              >
                Add to Tree
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
