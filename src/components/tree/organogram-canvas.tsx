"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Minus, Plus, Maximize2 } from "lucide-react";

interface OrganogramCanvasProps {
  children: ReactNode;
  treeWidth: number;
  treeHeight: number;
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const PADDING = 100;

/**
 * Pan/zoom canvas for the family organogram.
 * Supports mouse drag, scroll wheel, and pinch gestures.
 */
export function OrganogramCanvas({ children, treeWidth, treeHeight }: OrganogramCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate initial zoom and position to fit tree in viewport
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || treeWidth === 0 || treeHeight === 0) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate zoom to fit tree with padding
    const scaleX = (containerWidth - PADDING * 2) / treeWidth;
    const scaleY = (containerHeight - PADDING * 2) / treeHeight;
    const newZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in more than 100%

    // Center the tree
    const scaledWidth = treeWidth * newZoom;
    const scaledHeight = treeHeight * newZoom;
    const newX = (containerWidth - scaledWidth) / 2;
    const newY = PADDING;

    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)));
    setPan({ x: newX, y: newY });
    setIsInitialized(true);
  }, [treeWidth, treeHeight]);

  // Initialize on mount and when tree dimensions change
  useEffect(() => {
    if (treeWidth > 0 && treeHeight > 0 && !isInitialized) {
      // Small delay to ensure container is sized
      const timer = setTimeout(fitToScreen, 100);
      return () => clearTimeout(timer);
    }
  }, [treeWidth, treeHeight, isInitialized, fitToScreen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isInitialized) fitToScreen();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isInitialized, fitToScreen]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new zoom
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));

    if (newZoom === zoom) return;

    // Zoom toward mouse position
    const ratio = newZoom / zoom;
    const newX = mouseX - (mouseX - pan.x) * ratio;
    const newY = mouseY - (mouseY - pan.y) * ratio;

    setZoom(newZoom);
    setPan({ x: newX, y: newY });
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-cream/50"
      style={{ touchAction: "none" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Transformed content */}
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: treeWidth,
          height: treeHeight,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {children}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 rounded-lg bg-ivory/90 p-1 shadow-md backdrop-blur-sm">
        <button
          onClick={handleZoomIn}
          className="flex h-8 w-8 items-center justify-center rounded text-text-primary transition-colors hover:bg-gold/20"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-8 w-8 items-center justify-center rounded text-text-primary transition-colors hover:bg-gold/20"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="h-px bg-text-secondary/20" />
        <button
          onClick={fitToScreen}
          className="flex h-8 w-8 items-center justify-center rounded text-text-primary transition-colors hover:bg-gold/20"
          aria-label="Fit to screen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-4 rounded bg-ivory/80 px-2 py-1 text-xs text-text-secondary backdrop-blur-sm">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
