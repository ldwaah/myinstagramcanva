import { NextRequest, NextResponse } from "next/server";
import { parseTenantUsernameFromHost } from "@/lib/site-urls";

const REF_COOKIE = "mic_ref";
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function attachReferralCookie(response: NextResponse, ref: string) {
  response.cookies.set(REF_COOKIE, ref.toLowerCase(), {
    maxAge: REF_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const url = request.nextUrl.clone();
  const ref = url.searchParams.get("ref");

  const username = parseTenantUsernameFromHost(host, rootDomain);

  if (username && !url.pathname.startsWith("/api")) {
    url.pathname = `/site/${username}${url.pathname === "/" ? "" : url.pathname}`;
    const response = NextResponse.rewrite(url);
    if (ref) attachReferralCookie(response, ref);
    return response;
  }

  const response = NextResponse.next();
  if (ref) attachReferralCookie(response, ref);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
