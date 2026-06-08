export function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function getAffiliateCommissionRate(): number {
  const raw = process.env.AFFILIATE_COMMISSION_RATE;
  const parsed = raw ? parseFloat(raw) : 0.12;
  return Number.isFinite(parsed) && parsed > 0 && parsed < 1 ? parsed : 0.12;
}
