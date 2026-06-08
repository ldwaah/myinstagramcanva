import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const url = request.nextUrl.clone();

  if (host === rootDomain || host.startsWith("localhost")) {
    return NextResponse.next();
  }

  const subdomain = host.replace(`.${rootDomain}`, "").replace(rootDomain, "");
  if (!subdomain || subdomain === "www" || subdomain === host) {
    return NextResponse.next();
  }

  if (url.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  url.pathname = `/site/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
