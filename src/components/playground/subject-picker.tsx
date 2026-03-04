"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Search } from "lucide-react";
import type { FamilyTreeNode } from "@/types";

interface SubjectPickerProps {
  treeNodes: FamilyTreeNode[];
  selectedSubjects: FamilyTreeNode[];
  onSelect: (node: FamilyTreeNode) => void;
  onRemove: (nodeId: string) => void;
  maxSelections?: number;
}

export function SubjectPicker({
  treeNodes,
  selectedSubjects,
  onSelect,
  onRemove,
  maxSelections,
}: SubjectPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Group nodes by branch
  const groupedNodes = useMemo(() => {
    const filtered = treeNodes.filter(
      (node) =>
        node.display_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedSubjects.find((s) => s.id === node.id)
    );

    const groups: Record<string, FamilyTreeNode[]> = {};
    for (const node of filtered) {
      const branch = node.branch || "Other";
      if (!groups[branch]) groups[branch] = [];
      groups[branch].push(node);
    }
    return groups;
  }, [treeNodes, searchQuery, selectedSubjects]);

  const canAddMore = !maxSelections || selectedSubjects.length < maxSelections;
  const selectionHint = maxSelections
    ? maxSelections === 1
      ? "Pick 1 person"
      : `Pick ${maxSelections} people`
    : null;

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        {/* Selected subjects as chips */}
        <AnimatePresence>
          {selectedSubjects.map((subject) => (
            <motion.button
              key={subject.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => onRemove(subject.id)}
              className="flex items-center gap-2 rounded-full bg-[#C4973B] px-4 py-2 text-sm font-medium text-[#0F0A07] transition hover:bg-[#D4A74B]"
            >
              {subject.display_name}
              <X size={14} />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Add person button */}
        {canAddMore && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 rounded-full border border-[#2A2118] bg-[#1A1410] px-4 py-2 text-sm text-[#A89885] transition hover:border-[#C4973B] hover:text-[#FFF8F0]"
          >
            <Plus size={16} />
            Add person
          </button>
        )}

        {/* Selection hint */}
        {selectionHint && (
          <span className="text-sm text-[#A89885]">{selectionHint}</span>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown panel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 bottom-full z-20 mb-2 w-80 rounded-xl border border-[#2A2118] bg-[#1A1410] p-4 shadow-2xl"
            >
              {/* Search input */}
              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89885]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search family members..."
                  className="w-full rounded-lg border border-[#2A2118] bg-[#0F0A07] py-2 pl-10 pr-4 text-sm text-[#FFF8F0] placeholder-[#A89885] focus:border-[#C4973B] focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Grouped list */}
              <div className="max-h-64 space-y-4 overflow-y-auto">
                {Object.entries(groupedNodes).map(([branch, nodes]) => (
                  <div key={branch}>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#A89885]">
                      {branch}&apos;s Branch
                    </h4>
                    <div className="space-y-1">
                      {nodes.map((node) => (
                        <button
                          key={node.id}
                          onClick={() => {
                            onSelect(node);
                            if (
                              maxSelections &&
                              selectedSubjects.length + 1 >= maxSelections
                            ) {
                              setIsOpen(false);
                            }
                            setSearchQuery("");
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#FFF8F0] transition hover:bg-[#2A2118]"
                        >
                          {node.display_name}
                          {node.generation === 0 && (
                            <span className="ml-2 text-xs text-[#C4973B]">
                              Patriarch
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {Object.keys(groupedNodes).length === 0 && (
                  <p className="py-4 text-center text-sm text-[#A89885]">
                    No matching family members
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
