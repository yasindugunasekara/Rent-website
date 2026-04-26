"use client";

// Added Lucide icons for a more professional feel
import { AlertTriangle, Loader2 } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message,
  onCancel,
  onConfirm,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      
      {/* 🌫️ Background Overlay with Blur */}
      <div 
        className="absolute inset-0 bg-textMain/40 backdrop-blur-sm transition-opacity" 
        onClick={!loading ? onCancel : undefined}
      />

      {/* 📦 Modal Content Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-surface p-8 shadow-2xl border border-gray-100 transform transition-all animate-scaleUp">
        
        <div className="flex flex-col items-center text-center">
          
          {/* ⚠️ Warning Icon Area */}
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-8 w-8" />
          </div>

          {/* Title & Message */}
          <h3 className="text-2xl font-extrabold text-textMain tracking-tight">
            {title}
          </h3>
          <p className="mt-3 text-base text-textMuted leading-relaxed">
            {message}
          </p>
        </div>

        {/* 🛠️ Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 order-2 sm:order-1 rounded-xl border border-gray-200 px-6 py-3.5 text-base font-bold text-textMain transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50"
          >
            No, Cancel
          </button>

          {/* Confirm (Delete) Button */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 order-1 sm:order-2 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-base font-bold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>

        </div>
      </div>
    </div>
  );
}