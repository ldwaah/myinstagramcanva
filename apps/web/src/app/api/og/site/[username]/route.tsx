import { ImageResponse } from "next/og";
import { prisma } from "@mic/db";
import { ogSize } from "@/lib/og-brand";
import { env } from "@/lib/env";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ username: string }>;
};

export async function GET(_req: Request, { params }: RouteProps) {
  const { username } = await params;
  const site = await prisma.site.findUnique({
    where: { username },
    include: { siteContent: true },
  });

  let brandName = `@${username}`;
  let bio = "Instagram website by My Instagram Canva";
  let imageUrl = `${env.appUrl}/og-default.png`;

  if (site?.siteContent?.content) {
    try {
      const content = JSON.parse(site.siteContent.content) as {
        brandName?: string;
        metaDescription?: string;
        profilePicUrl?: string;
        heroImageUrl?: string;
      };
      if (content.brandName) brandName = content.brandName;
      if (content.metaDescription) bio = content.metaDescription;
      const pic = content.profilePicUrl || content.heroImageUrl;
      if (pic?.startsWith("http")) imageUrl = pic;
      else if (pic) imageUrl = `${env.appUrl}/site/${username}/${pic.replace(/^\//, "")}`;
    } catch {
      /* use defaults */
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0a0a0a",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            width: 420,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            width={280}
            height={280}
            style={{
              borderRadius: 24,
              objectFit: "cover",
              border: "4px solid rgba(225,48,108,0.6)",
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 56px",
          }}
        >
          <p style={{ fontSize: 22, color: "#e1306c", margin: "0 0 12px", fontWeight: 600 }}>
            @{username}
          </p>
          <h1
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {brandName}
          </h1>
          <p
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.7)",
              margin: "20px 0 0",
              lineHeight: 1.4,
            }}
          >
            {bio.length > 120 ? `${bio.slice(0, 117)}…` : bio}
          </p>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", margin: "32px 0 0" }}>
            myinstagramcanva.com
          </p>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
