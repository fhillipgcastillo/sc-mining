"use client";

import { useState } from "react";

export function VersionBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-3 bg-banner-bg px-4 py-2 text-banner-text backdrop-blur-sm"
    >
      <p className="min-w-0 flex-1 text-center text-xs leading-snug sm:text-sm">
        <span className="font-semibold text-banner-accent">Notice:</span> This data
        is based on Star Citizen versions up to v4.6. The signature system
        changed significantly in v4.7+. Updated data is being collected.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss version notice"
        className="shrink-0 rounded p-1 text-banner-accent transition-colors hover:bg-banner-dismiss-hover hover:text-banner-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-banner-accent"
      >
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
