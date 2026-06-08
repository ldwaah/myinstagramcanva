interface InstagramCanvaLogoProps {
  size?: number;
  className?: string;
}

/** Branded mark — IG-inspired gradient, camera lens + grid motif (not Meta's logo). */
export function InstagramCanvaLogo({ size = 28, className = "" }: InstagramCanvaLogoProps) {
  const id = "ic-logo-grad";
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
        <linearGradient id={id} x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f09433" />
          <stop offset="0.25" stopColor="#e6683c" />
          <stop offset="0.5" stopColor="#dc2743" />
          <stop offset="0.75" stopColor="#cc2366" />
          <stop offset="1" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" stroke={`url(#${id})`} strokeWidth="2.5" />
      <circle cx="16" cy="16" r="6.5" stroke={`url(#${id})`} strokeWidth="2" />
      <circle cx="23.5" cy="8.5" r="1.75" fill={`url(#${id})`} />
      <rect x="6" y="22" width="3" height="3" rx="0.75" fill={`url(#${id})`} opacity="0.7" />
      <rect x="10.5" y="22" width="3" height="3" rx="0.75" fill={`url(#${id})`} opacity="0.5" />
      <rect x="6" y="25.5" width="3" height="3" rx="0.75" fill={`url(#${id})`} opacity="0.5" />
      <rect x="10.5" y="25.5" width="3" height="3" rx="0.75" fill={`url(#${id})`} opacity="0.35" />
    </svg>
  );
}
