"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralTracker() {
  const params = useSearchParams();

  useEffect(() => {
    const ref = params.get("ref");
    if (!ref) return;

    const key = `mic_ref_tracked_${ref.toLowerCase()}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    fetch("/api/affiliates/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: ref }),
    }).catch(() => {
      /* non-blocking */
    });
  }, [params]);

  return null;
}
