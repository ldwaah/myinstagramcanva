import type { ReactNode } from "react";

interface MicCardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  glow?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function MicCard({
  children,
  className = "",
  glass = false,
  glow = false,
  padding = "md",
}: MicCardProps) {
  const pad = padding === "sm" ? "mic-card--sm" : padding === "lg" ? "mic-card--lg" : "";
  return (
    <div
      className={`mic-card${glass ? " mic-card--glass" : ""}${glow ? " mic-card--glow" : ""} ${pad} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
