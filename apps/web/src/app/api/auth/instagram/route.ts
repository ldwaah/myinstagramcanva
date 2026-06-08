import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  if (!env.instagram.appId) {
    return NextResponse.json({
      error: "Instagram OAuth not configured",
      docs: "/docs/instagram-meta-app.md",
    }, { status: 501 });
  }

  const params = new URLSearchParams({
    client_id: env.instagram.appId,
    redirect_uri: env.instagram.redirectUri,
    scope: "instagram_business_basic",
    response_type: "code",
  });

  return NextResponse.redirect(`https://www.instagram.com/oauth/authorize?${params}`);
}
