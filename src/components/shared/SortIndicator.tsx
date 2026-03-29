interface SortIndicatorProps {
  direction: "ascending" | "descending" | undefined;
}

export function SortIndicator({ direction }: SortIndicatorProps) {
  if (!direction) return null;

  return (
    <svg
      className={[
        "ml-1 inline-block h-3.5 w-3.5 transition-transform duration-150",
        direction === "ascending" ? "rotate-180" : "",
      ].join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
