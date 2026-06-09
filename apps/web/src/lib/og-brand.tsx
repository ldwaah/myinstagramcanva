import { BRAND_GRADIENT_CSS } from "./brand-mark";
import { OG_IMAGE_SIZE } from "./seo";

export const ogRuntime = "edge";
export const ogSize = OG_IMAGE_SIZE;
export const ogContentType = "image/png";

function LogoMark({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="og-mic-grad" x1="2" y1="30" x2="30" y2="2" gradientUnits="userSpaceOnUse">
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
        stroke="url(#og-mic-grad)"
        strokeWidth="2"
        fill="#7C3AED"
        fillOpacity="0.08"
      />
      <path
        d="M21.5 2.5H29.5V10.5"
        stroke="url(#og-mic-grad)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 20.5V11.5L10.5 15.5L13.5 11.5V20.5"
        stroke="url(#og-mic-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 11.5V20.5"
        stroke="url(#og-mic-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M22.5 20.5C19.8 20.5 18 18.4 18 16C18 13.6 19.8 11.5 22.5 11.5"
        stroke="url(#og-mic-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OgBrandCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: BRAND_GRADIENT_CSS,
          opacity: 0.18,
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: BRAND_GRADIENT_CSS,
          opacity: 0.12,
          filter: "blur(60px)",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative" }}>
        <LogoMark />
        <span style={{ fontSize: 28, fontWeight: 600, color: "#fafafa", letterSpacing: "-0.02em" }}>
          My Instagram Canva
        </span>
      </div>
      <div style={{ position: "relative", maxWidth: 900 }}>
        {eyebrow ? (
          <p
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#A855F7",
              margin: "0 0 16px",
            }}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.72)",
            margin: "24px 0 0",
            lineHeight: 1.4,
            maxWidth: 820,
          }}
        >
          {subtitle}
        </p>
      </div>
      <p style={{ fontSize: 20, color: "rgba(255,255,255,0.45)", margin: 0, position: "relative" }}>
        myinstagramcanva.com
      </p>
    </div>
  );
}
