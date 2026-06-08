import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${env.appUrl}/onboarding?ig_error=1`);
  }

  if (!env.instagram.appId || !env.instagram.appSecret) {
    return NextResponse.redirect(`${env.appUrl}/onboarding?ig_error=config`);
  }

  const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.instagram.appId,
      client_secret: env.instagram.appSecret,
      grant_type: "authorization_code",
      redirect_uri: env.instagram.redirectUri,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${env.appUrl}/onboarding?ig_error=token`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string; user_id: string };
  const cookieStore = await cookies();
  cookieStore.set("ig_token", tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600,
  });

  return NextResponse.redirect(`${env.appUrl}/onboarding?ig_connected=1`);
}
