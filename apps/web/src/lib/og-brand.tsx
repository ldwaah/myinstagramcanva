import { OG_IMAGE_SIZE } from "./seo";

export const ogRuntime = "edge";
export const ogSize = OG_IMAGE_SIZE;
export const ogContentType = "image/png";

const GRADIENT = "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";

function LogoMark({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="og-grad" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f09433" />
          <stop offset="0.25" stopColor="#e6683c" />
          <stop offset="0.5" stopColor="#dc2743" />
          <stop offset="0.75" stopColor="#cc2366" />
          <stop offset="1" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#og-grad)" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="6.5" stroke="url(#og-grad)" strokeWidth="2" />
      <circle cx="23.5" cy="8.5" r="1.75" fill="url(#og-grad)" />
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
          background: GRADIENT,
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
          background: GRADIENT,
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
              color: "#e1306c",
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
