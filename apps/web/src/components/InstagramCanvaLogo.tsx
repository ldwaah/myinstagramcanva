"use client";

import { useId } from "react";

interface InstagramCanvaLogoProps {
  size?: number;
  className?: string;
}

/** Original MIC monogram: canvas frame with geometric lettermark (not Instagram-branded). */
export function InstagramCanvaLogo({ size = 28, className = "" }: InstagramCanvaLogoProps) {
  const gradId = useId().replace(/:/g, "");
  return (
    <svg
      className={`ic-logo${className ? ` ${className}` : ""}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="2" y1="30" x2="30" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="0.5" stopColor="#A855F7" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <rect
        x="2.5"
        y="2.5"
        width="27"
        height="27"
        rx="7"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        fill="#7C3AED"
        fillOpacity="0.08"
      />
      <path
        d="M21.5 2.5H29.5V10.5"
        stroke={`url(#${gradId})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 20.5V11.5L10.5 15.5L13.5 11.5V20.5"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 11.5V20.5"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M22.5 20.5C19.8 20.5 18 18.4 18 16C18 13.6 19.8 11.5 22.5 11.5"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
