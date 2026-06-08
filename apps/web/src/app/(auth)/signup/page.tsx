import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/SignupForm";
import { buildSignupMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ ref?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return buildSignupMetadata(params.ref?.trim() || null);
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
