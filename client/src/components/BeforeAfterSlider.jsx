/**
 * components/BeforeAfterSlider.jsx
 * Interactive before/after slider showing original vs processed image.
 * Props:
 *   beforeSrc — URL of original image
 *   afterSrc  — URL of result image (transparent background)
 */

import { useRef, useState } from "react";

export default function BeforeAfterSlider({ beforeSrc, afterSrc }) {
  const [position, setPosition] = useState(50); // percentage
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  function getPercent(clientX) {
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  }

  // ─── Mouse events ─────────────────────────────────────────────────────────
  function onMouseDown(e) {
    isDragging.current = true;
    e.preventDefault();
  }
  function onMouseMove(e) {
    if (!isDragging.current) return;
    setPosition(getPercent(e.clientX));
  }
  function onMouseUp() {
    isDragging.current = false;
  }

  // ─── Touch events ─────────────────────────────────────────────────────────
  function onTouchMove(e) {
    setPosition(getPercent(e.touches[0].clientX));
  }

  return (
    <div className="w-full space-y-2">
      {/* Labels */}
      <div className="flex justify-between text-xs font-medium text-slate-500 px-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
          Original
        </span>
        <span className="flex items-center gap-1">
          Result
          <span className="w-2 h-2 rounded-full bg-brand-400 inline-block" />
        </span>
      </div>

      {/* Slider container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden select-none cursor-ew-resize shadow-card-md"
        style={{ aspectRatio: "16/9" }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchMove={onTouchMove}
      >
        {/* After image (transparent bg → checkerboard) */}
        <div className="absolute inset-0 checkerboard">
          <img
            src={afterSrc}
            alt="Background removed result"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>

        {/* Before image clipped to left portion */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <div className="absolute inset-0 bg-slate-100">
            <img
              src={beforeSrc}
              alt="Original image"
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
              style={{ minWidth: `${10000 / position}%`, left: 0 }}
            />
          </div>
        </div>

        {/* Divider line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white shadow-md z-10 pointer-events-none"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          {/* Handle */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-card-lg border border-slate-200 flex items-center justify-center cursor-ew-resize pointer-events-auto"
            onMouseDown={onMouseDown}
            onTouchStart={() => {}}
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
            </svg>
          </div>
        </div>

        {/* Range input for keyboard / accessible drag */}
        <input
          type="range"
          min="1"
          max="99"
          value={Math.round(position)}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          aria-label="Comparison slider"
        />
      </div>

      <p className="text-center text-xs text-slate-400">← Drag to compare →</p>
    </div>
  );
}
