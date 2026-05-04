/**
 * pages/Dashboard.jsx
 * Main application page. Handles:
 *  1. Image selection (UploadZone)
 *  2. Preview
 *  3. Upload to server
 *  4. Call remove-bg API
 *  5. Show BeforeAfter slider
 *  6. Download result
 */

import { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import UploadZone from "../components/UploadZone";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import ToastContainer from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import api from "../utils/api";

// ─── Step indicator ───────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ["Select Image", "Process", "Download"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done ? "bg-emerald-500 text-white" : active ? "bg-brand-500 text-white" : "bg-slate-200 text-slate-500"}
                `}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx
                )}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${active ? "text-slate-800" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-px ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Credits panel ────────────────────────────────────────────────────────────
function CreditsPanel({ credits }) {
  const pct = Math.min((credits / 5) * 100, 100);
  const barColor = credits === 0 ? "bg-rose-400" : credits <= 2 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Credits Remaining</h3>
        <span className={`text-2xl font-display font-bold ${credits === 0 ? "text-rose-500" : "text-slate-800"}`}>
          {credits}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-2">
        {credits === 0
          ? "No credits left. Upgrade to continue."
          : `${credits} of 5 free credits remaining`}
      </p>
    </div>
  );
}

// ─── Processing overlay ───────────────────────────────────────────────────────
function ProcessingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4 z-10">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-700">Removing background…</p>
        <p className="text-sm text-slate-400 mt-1">This usually takes 2–5 seconds</p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, updateCredits } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  // State
  const [selectedFile, setSelectedFile] = useState(null);   // File object
  const [previewUrl, setPreviewUrl] = useState(null);        // local object URL
  const [uploadedFilename, setUploadedFilename] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);      // server URL of original
  const [resultUrl, setResultUrl] = useState(null);          // server URL of result
  const [step, setStep] = useState(1);                       // 1 | 2 | 3
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // ─── File selected ────────────────────────────────────────────────────────
  const handleFileSelect = useCallback((file) => {
    // Revoke previous object URL
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setUploadedFilename(null);
    setOriginalUrl(null);
    setError("");
    setStep(1);
  }, [previewUrl]);

  // ─── Reset ────────────────────────────────────────────────────────────────
  function handleReset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedFilename(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setError("");
    setStep(1);
  }

  // ─── Process image ────────────────────────────────────────────────────────
  async function handleProcess() {
    if (!selectedFile) return;
    if (user.credits <= 0) {
      addToast("You have no credits remaining. Please upgrade.", "error");
      return;
    }

    setError("");

    try {
      // Step 1: Upload original
      setUploading(true);
      setStep(2);
      const formData = new FormData();
      formData.append("image", selectedFile);
      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { filename, originalUrl: origUrl } = uploadRes.data;
      setUploadedFilename(filename);
      setOriginalUrl(origUrl);
      setUploading(false);

      // Step 2: Remove background
      setProcessing(true);
      const bgRes = await api.post("/remove-bg", { filename });
      const { resultUrl: resUrl, credits } = bgRes.data;
      setResultUrl(resUrl);
      updateCredits(credits);
      setStep(3);
      addToast("Background removed successfully! 🎉", "success");
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong. Please try again.";
      setError(msg);
      addToast(msg, "error");
      setStep(1);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  }

  // ─── Download result ──────────────────────────────────────────────────────
  async function handleDownload() {
    if (!resultUrl) return;
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `removebg-pro-result.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("Image downloaded successfully!", "success");
    } catch {
      addToast("Download failed. Try right-clicking the image to save.", "error");
    }
  }

  const isWorking = uploading || processing;

  return (
    <>
      <Navbar />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-800 mb-2">
            Background Remover
          </h1>
          <p className="text-slate-500">
            Upload an image and let AI remove the background instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Main panel ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card">
              <Steps current={step} />

              {/* Upload zone — shown when no file selected */}
              {!selectedFile && (
                <UploadZone onFileSelect={handleFileSelect} disabled={isWorking} />
              )}

              {/* Preview + result */}
              {selectedFile && (
                <div className="space-y-5">
                  {/* Before/after slider when result is ready */}
                  {resultUrl && originalUrl ? (
                    <BeforeAfterSlider beforeSrc={originalUrl} afterSrc={resultUrl} />
                  ) : (
                    /* Preview before processing */
                    <div className="relative rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center" style={{ minHeight: 240 }}>
                      <img
                        src={previewUrl}
                        alt="Selected image preview"
                        className="max-h-72 w-full object-contain"
                      />
                      {isWorking && <ProcessingOverlay />}
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm">
                      <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* File info */}
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-slate-600 truncate flex-1">{selectedFile.name}</span>
                    <span className="text-xs text-slate-400 shrink-0">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3">
                    {/* Process button */}
                    {!resultUrl && (
                      <button
                        onClick={handleProcess}
                        disabled={isWorking || user.credits <= 0}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                      >
                        {isWorking ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {uploading ? "Uploading…" : "Processing…"}
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                            </svg>
                            Remove Background
                          </>
                        )}
                      </button>
                    )}

                    {/* Download button */}
                    {resultUrl && (
                      <button
                        onClick={handleDownload}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PNG
                      </button>
                    )}

                    {/* New image button */}
                    <button
                      onClick={handleReset}
                      disabled={isWorking}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium text-sm transition-all disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      New Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Sidebar ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <CreditsPanel credits={user?.credits ?? 0} />

            {/* Tips card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Tips for best results</h3>
              <ul className="space-y-2.5">
                {[
                  "Use images with clear subjects",
                  "Good lighting helps accuracy",
                  "PNG output preserves transparency",
                  "Max file size: 12 MB",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Upgrade CTA */}
            {user?.credits <= 2 && (
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-5 text-white shadow-card-md">
                <h3 className="font-display font-bold text-base mb-1">Need more credits?</h3>
                <p className="text-brand-100 text-xs mb-4">
                  Upgrade to Pro for unlimited background removals.
                </p>
                <button className="w-full py-2 px-4 bg-white text-brand-600 font-semibold text-sm rounded-xl hover:bg-brand-50 transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
