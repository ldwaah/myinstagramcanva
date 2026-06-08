"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CreateHeroButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState("/signup");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: { loggedIn?: boolean; hasSites?: boolean }) => {
        if (!data.loggedIn) {
          setTarget("/signup");
        } else if (data.hasSites) {
          setTarget("/dashboard?welcome=1");
        } else {
          setTarget("/onboarding");
        }
      })
      .catch(() => setTarget("/signup"));
  }, []);

  async function handleCreate() {
    setLoading(true);
    router.push(target);
  }

  return (
    <button
      type="button"
      className="hero-create-btn landing-cta-shimmer"
      onClick={handleCreate}
      disabled={loading}
    >
      <span className="hero-create-btn__text">{loading ? "…" : "Create"}</span>
      <span className="hero-create-btn__glow" aria-hidden />
    </button>
  );
}
