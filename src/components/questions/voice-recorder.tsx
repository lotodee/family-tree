"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type RecorderState = "idle" | "recording" | "uploading" | "transcribing";

interface VoiceRecorderProps {
  userId: string;
  questionId: string;
  subjectId: string;
  onTranscriptionComplete: (data: {
    voiceUrl: string;
    rawTranscription: string;
  }) => void;
  onError: (message: string) => void;
}

export function VoiceRecorder({
  userId,
  questionId,
  subjectId,
  onTranscriptionComplete,
  onError,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [supportsVoice, setSupportsVoice] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.stop();
      setState("uploading");
    }
  }, [state]);

  // Check for voice support on mount
  useEffect(() => {
    setSupportsVoice(
      typeof window !== "undefined" &&
        "MediaRecorder" in window &&
        typeof navigator.mediaDevices?.getUserMedia === "function"
    );
  }, []);

  // Timer effect
  useEffect(() => {
    if (state === "recording") {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          // Auto-stop at 120 seconds
          if (s >= 119) {
            stopRecording();
            return 120;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state, stopRecording]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const uploadAndTranscribe = useCallback(
    async (blob: Blob, mimeType: string) => {
      try {
        const supabase = createClient();
        const extension = mimeType.includes("mp4") ? "mp4" : "webm";
        const fileName = `${userId}/${questionId}_${subjectId}_${Date.now()}.${extension}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("voice-recordings")
          .upload(fileName, blob, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          onError("Upload failed. Please try again.");
          setState("idle");
          return;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("voice-recordings").getPublicUrl(fileName);

        setState("transcribing");

        // Call transcription API
        const response = await fetch("/api/voice/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voicePath: fileName }),
        });

        const data = await response.json();

        if (!response.ok) {
          onError(data.error || "Transcription failed. Please try again.");
          setState("idle");
          return;
        }

        onTranscriptionComplete({
          voiceUrl: publicUrl,
          rawTranscription: data.transcription,
        });
        setState("idle");
        setSeconds(0);
      } catch (error) {
        console.error("Upload/transcribe error:", error);
        onError("Something went wrong. Please try again.");
        setState("idle");
      }
    },
    [userId, questionId, subjectId, onError, onTranscriptionComplete]
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine best supported format
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4"; // iOS Safari fallback
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Release tracks
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, { type: mimeType });
        await uploadAndTranscribe(blob, mimeType);
      };

      mediaRecorder.start();
      setState("recording");
      setSeconds(0);
    } catch (error) {
      console.error("Recording error:", error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        onError(
          "Microphone access was denied. Please allow microphone access in your browser settings."
        );
      } else {
        onError("Could not start recording. Please try text input instead.");
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    chunksRef.current = [];
    setState("idle");
    setSeconds(0);
  };

  if (!supportsVoice) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {state === "idle" && (
        <>
          <button
            onClick={startRecording}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-burgundy)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label="Start recording"
          >
            <Mic className="h-7 w-7" />
          </button>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Tap to record your answer
          </p>
        </>
      )}

      {state === "recording" && (
        <>
          <button
            onClick={stopRecording}
            className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
            aria-label="Stop recording"
          >
            <Square className="h-6 w-6" />
          </button>
          <p className="font-mono text-lg font-medium text-red-500">
            {formatTime(seconds)}
          </p>
          <button
            onClick={cancelRecording}
            className="text-sm text-[var(--color-text-secondary)] underline"
          >
            Cancel
          </button>
          {seconds >= 90 && (
            <p className="text-xs text-orange-500">
              Recording will stop at 2 minutes
            </p>
          )}
        </>
      )}

      {state === "uploading" && (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-gold)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            Uploading your recording...
          </p>
        </div>
      )}

      {state === "transcribing" && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-6 w-1 animate-pulse rounded-full bg-[var(--color-gold)]"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.6s",
                }}
              />
            ))}
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Transcribing your voice...
          </p>
        </div>
      )}
    </div>
  );
}
