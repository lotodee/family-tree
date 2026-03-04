"use client";

import { motion } from "framer-motion";
import type { PromptTemplate } from "@/lib/gemini/prompts";

interface TemplateBarProps {
  templates: PromptTemplate[];
  activeTemplate: PromptTemplate | null;
  onSelectTemplate: (template: PromptTemplate) => void;
  scenarioText: string;
  onScenarioChange: (value: string) => void;
}

export function TemplateBar({
  templates,
  activeTemplate,
  onSelectTemplate,
  scenarioText,
  onScenarioChange,
}: TemplateBarProps) {
  return (
    <div className="space-y-4">
      {/* Template Buttons */}
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => {
          const isActive = activeTemplate?.key === template.key;
          return (
            <button
              key={template.key}
              onClick={() => onSelectTemplate(template)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-[#C4973B] text-[#0F0A07]"
                  : "border border-[#2A2118] bg-[#1A1410] text-[#A89885] hover:border-[#C4973B] hover:text-[#FFF8F0]"
              }`}
            >
              <span>{template.icon}</span>
              <span>{template.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Template Description */}
      {activeTemplate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-lg border border-[#2A2118] bg-[#1A1410] p-4"
        >
          <p className="text-sm text-[#A89885]">{activeTemplate.description}</p>

          {/* Scenario Input (for templates that need it) */}
          {activeTemplate.scenarioInput && (
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-[#A89885]">
                {activeTemplate.key === "what_if"
                  ? "What's the scenario?"
                  : "What's the question?"}
              </label>
              <input
                type="text"
                value={scenarioText}
                onChange={(e) => onScenarioChange(e.target.value)}
                placeholder={
                  activeTemplate.key === "what_if"
                    ? "e.g., they became President of Nigeria"
                    : "e.g., cook the best jollof rice"
                }
                className="w-full rounded-lg border border-[#2A2118] bg-[#0F0A07] px-4 py-2 text-sm text-[#FFF8F0] placeholder-[#A89885] focus:border-[#C4973B] focus:outline-none"
              />
            </div>
          )}

          {/* Subject count hint */}
          {activeTemplate.subjectCount !== "any" &&
            activeTemplate.subjectCount !== "none" && (
              <p className="mt-2 text-xs text-[#C4973B]">
                {activeTemplate.subjectCount === "one"
                  ? "Select 1 family member below"
                  : "Select 2 family members below"}
              </p>
            )}
        </motion.div>
      )}
    </div>
  );
}
