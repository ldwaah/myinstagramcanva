import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/SignupForm";
import { buildSignupMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSignupMetadata();

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
