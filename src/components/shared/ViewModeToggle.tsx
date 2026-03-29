"use client";

import { Button } from "@heroui/react";

interface ViewModeToggleProps {
  mode: "cards" | "matrix";
  onChange: (mode: "cards" | "matrix") => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border-subtle p-0.5">
      <Button
        size="sm"
        variant={mode === "cards" ? "primary" : "ghost"}
        onPress={() => onChange("cards")}
        aria-pressed={mode === "cards"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="mr-1.5"
        >
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
        Cards
      </Button>
      <Button
        size="sm"
        variant={mode === "matrix" ? "primary" : "ghost"}
        onPress={() => onChange("matrix")}
        aria-pressed={mode === "matrix"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="mr-1.5"
        >
          <rect x="1" y="1" width="14" height="3" rx="0.5" />
          <rect x="1" y="6" width="14" height="3" rx="0.5" />
          <rect x="1" y="11" width="14" height="3" rx="0.5" />
        </svg>
        Matrix
      </Button>
    </div>
  );
}
