"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Records one visit per browser session (sessionStorage guard, so
// navigating between pages doesn't inflate the count) and shows a small
// public running total. The raw per-visit log is admin-only (see
// supabase/schema.sql); this reads the total through a security-definer
// RPC that only ever exposes the one number.
export default function VisitStats() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let cancelled = false;

    try {
      if (!sessionStorage.getItem("reslo_visit_recorded")) {
        sessionStorage.setItem("reslo_visit_recorded", "1");
        supabase.from("site_visits").insert({ path: window.location.pathname }).then(() => {});
      }
    } catch {
      // sessionStorage can throw in some privacy modes — visit tracking is
      // a nice-to-have, never worth breaking the page over.
    }

    supabase.rpc("get_public_visit_count").then(({ data, error }) => {
      if (cancelled || error) return;
      setCount(typeof data === "number" ? data : Number(data));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return (
    <p
      style={{
        margin: "6px 0 0",
        fontFamily: '"IBM Plex Mono"',
        fontSize: 11,
        color: "var(--ink-soft)",
      }}
    >
      {count.toLocaleString()} visit{count === 1 ? "" : "s"} since launch
    </p>
  );
}
