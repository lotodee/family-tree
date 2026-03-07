"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { FamilyTreeNode, LLMSession } from "@/types";
import { SubjectPicker } from "@/components/playground/subject-picker";
import { ResponseDisplay } from "@/components/playground/response-display";
import { PromptInput, type ImageStyle } from "@/components/playground/prompt-input";
import { HistorySidebar } from "@/components/playground/history-sidebar";
import { StarIcon, RefreshIcon, HomeIcon } from "@/components/icons";

// Sprint 5: Smart Context imports
import {
  fetchAllFamilyData,
  type FamilyDataCache,
} from "@/lib/playground/prefetch";
import {
  buildContextFromCache,
  buildMultiContextFromCache,
  buildFamilySummaryFromCache,
} from "@/lib/playground/context-builder";
import {
  resolveSubjectNames,
  resolveDropdownSelections,
} from "@/lib/playground/resolve-subjects";
import type { ParsedPrompt } from "@/lib/playground/prompt-parser";

interface PlaygroundClientProps {
  treeNodes: FamilyTreeNode[];
  recentSessions: LLMSession[];
}

export function PlaygroundClient({
  treeNodes,
  recentSessions,
}: PlaygroundClientProps) {
  // Existing state
  const [selectedSubjects, setSelectedSubjects] = useState<FamilyTreeNode[]>(
    []
  );
  const [promptText, setPromptText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageExplanation, setImageExplanation] = useState<string | null>(null);
  const [showImageLoader, setShowImageLoader] = useState(false);
  const [history, setHistory] = useState<LLMSession[]>(recentSessions);
  const [showHistory, setShowHistory] = useState(true);
  const [imageStyle, setImageStyle] = useState<ImageStyle>("cartoony");

  // Sprint 5: Cache state
  const [cache, setCache] = useState<FamilyDataCache | null>(null);
  const [isLoadingCache, setIsLoadingCache] = useState(true);
  const [cacheError, setCacheError] = useState<string | null>(null);

  // Sprint 5: Prefetch on mount
  useEffect(() => {
    async function loadCache() {
      console.log("\x1b[36m[TEMP] 📥 Starting prefetch...\x1b[0m");
      try {
        const data = await fetchAllFamilyData();
        setCache(data);
        console.log("\x1b[32m[TEMP] ✅ Cache loaded\x1b[0m");
      } catch (error) {
        console.log("\x1b[31m[TEMP] ❌ Cache failed:", error, "\x1b[0m");
        setCacheError("Failed to load family data. Using fallback mode.");
      } finally {
        setIsLoadingCache(false);
      }
    }
    loadCache();
  }, []);

  const handleSelectSubject = useCallback((node: FamilyTreeNode) => {
    setSelectedSubjects((prev) => {
      if (prev.find((s) => s.id === node.id)) return prev;
      return [...prev, node];
    });
  }, []);

  const handleRemoveSubject = useCallback((nodeId: string) => {
    setSelectedSubjects((prev) => prev.filter((s) => s.id !== nodeId));
  }, []);

  // Sprint 5: Unified send function with smart context
  const sendUnified = useCallback(async () => {
    if (isStreaming || showImageLoader) return;
    if (!promptText.trim()) return;

    console.log("\x1b[36m[TEMP] 🚀 Starting unified send\x1b[0m");

    setIsStreaming(true);
    setCurrentResponse("");
    setCurrentImage(null);
    setImageExplanation(null);

    try {
      let finalSubjectIds: string[] = [];
      let mediaType: "text" | "image" | "video" = "text";
      let context: string | undefined;

      // Step 1: Determine subjects
      if (selectedSubjects.length > 0) {
        // Dropdown selection takes priority - skip LLM extraction
        console.log("\x1b[33m[TEMP] 📋 Using dropdown selection\x1b[0m");
        const resolved = resolveDropdownSelections(selectedSubjects);
        finalSubjectIds = resolved.nodeIds;
      } else if (cache) {
        // No dropdown selection - parse prompt for names and media type
        console.log("\x1b[36m[TEMP] 🔍 Parsing prompt for subjects...\x1b[0m");

        try {
          const parseResponse = await fetch("/api/playground/parse-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: promptText,
              familyNames: cache.allFamilyNames,
            }),
          });

          const parsed: ParsedPrompt = await parseResponse.json();
          console.log(
            "\x1b[35m[TEMP] 🎨 Parsed result:",
            JSON.stringify({ subjects: parsed.subjects, mediaType: parsed.mediaType }),
            "\x1b[0m"
          );

          mediaType = parsed.mediaType || "text";

          // Resolve extracted names to node IDs
          const resolved = resolveSubjectNames(cache, parsed.subjects);
          finalSubjectIds = resolved.nodeIds;

          // If extraction found specific subjects, media detection still applies
          // but we've already got the subjects
        } catch (error) {
          console.log("\x1b[31m[TEMP] ❌ Parse failed, continuing with defaults:", error, "\x1b[0m");
          // Continue without extraction - will use family summary
        }
      }

      // Step 2: Build context from cache (instant, no DB call)
      if (cache) {
        console.log("\x1b[33m[TEMP] ⚡ Building context from cache\x1b[0m");
        if (finalSubjectIds.length === 0) {
          context = buildFamilySummaryFromCache(cache);
        } else if (finalSubjectIds.length === 1) {
          context = buildContextFromCache(cache, finalSubjectIds[0]);
        } else {
          context = buildMultiContextFromCache(cache, finalSubjectIds);
        }
      }
      // If no cache, context remains undefined and server will build it

      // Step 3: Route to appropriate generation based on media type
      console.log("\x1b[35m[TEMP] 🎯 Media type:", mediaType, "\x1b[0m");

      if (mediaType === "image") {
        await generateImageWithContext(promptText, finalSubjectIds, context, imageStyle);
      } else if (mediaType === "video") {
        // Video: fall back to text with video-style prompt
        const videoPrompt = `The host wants a video about this. Since we can't generate video yet, describe in vivid detail what this video would look like — the scenes, the music, the energy. Make it so vivid the audience can picture it.\n\nOriginal request: ${promptText}`;
        setCurrentResponse("Video generation is coming soon! Here's what it would look like:\n\n");
        await streamTextResponse(videoPrompt, finalSubjectIds, context);
      } else {
        // Default: text streaming
        await streamTextResponse(promptText, finalSubjectIds, context);
      }
    } catch (error) {
      console.log("\x1b[31m[TEMP] ❌ Send failed:", error, "\x1b[0m");
      setCurrentResponse("Something went wrong. Let's try that again!");
    } finally {
      setIsStreaming(false);
      setPromptText("");
    }
  }, [promptText, selectedSubjects, cache, isStreaming, showImageLoader, imageStyle]);

  // Stream text response with pre-built context
  const streamTextResponse = useCallback(
    async (prompt: string, subjectIds: string[], context?: string) => {
      console.log("\x1b[36m[TEMP] 📤 Sending text generation request\x1b[0m");

      const response = await fetch("/api/llm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          subjectIds,
          context, // Pass pre-built context
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
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
                fullResponse += data.text;
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
        prompt,
        response_text: fullResponse,
        image_url: null,
        subjects: subjectIds,
        created_at: new Date().toISOString(),
      };
      setHistory((prev) => [newSession, ...prev]);
    },
    []
  );

  // Generate image with pre-built context
  const generateImageWithContext = useCallback(
    async (prompt: string, subjectIds: string[], context?: string, style: ImageStyle = "cartoony") => {
      console.log("\x1b[36m[TEMP] 🖼️ Sending image generation request, style:", style, "\x1b[0m");

      setShowImageLoader(true);

      try {
        const response = await fetch("/api/llm/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            subjectIds,
            context, // Pass pre-built context
            style,   // Pass image style
          }),
        });

        const data = await response.json();

        if (data.imageUrl) {
          setCurrentImage(data.imageUrl);
          setImageExplanation(data.imageExplanation || null);
          setCurrentResponse(""); // Clear text response when showing image
        } else {
          setCurrentResponse(
            `Here's how the AI imagines it:\n\n${data.imageDescription}\n\n${data.imageExplanation ? `${data.imageExplanation}\n\n` : ""}(Image generation wasn't available — but paint this picture in your minds!)`
          );
        }

        // Add to history
        const newSession: LLMSession = {
          id: crypto.randomUUID(),
          prompt,
          response_text: data.imageDescription || "",
          image_url: data.imageUrl || null,
          subjects: subjectIds,
          created_at: new Date().toISOString(),
        };
        setHistory((prev) => [newSession, ...prev]);
      } catch (error) {
        console.log("\x1b[31m[TEMP] ❌ Image generation failed:", error, "\x1b[0m");
        setCurrentResponse(
          "Image generation failed. Let's try a text response instead!"
        );
      } finally {
        setShowImageLoader(false);
      }
    },
    []
  );

  // Legacy functions (now just call unified send)
  const sendPrompt = useCallback(() => {
    sendUnified();
  }, [sendUnified]);

  const generateImage = useCallback(async () => {
    if (isStreaming || showImageLoader) return;

    const names = selectedSubjects.map((s) => s.display_name);
    const prompt =
      promptText ||
      `Create a portrait that captures the personality of ${names.join(" and ")}`;

    // Build context from cache if available
    let context: string | undefined;
    if (cache) {
      const subjectIds = selectedSubjects.map((s) => s.id);
      if (subjectIds.length === 0) {
        context = buildFamilySummaryFromCache(cache);
      } else if (subjectIds.length === 1) {
        context = buildContextFromCache(cache, subjectIds[0]);
      } else {
        context = buildMultiContextFromCache(cache, subjectIds);
      }
    }

    await generateImageWithContext(
      prompt,
      selectedSubjects.map((s) => s.id),
      context,
      imageStyle
    );
    setPromptText("");
  }, [promptText, selectedSubjects, isStreaming, showImageLoader, cache, generateImageWithContext, imageStyle]);

  const handleHistorySelect = useCallback((session: LLMSession) => {
    setCurrentResponse(session.response_text || "");
    setCurrentImage(session.image_url);
  }, []);

  // Refresh cache manually
  const refreshCache = useCallback(async () => {
    console.log("\x1b[36m[TEMP] 🔄 Refreshing cache...\x1b[0m");
    setIsLoadingCache(true);
    setCacheError(null);
    try {
      const data = await fetchAllFamilyData();
      setCache(data);
      console.log("\x1b[32m[TEMP] ✅ Cache refreshed\x1b[0m");
    } catch (error) {
      console.log("\x1b[31m[TEMP] ❌ Cache refresh failed:", error, "\x1b[0m");
      setCacheError("Failed to refresh. Using existing data.");
    } finally {
      setIsLoadingCache(false);
    }
  }, []);

  return (
    <div className="text-[#FFF8F0]">
      {/* Header */}
      <header className="relative border-b border-[#2A2118]/50 bg-gradient-to-b from-[#1A1410] to-transparent px-6 py-5">
        {/* Decorative gold line */}
        <div className="absolute bottom-0 left-1/2 h-[1px] w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#C4973B]/50 to-transparent" />

        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Home button */}
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2118] bg-[#0F0A07] text-[#A89885] transition hover:border-[#C4973B]/50 hover:text-[#C4973B]"
              title="Back to Dashboard"
            >
              <HomeIcon size={16} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C4973B]/30 bg-[#C4973B]/10">
                <StarIcon size={18} className="text-[#C4973B]" />
              </div>
              <div>
                <h1 className="font-serif text-lg font-medium tracking-wide text-[#FFF8F0]">
                  Family AI Playground
                </h1>
                <p className="flex items-center gap-2 text-xs text-[#A89885]">
                  <span>Michael Ademiluyi&apos;s 100th Celebration</span>
                  {isLoadingCache && (
                    <span className="flex items-center gap-1 text-[#C4973B]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C4973B]" />
                      Loading...
                    </span>
                  )}
                  {cacheError && (
                    <span className="flex items-center gap-1 text-red-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      Error
                    </span>
                  )}
                  {cache && !isLoadingCache && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Ready
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {cache && (
              <button
                onClick={refreshCache}
                disabled={isLoadingCache}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2118] bg-[#0F0A07] text-[#A89885] transition hover:border-[#C4973B]/50 hover:text-[#C4973B] disabled:opacity-50"
                title="Refresh family data"
              >
                <RefreshIcon size={16} isSpinning={isLoadingCache} />
              </button>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="hidden rounded-full border border-[#2A2118] bg-[#0F0A07] px-4 py-2 text-xs font-medium text-[#A89885] transition hover:border-[#C4973B]/50 hover:text-[#C4973B] lg:block"
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-81px)]">
        {/* Main Content Area - flex column to push input to bottom */}
        <main
          className={`flex flex-1 flex-col transition-all duration-300 ${
            showHistory ? "lg:mr-[320px]" : "lg:mr-[40px]"
          }`}
        >
          {/* Response Area - fills remaining space */}
          <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
            {/* Loading overlay */}
            {isLoadingCache && (
              <div className="mb-4 rounded-lg border border-[#C4973B]/30 bg-[#1A1410] p-4 text-center">
                <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-[#C4973B] border-t-transparent" />
                <p className="text-sm text-[#C4973B]">Preparing family data...</p>
              </div>
            )}

            {/* Response Display - fills all available space */}
            <div className="flex-1">
              <ResponseDisplay
                text={currentResponse}
                imageUrl={currentImage}
                imageExplanation={imageExplanation}
                isStreaming={isStreaming}
                isLoadingImage={showImageLoader}
              />
            </div>
          </div>

          {/* Input Area - fixed at bottom */}
          <div className="flex-shrink-0 border-t border-[#2A2118] bg-[#0F0A07] px-6 py-4">
            {/* Subject Picker */}
            <div className="mb-3">
              <SubjectPicker
                treeNodes={treeNodes}
                selectedSubjects={selectedSubjects}
                onSelect={handleSelectSubject}
                onRemove={handleRemoveSubject}
              />
            </div>

            {/* Prompt Input */}
            <PromptInput
              value={promptText}
              onChange={setPromptText}
              onSend={sendPrompt}
              onGenerateImage={generateImage}
              isStreaming={isStreaming}
              isLoadingImage={showImageLoader}
              placeholder={
                cache
                  ? "Ask me anything about the family... (try: 'Introduce Dotun in the funniest way')"
                  : "Loading family data..."
              }
              imageStyle={imageStyle}
              onImageStyleChange={setImageStyle}
            />
          </div>
        </main>

      </div>

      {/* Collapsible History Sidebar - fixed at right edge */}
      <motion.aside
        initial={false}
        animate={{
          x: showHistory ? 0 : 280,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-[81px] hidden h-[calc(100vh-81px)] w-[320px] border-l border-[#2A2118]/50 bg-[#0F0A07] lg:block"
      >
        {/* Collapse toggle button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="absolute -left-8 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-[#2A2118] bg-[#1A1410] text-[#A89885] shadow-lg transition hover:border-[#C4973B]/50 hover:text-[#C4973B]"
          title={showHistory ? "Hide history" : "Show history"}
        >
          <motion.span
            animate={{ rotate: showHistory ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="text-sm"
          >
            ›
          </motion.span>
        </button>
        <div className="scrollbar-hide h-full overflow-y-auto">
          <HistorySidebar
            sessions={history}
            onSelectSession={handleHistorySelect}
          />
        </div>
      </motion.aside>

      {/* Mobile History Drawer */}
      {showHistory && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="scrollbar-hide fixed inset-x-0 bottom-0 top-1/2 overflow-y-auto border-t border-[#2A2118] bg-[#0F0A07] lg:hidden"
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
