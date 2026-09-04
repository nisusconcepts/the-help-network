"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { extractZip } from "@/lib/zip";

export default function ReviewQueuePage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const loadSubmissions = useCallback(async () => {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true });

    if (error) {
      setLoadError(error.message);
    } else {
      setSubmissions(data || []);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (!data.session) {
        router.replace("/admin/login");
        return;
      }
      setCheckingSession(false);
      loadSubmissions();
    });

    return () => {
      cancelled = true;
    };
  }, [router, loadSubmissions]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  async function handleApprove(submission) {
    setBusyId(submission.id);

    let lat = null;
    let lng = null;
    if (submission.address) {
      try {
        const res = await fetch("/api/geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: submission.address }),
        });
        const coords = await res.json();
        lat = coords.lat ?? null;
        lng = coords.lng ?? null;
      } catch {
        // Non-fatal — the resource still gets published, just without a map pin.
      }
    }

    const { error: insertError } = await supabase.from("resources").insert({
      name: submission.name,
      category: submission.category,
      description: submission.description,
      phone: submission.phone || "",
      address: submission.address || "",
      area: submission.area || "",
      zip: extractZip(submission.address),
      lat,
      lng,
      hours: submission.hours || "",
      requirements: submission.requirements || "",
      website: submission.website || "",
      hours_247: false,
      free: false,
    });

    if (insertError) {
      alert(`Couldn't publish: ${insertError.message}`);
      setBusyId(null);
      return;
    }

    await supabase.from("submissions").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", submission.id);

    setSubmissions((subs) => subs.filter((s) => s.id !== submission.id));
    setBusyId(null);
  }

  async function handleReject(submission) {
    setBusyId(submission.id);
    await supabase.from("submissions").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", submission.id);
    setSubmissions((subs) => subs.filter((s) => s.id !== submission.id));
    setBusyId(null);
  }

  if (checkingSession) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 22 }}>Review queue</h2>
        <button className="btn" style={{ background: "var(--panel)", border: "1px solid var(--line)" }} onClick={handleSignOut}>
          Sign out
        </button>
      </div>

      {loadError && <div className="form-msg err">{loadError}</div>}
      {!loadError && submissions.length === 0 && <div className="empty">No pending submissions.</div>}

      {submissions.map((s) => {
        const cat = CATEGORY_BY_SLUG[s.category];
        return (
          <div key={s.id} className="panel-block" style={{ padding: "15px 17px", marginBottom: 12, maxWidth: 640 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 600 }}>
                {s.name} {s.submitter_type === "organization" && <span style={{ fontWeight: 400, fontSize: 12, color: "var(--ink-soft)" }}>(self-registered)</span>}
              </h3>
              <span
                className="badge"
                style={{
                  borderColor: "transparent",
                  background: cat ? cat.tint : "var(--teal-tint)",
                  color: cat ? cat.color : "var(--teal-dark)",
                  borderRadius: 999,
                }}
              >
                {cat ? cat.label : s.category}
              </span>
            </div>
            <p style={{ marginTop: 6, color: "var(--ink-soft)", fontSize: 14 }}>{s.description}</p>
            <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 3, marginTop: 6 }}>
              {s.phone && <div><strong>Call:</strong> {s.phone}</div>}
              {s.address && <div><strong>Where:</strong> {s.address}</div>}
              {s.hours && <div><strong>Hours:</strong> {s.hours}</div>}
              {s.requirements && <div><strong>Bring/needs:</strong> {s.requirements}</div>}
              {s.website && <div><strong>Web:</strong> {s.website}</div>}
              {s.note && <div><strong>Note:</strong> {s.note}</div>}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                className="btn"
                style={{ background: "var(--sage)", color: "#08150e" }}
                disabled={busyId === s.id}
                onClick={() => handleApprove(s)}
              >
                Approve &rarr; publish
              </button>
              <button
                className="btn"
                style={{ background: "transparent", color: "var(--rust)", border: "1px solid var(--rust-tint)" }}
                disabled={busyId === s.id}
                onClick={() => handleReject(s)}
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
