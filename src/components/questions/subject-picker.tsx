"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import type { FamilyTreeNode, Answer } from "@/types";

interface SubjectPickerProps {
  treeNodes: FamilyTreeNode[];
  userTreeNodeId: string;
  existingAnswers: Answer[];
  onSelectSubject: (nodeId: string) => void;
}

export function SubjectPicker({
  treeNodes,
  userTreeNodeId,
  existingAnswers,
  onSelectSubject,
}: SubjectPickerProps) {
  // Group nodes by branch, excluding current user
  const groupedByBranch = useMemo(() => {
    const groups: Record<string, FamilyTreeNode[]> = {};

    treeNodes
      .filter((node) => node.id !== userTreeNodeId)
      .forEach((node) => {
        const branch = node.branch || "Other";
        if (!groups[branch]) groups[branch] = [];
        groups[branch].push(node);
      });

    // Sort branches alphabetically, but put "Other" last
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    });
  }, [treeNodes, userTreeNodeId]);

  // Count answers per subject (for "about_other" questions)
  const answerCountBySubject = useMemo(() => {
    const counts: Record<string, number> = {};
    existingAnswers.forEach((answer) => {
      if (answer.subject_id !== userTreeNodeId) {
        counts[answer.subject_id] = (counts[answer.subject_id] || 0) + 1;
      }
    });
    return counts;
  }, [existingAnswers, userTreeNodeId]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[var(--color-burgundy)]">
          Who would you like to talk about?
        </h2>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Pick a family member and answer fun questions about them.
        </p>
      </div>

      <div className="space-y-6">
        {groupedByBranch.map(([branch, nodes]) => (
          <div key={branch}>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              {branch} Branch
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {nodes.map((node) => {
                const answerCount = answerCountBySubject[node.id] || 0;
                const hasAnswers = answerCount > 0;

                return (
                  <button
                    key={node.id}
                    onClick={() => onSelectSubject(node.id)}
                    className="relative flex flex-col items-center rounded-xl border border-[var(--color-gold-light)] bg-white p-4 transition-all hover:border-[var(--color-gold)] hover:shadow-md"
                  >
                    {/* Avatar placeholder */}
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gold-light)] text-lg font-semibold text-[var(--color-burgundy)]">
                      {node.display_name.charAt(0)}
                    </div>

                    <span className="text-center text-sm font-medium text-[var(--color-text-primary)]">
                      {node.display_name}
                    </span>

                    {/* Progress badge */}
                    {hasAnswers && (
                      <span className="mt-1 flex items-center gap-1 rounded-full bg-[var(--color-success)]/10 px-2 py-0.5 text-xs text-[var(--color-success)]">
                        <Check className="h-3 w-3" />
                        {answerCount}/10
                      </span>
                    )}

                    {/* Unclaimed indicator */}
                    {!node.is_claimed && (
                      <span className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        Not joined yet
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
