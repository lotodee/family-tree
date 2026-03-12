"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingState =
  | "idle"         // camera not started
  | "requesting"   // requesting camera permission
  | "ready"        // camera live, not recording
  | "recording"    // recording in progress
  | "stopped"      // recording finished, blob available
  | "error";       // camera access failed

interface Options {
  maxDurationSecs: number;
  onTimeLimitReached?: () => void;
}

interface Return {
  state: RecordingState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  elapsedSecs: number;
  remainingSecs: number;
  error: string | null;
  facingMode: "user" | "environment";
  hasMultipleCameras: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
  toggleCamera: () => Promise<void>;
}

function getPreferredMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "video/webm";
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4;codecs=avc1",
    "video/mp4",
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "video/webm";
}

export function useVideoRecorder({ maxDurationSecs, onTimeLimitReached }: Options): Return {
  const [state, setState] = useState<RecordingState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const remainingSecs = Math.max(0, maxDurationSecs - elapsedSecs);

  // Detect multiple cameras on mount
  useEffect(() => {
    async function detect() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        // silently fail
      }
    }
    detect();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, []);

  const startCamera = useCallback(async () => {
    setState("requesting");
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      setState("ready");
    } catch (err) {
      const isDenied = err instanceof DOMException && err.name === "NotAllowedError";
      setError(
        isDenied
          ? "Camera access was denied. Please allow camera access in your browser settings and try again."
          : "Could not access your camera. Please check that your device has a working camera and try again."
      );
      setState("error");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setState("idle");
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setElapsedSecs(0);

    const mimeType = getPreferredMimeType();

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 2_500_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      setState("stopped");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    recorderRef.current = recorder;
    recorder.start(1000);
    startTimeRef.current = Date.now();
    setState("recording");

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSecs(elapsed);

      if (elapsed >= maxDurationSecs) {
        recorder.stop();
        if (timerRef.current) clearInterval(timerRef.current);
        onTimeLimitReached?.();
      }
    }, 500);
  }, [maxDurationSecs, onTimeLimitReached, recordedUrl]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setElapsedSecs(0);
    setState("ready");
  }, [recordedUrl]);

  const toggleCamera = useCallback(async () => {
    if (state === "recording") return; // cannot flip while recording

    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch {
      setError("Could not switch camera.");
    }
  }, [facingMode, state]);

  return {
    state,
    videoRef,
    recordedBlob,
    recordedUrl,
    elapsedSecs,
    remainingSecs,
    error,
    facingMode,
    hasMultipleCameras,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    resetRecording,
    toggleCamera,
  };
}
