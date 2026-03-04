"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { FamilyTreeNode, LLMSession } from "@/types";
import { PROMPT_TEMPLATES, type PromptTemplate } from "@/lib/gemini/prompts";
import { SubjectPicker } from "@/components/playground/subject-picker";
import { ResponseDisplay } from "@/components/playground/response-display";
import { PromptInput } from "@/components/playground/prompt-input";
import { TemplateBar } from "@/components/playground/template-bar";
import { HistorySidebar } from "@/components/playground/history-sidebar";

interface PlaygroundClientProps {
  treeNodes: FamilyTreeNode[];
  recentSessions: LLMSession[];
}

export function PlaygroundClient({
  treeNodes,
  recentSessions,
}: PlaygroundClientProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<FamilyTreeNode[]>(
    []
  );
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(
    null
  );
  const [promptText, setPromptText] = useState("");
  const [scenarioText, setScenarioText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [showImageLoader, setShowImageLoader] = useState(false);
  const [history, setHistory] = useState<LLMSession[]>(recentSessions);
  const [showHistory, setShowHistory] = useState(true);

  const handleSelectSubject = useCallback((node: FamilyTreeNode) => {
    setSelectedSubjects((prev) => {
      if (prev.find((s) => s.id === node.id)) return prev;
      return [...prev, node];
    });
  }, []);

  const handleRemoveSubject = useCallback((nodeId: string) => {
    setSelectedSubjects((prev) => prev.filter((s) => s.id !== nodeId));
  }, []);

  const handleSelectTemplate = useCallback((template: PromptTemplate) => {
    setActiveTemplate(template);
    setScenarioText("");
  }, []);

  const sendPrompt = useCallback(async () => {
    if (isStreaming) return;
    if (!promptText.trim() && !activeTemplate) return;

    // Build the final prompt
    let finalPrompt = promptText;
    if (activeTemplate && activeTemplate.key !== "free") {
      const names = selectedSubjects.map((s) => s.display_name);
      finalPrompt = activeTemplate.buildPrompt(names, scenarioText);
      // Append any custom text the host added
      if (promptText.trim()) {
        finalPrompt += `\n\nAdditional note from the host: ${promptText}`;
      }
    }

    setIsStreaming(true);
    setCurrentResponse("");
    setCurrentImage(null);

    try {
      const response = await fetch("/api/llm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          subjectIds: selectedSubjects.map((s) => s.id),
          templateKey: activeTemplate?.key,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      // Read the SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // Parse SSE events (may contain multiple events in one chunk)
        const events = chunk.split("\n\n").filter(Boolean);

        for (const event of events) {
          if (event.startsWith("data: ")) {
            try {
              const data = JSON.parse(event.slice(6));
              if (data.error) {
                setCurrentResponse((prev) => prev + "\n\n⚠️ " + data.error);
                break;
              }
              if (data.text) {
                setCurrentResponse((prev) => prev + data.text);
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      }

      // Add to history
      const newSession: LLMSession = {
        id: crypto.randomUUID(),
        prompt: finalPrompt,
        response_text: currentResponse,
        image_url: null,
        subjects: selectedSubjects.map((s) => s.id),
        created_at: new Date().toISOString(),
      };
      setHistory((prev) => [newSession, ...prev]);
    } catch {
      setCurrentResponse("Something went wrong. Let's try that again!");
    } finally {
      setIsStreaming(false);
      // Clear inputs for next prompt
      setPromptText("");
      setScenarioText("");
    }
  }, [
    promptText,
    activeTemplate,
    selectedSubjects,
    scenarioText,
    isStreaming,
    currentResponse,
  ]);

  const generateImage = useCallback(async () => {
    if (isStreaming) return;

    setShowImageLoader(true);
    setCurrentResponse("");
    setCurrentImage(null);

    const names = selectedSubjects.map((s) => s.display_name);
    const prompt =
      promptText ||
      `Create a portrait that captures the personality of ${names.join(" and ")}`;

    try {
      const response = await fetch("/api/llm/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          subjectIds: selectedSubjects.map((s) => s.id),
        }),
      });

      const data = await response.json();

      if (data.imageUrl) {
        setCurrentImage(data.imageUrl);
      } else {
        // Tier 2 fallback: show the image description as text
        setCurrentResponse(
          `🎨 Here's how the AI imagines it:\n\n${data.imageDescription}\n\n(Image generation wasn't available — but paint this picture in your minds!)`
        );
      }
    } catch {
      setCurrentResponse(
        "Image generation failed. Let's try a text response instead!"
      );
    } finally {
      setShowImageLoader(false);
    }
  }, [promptText, selectedSubjects, isStreaming]);

  const handleHistorySelect = useCallback((session: LLMSession) => {
    setCurrentResponse(session.response_text || "");
    setCurrentImage(session.image_url);
  }, []);

  // Calculate max selections based on active template
  const maxSelections =
    activeTemplate?.subjectCount === "one"
      ? 1
      : activeTemplate?.subjectCount === "two"
        ? 2
        : undefined;

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#FFF8F0]">
      {/* Header */}
      <header className="border-b border-[#2A2118] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl tracking-[0.25em] text-[#C4973B]">
              ✦ MICHAEL ADEMILUYI&apos;S 100TH ✦
            </h1>
            <p className="mt-1 text-sm text-[#A89885]">
              The Ademiluyi Family AI
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="rounded-lg bg-[#1A1410] px-4 py-2 text-sm text-[#A89885] transition hover:bg-[#2A2118] lg:hidden"
          >
            {showHistory ? "Hide History" : "Show History"}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {/* Response Display */}
          <ResponseDisplay
            text={currentResponse}
            imageUrl={currentImage}
            isStreaming={isStreaming}
            isLoadingImage={showImageLoader}
          />

          {/* Template Bar */}
          <div className="mt-6">
            <TemplateBar
              templates={PROMPT_TEMPLATES}
              activeTemplate={activeTemplate}
              onSelectTemplate={handleSelectTemplate}
              scenarioText={scenarioText}
              onScenarioChange={setScenarioText}
            />
          </div>

          {/* Subject Picker */}
          <div className="mt-4">
            <SubjectPicker
              treeNodes={treeNodes}
              selectedSubjects={selectedSubjects}
              onSelect={handleSelectSubject}
              onRemove={handleRemoveSubject}
              maxSelections={maxSelections}
            />
          </div>

          {/* Prompt Input */}
          <div className="mt-4">
            <PromptInput
              value={promptText}
              onChange={setPromptText}
              onSend={sendPrompt}
              onGenerateImage={generateImage}
              isStreaming={isStreaming}
              isLoadingImage={showImageLoader}
              placeholder={
                activeTemplate?.key === "free"
                  ? "Type your custom prompt..."
                  : activeTemplate
                    ? "Add extra instructions (optional)..."
                    : "Select a template above or type a custom prompt..."
              }
            />
          </div>
        </main>

        {/* History Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: showHistory ? 320 : 0,
            opacity: showHistory ? 1 : 0,
          }}
          className="hidden overflow-hidden border-l border-[#2A2118] lg:block"
        >
          <HistorySidebar
            sessions={history}
            onSelectSession={handleHistorySelect}
          />
        </motion.aside>
      </div>

      {/* Mobile History Drawer */}
      {showHistory && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="fixed inset-x-0 bottom-0 top-1/2 border-t border-[#2A2118] bg-[#0F0A07] lg:hidden"
        >
          <HistorySidebar
            sessions={history}
            onSelectSession={(session) => {
              handleHistorySelect(session);
              setShowHistory(false);
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
