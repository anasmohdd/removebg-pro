/**
 * components/UploadZone.jsx
 * Drag-and-drop + file-input image upload zone with preview.
 * Props:
 *   onFileSelect(file: File) — called when a valid image is selected
 *   disabled: boolean
 */

import { useRef, useState, useCallback } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 12;

export default function UploadZone({ onFileSelect, disabled }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  function validateFile(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Unsupported format. Please use JPEG, PNG, WebP, or GIF.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large. Maximum size is ${MAX_SIZE_MB} MB.`;
    }
    return null;
  }

  const handleFile = useCallback(
    (file) => {
      setError("");
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  // ─── Drag events ──────────────────────────────────────────────────────────
  function onDragOver(e) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }
  function onDragLeave() {
    setIsDragging(false);
  }
  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  // ─── File input change ────────────────────────────────────────────────────
  function onChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // allow re-selecting same file
  }

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image area"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center gap-4 py-14 px-6 text-center
          ${disabled
            ? "opacity-60 cursor-not-allowed bg-slate-50 border-slate-200"
            : isDragging
            ? "border-brand-400 bg-brand-50 scale-[1.01]"
            : "border-slate-300 bg-white hover:border-brand-400 hover:bg-brand-50"
          }
        `}
      >
        {/* Icon */}
        <div
          className={`
            w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
            ${isDragging ? "bg-brand-100" : "bg-slate-100"}
          `}
        >
          <svg
            className={`w-8 h-8 transition-colors ${isDragging ? "text-brand-500" : "text-slate-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        {/* Text */}
        <div>
          <p className="font-semibold text-slate-700 text-base">
            {isDragging ? "Drop it here!" : "Drag & drop your image"}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            or{" "}
            <span className="text-brand-500 font-medium hover:underline">
              browse files
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-3">
            JPEG, PNG, WebP, GIF — max {MAX_SIZE_MB} MB
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-rose-500 flex items-center gap-1.5">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
