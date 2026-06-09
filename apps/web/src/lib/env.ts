const PRODUCTION_APP_URL = "https://myinstagramcanva.com";
const PRODUCTION_ROOT_DOMAIN = "myinstagramcanva.com";

function isProductionDeploy() {
  return Boolean(process.env.VERCEL || process.env.NETLIFY);
}

function resolveAppUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (isProductionDeploy()) return PRODUCTION_APP_URL;
  return "http://localhost:3000";
}

function resolveRootDomain() {
  const raw = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (raw) return raw;
  if (isProductionDeploy()) return PRODUCTION_ROOT_DOMAIN;
  return "localhost:3000";
}

export const env = {
  appUrl: resolveAppUrl(),
  rootDomain: resolveRootDomain(),
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  authSecret: process.env.NEXTAUTH_SECRET || "dev-secret-change-me",
  stripeSecret: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripePublishable: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  stripePrices: {
    starter: process.env.STRIPE_PRICE_STARTER || "",
    creator:
      process.env.STRIPE_PRICE_CREATOR ||
      process.env.STRIPE_PRICE_TAILORED ||
      "",
    pro: process.env.STRIPE_PRICE_PRO || "",
    studio: process.env.STRIPE_PRICE_STUDIO || "",
    aiByok: process.env.STRIPE_PRICE_AI_BYOK || "",
    aiManaged: process.env.STRIPE_PRICE_AI_MANAGED || "",
    aiTopup: process.env.STRIPE_PRICE_AI_TOPUP || "",
    hosting: process.env.STRIPE_PRICE_HOSTING || "",
  },
  hostingMonthlyPence: Number(process.env.HOSTING_MONTHLY_PENCE || "999"),
  openaiKey: process.env.OPENAI_API_KEY || "",
  encryptionKey: process.env.ENCRYPTION_KEY ?? "",
  githubToken: process.env.GITHUB_TOKEN || "",
  githubRepo: process.env.GITHUB_SITES_REPO || "",
  githubBranch: process.env.GITHUB_SITES_BRANCH || "main",
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    bucket: process.env.R2_BUCKET_NAME || "myinstagramcanva",
    publicUrl: process.env.R2_PUBLIC_URL || "",
  },
  resendKey: process.env.RESEND_API_KEY || "",
  resendFrom: process.env.RESEND_FROM_EMAIL || "hello@myinstagramcanva.com",
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    phone: process.env.TWILIO_PHONE_NUMBER || "",
  },
  adminEmails: (process.env.ADMIN_EMAILS || "admin@myinstagramcanva.com").split(","),
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID || "",
    appSecret: process.env.INSTAGRAM_APP_SECRET || "",
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || "",
  },
};

export const TIER_PRICES: Record<string, number> = {
  STARTER: 2700,
  CREATOR: 5900,
  PRO: 14900,
  STUDIO: 49900,
};
