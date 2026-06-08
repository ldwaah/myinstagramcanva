import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { env } from "@/lib/env";
import {
  buildReferralUrl,
  getAffiliateStats,
  getOrCreateAffiliate,
} from "@/lib/affiliate";

function affiliatePayload(code: string) {
  const base = env.appUrl.replace(/\/$/, "");
  return {
    code,
    referralUrl: buildReferralUrl(code),
    homeReferralUrl: `${base}/?ref=${encodeURIComponent(code)}`,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const affiliate = await prismaAffiliate(session);
  return NextResponse.json({
    affiliate: affiliatePayload(affiliate.code),
    stats: await getAffiliateStats(affiliate.id),
  });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const affiliate = await getOrCreateAffiliate(session.id, session.email);
  return NextResponse.json({
    affiliate: affiliatePayload(affiliate.code),
    stats: await getAffiliateStats(affiliate.id),
  });
}

async function prismaAffiliate(session: { id: string; email: string }) {
  const existing = await getOrCreateAffiliate(session.id, session.email);
  return existing;
}
