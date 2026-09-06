"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/categories";
import { extractZip } from "@/lib/zip";

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function geocodeIfNeeded(address) {
  if (!address) return { lat: null, lng: null };
  try {
    const res = await fetch("/api/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    const coords = await res.json();
    return { lat: coords.lat ?? null, lng: coords.lng ?? null };
  } catch {
    return { lat: null, lng: null };
  }
}

// Inserts with a slug generated from the name, retrying with a short random
// suffix if that slug is already taken (resources.slug is unique).
async function insertResourceWithSlug(row) {
  const base = slugify(row.name) || "resource";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase.from("resources").insert({ ...row, slug }).select().single();
    if (!error) return { data, error: null };
    // 23505 = unique_violation — try again with a different suffix.
    if (error.code !== "23505") return { data: null, error };
  }
  return { data: null, error: { message: "Couldn't generate a unique slug after several attempts." } };
}

const EMPTY_RESOURCE = {
  slug: "",
  name: "",
  category: CATEGORIES[1]?.slug || CATEGORIES[0].slug,
  description: "",
  phone: "",
  area: "",
  address: "",
  hours: "",
  requirements: "",
  website: "",
  hours_247: false,
  free: false,
  offers_detox: false,
  verified: false,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  const [submissions, setSubmissions] = useState([]);
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({ totalVisits: null, visitsThisWeek: null });

  const [busyId, setBusyId] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [verifyResults, setVerifyResults] = useState({}); // { [submissionId]: result }
  const [verifying, setVerifying] = useState(null);

  const [editingId, setEditingId] = useState(null); // null = "add new" mode
  const [form, setForm] = useState(EMPTY_RESOURCE);
  const [formStatus, setFormStatus] = useState(null);
  const [formVerify, setFormVerify] = useState(null);
  const [formVerifying, setFormVerifying] = useState(false);
  const [resourceFilter, setResourceFilter] = useState("");

  const loadAll = useCallback(async () => {
    const [{ data: subs, error: subsErr }, { data: res, error: resErr }] = await Promise.all([
      supabase.from("submissions").select("*").eq("status", "pending").order("submitted_at", { ascending: true }),
      supabase.from("resources").select("*").order("name", { ascending: true }),
    ]);

    if (subsErr || resErr) {
      setLoadError((subsErr || resErr).message);
    } else {
      setSubmissions(subs || []);
      setResources(res || []);
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [{ count: totalVisits }, { count: visitsThisWeek }] = await Promise.all([
      supabase.from("site_visits").select("id", { count: "exact", head: true }),
      supabase.from("site_visits").select("id", { count: "exact", head: true }).gte("visited_at", sevenDaysAgo),
    ]);
    setStats({ totalVisits: totalVisits ?? 0, visitsThisWeek: visitsThisWeek ?? 0 });
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
      loadAll();
    });

    return () => {
      cancelled = true;
    };
  }, [router, loadAll]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  // ---- Review queue -------------------------------------------------

  async function handleVerifySubmission(submission) {
    setVerifying(submission.id);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: submission.website, phone: submission.phone, address: submission.address }),
      });
      const result = await res.json();
      setVerifyResults((r) => ({ ...r, [submission.id]: result }));
    } finally {
      setVerifying(null);
    }
  }

  async function handleApprove(submission) {
    setBusyId(submission.id);

    const { lat, lng } = await geocodeIfNeeded(submission.address);
    const check = verifyResults[submission.id];
    const positivelyConfirmed = Boolean(check?.fetched && (check.phoneMatch || check.addressMatch));
    const explicitMismatch = Boolean(check?.fetched && (check.phoneMatch === false || check.addressMatch === false));

    const { error: insertError } = await insertResourceWithSlug({
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
      verified: positivelyConfirmed && !explicitMismatch,
      verified_at: positivelyConfirmed && !explicitMismatch ? new Date().toISOString() : null,
      verification_notes: check?.fetched
        ? `Auto-checked against ${submission.website}: phone ${describeMatch(check.phoneMatch)}, address ${describeMatch(check.addressMatch)}.`
        : "Not checked against the organization's website before approval.",
    });

    if (insertError) {
      alert(`Couldn't publish: ${insertError.message}`);
      setBusyId(null);
      return;
    }

    await supabase.from("submissions").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", submission.id);

    setSubmissions((subs) => subs.filter((s) => s.id !== submission.id));
    setBusyId(null);
    loadAll();
  }

  async function handleReject(submission) {
    setBusyId(submission.id);
    await supabase.from("submissions").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", submission.id);
    setSubmissions((subs) => subs.filter((s) => s.id !== submission.id));
    setBusyId(null);
  }

  // ---- Add / edit resource form --------------------------------------

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_RESOURCE);
    setFormStatus(null);
    setFormVerify(null);
  }

  function startEdit(resource) {
    setEditingId(resource.id);
    setForm({
      slug: resource.slug || "",
      name: resource.name || "",
      category: resource.category,
      description: resource.description || "",
      phone: resource.phone || "",
      area: resource.area || "",
      address: resource.address || "",
      hours: resource.hours || "",
      requirements: resource.requirements || "",
      website: resource.website || "",
      hours_247: Boolean(resource.hours_247),
      free: Boolean(resource.free),
      offers_detox: Boolean(resource.offers_detox),
      verified: Boolean(resource.verified),
    });
    setFormStatus(null);
    setFormVerify(null);
    window.scrollTo({ top: document.getElementById("resource-form")?.offsetTop ?? 0, behavior: "smooth" });
  }

  function updateForm(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFormVerify() {
    setFormVerifying(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: form.website, phone: form.phone, address: form.address }),
      });
      setFormVerify(await res.json());
    } finally {
      setFormVerifying(false);
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormStatus(null);

    const { lat, lng } = await geocodeIfNeeded(form.address);
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      phone: form.phone,
      area: form.area,
      address: form.address,
      zip: extractZip(form.address),
      lat,
      lng,
      hours: form.hours,
      requirements: form.requirements,
      website: form.website,
      hours_247: form.hours_247,
      free: form.free,
      offers_detox: form.offers_detox,
      verified: form.verified,
      verified_at: form.verified ? new Date().toISOString() : null,
      verification_notes: form.verified ? "Manually verified by admin." : "",
    };

    if (editingId) {
      const { error } = await supabase.from("resources").update(payload).eq("id", editingId);
      if (error) {
        setFormStatus({ type: "err", message: error.message });
        return;
      }
    } else {
      const slugPayload = { ...payload };
      if (form.slug.trim()) slugPayload.slug = slugify(form.slug);
      const { error } = form.slug.trim()
        ? await supabase.from("resources").insert(slugPayload)
        : await insertResourceWithSlug(slugPayload);
      if (error) {
        setFormStatus({ type: "err", message: error.message });
        return;
      }
    }

    setFormStatus({ type: "ok", message: editingId ? "Saved." : "Added." });
    startAdd();
    loadAll();
  }

  async function handleDelete(resource) {
    if (!confirm(`Delete "${resource.name}"? This can't be undone.`)) return;
    setBusyId(resource.id);
    const { error } = await supabase.from("resources").delete().eq("id", resource.id);
    setBusyId(null);
    if (error) {
      alert(`Couldn't delete: ${error.message}`);
      return;
    }
    setResources((rs) => rs.filter((r) => r.id !== resource.id));
    if (editingId === resource.id) startAdd();
  }

  const filteredResources = useMemo(() => {
    if (!resourceFilter.trim()) return resources;
    const q = resourceFilter.toLowerCase();
    return resources.filter((r) => r.name?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q));
  }, [resources, resourceFilter]);

  if (checkingSession) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22 }}>Admin dashboard</h2>
        <button className="btn" style={{ background: "var(--panel)", border: "1px solid var(--line)" }} onClick={handleSignOut}>
          Sign out
        </button>
      </div>

      {loadError && <div className="form-msg err" style={{ marginBottom: 16 }}>{loadError}</div>}

      {/* ---- Stats ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <StatTile label="Total resources" value={resources.length} />
        <StatTile label="Pending submissions" value={submissions.length} />
        <StatTile label="Visits (all time)" value={stats.totalVisits} />
        <StatTile label="Visits (7 days)" value={stats.visitsThisWeek} />
      </div>

      {/* ---- Review queue ---- */}
      <section style={{ marginBottom: 36 }}>
        <h3 style={{ fontSize: 17, marginBottom: 12 }}>Review queue</h3>
        {submissions.length === 0 && <div className="empty">No pending submissions.</div>}
        {submissions.map((s) => {
          const cat = CATEGORY_BY_SLUG[s.category];
          const check = verifyResults[s.id];
          return (
            <div key={s.id} className="panel-block" style={{ padding: "15px 17px", marginBottom: 12, maxWidth: 640 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <h4 style={{ fontSize: 15.5, fontWeight: 600 }}>
                  {s.name} {s.submitter_type === "organization" && <span style={{ fontWeight: 400, fontSize: 12, color: "var(--ink-soft)" }}>(self-registered)</span>}
                </h4>
                <span className="badge" style={{ borderColor: "transparent", background: cat ? cat.tint : "var(--teal-tint)", color: cat ? cat.color : "var(--teal-dark)", borderRadius: 999 }}>
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

              {check && (
                <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--paper)", borderRadius: 8, fontSize: 12.5 }}>
                  {check.fetched ? (
                    <>
                      <div>Phone on their site: {describeMatch(check.phoneMatch)}</div>
                      <div>Address on their site: {describeMatch(check.addressMatch)}</div>
                      {check.phoneCandidates?.length > 0 && (
                        <div>Phone numbers found on page: {check.phoneCandidates.join(", ")}</div>
                      )}
                    </>
                  ) : (
                    <div>Couldn&apos;t check ({check.reason || check.error || "no website given"}).</div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <button
                  className="btn"
                  style={{ background: "transparent", border: "1px solid var(--line)" }}
                  disabled={verifying === s.id || !s.website}
                  onClick={() => handleVerifySubmission(s)}
                  title={s.website ? "" : "No website given to check against"}
                >
                  {verifying === s.id ? "Checking…" : "Check against their website"}
                </button>
                <button className="btn" style={{ background: "var(--sage)", color: "#08150e" }} disabled={busyId === s.id} onClick={() => handleApprove(s)}>
                  Approve &rarr; publish
                </button>
                <button className="btn" style={{ background: "transparent", color: "var(--rust)", border: "1px solid var(--rust-tint)" }} disabled={busyId === s.id} onClick={() => handleReject(s)}>
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* ---- Add / edit resource ---- */}
      <section id="resource-form" style={{ marginBottom: 36 }}>
        <h3 style={{ fontSize: 17, marginBottom: 12 }}>{editingId ? "Edit resource" : "Add a resource directly"}</h3>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14, maxWidth: 640 }}>
          Skips the public submission queue — use this when entering something yourself, so publishing does
          not depend on a visitor filling out every field correctly.
        </p>
        <form onSubmit={handleFormSubmit} className="panel-block" style={{ maxWidth: 640, padding: "16px 18px" }}>
          {!editingId && (
            <div className="field">
              <label htmlFor="r-slug">Slug (optional — auto-generated from name if left blank)</label>
              <input id="r-slug" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} placeholder="e.g. my-org-name" />
            </div>
          )}
          <div className="field">
            <label htmlFor="r-name">Organization name</label>
            <input id="r-name" required value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="r-category">Category</label>
            <select id="r-category" required value={form.category} onChange={(e) => updateForm("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="r-desc">Description</label>
            <textarea id="r-desc" required value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
          </div>
          <div className="field two">
            <div>
              <label htmlFor="r-phone">Phone</label>
              <input id="r-phone" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
            </div>
            <div>
              <label htmlFor="r-area">City / region</label>
              <input id="r-area" value={form.area} onChange={(e) => updateForm("area", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="r-address">Address</label>
            <input id="r-address" value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="r-hours">Hours</label>
            <input id="r-hours" value={form.hours} onChange={(e) => updateForm("hours", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="r-requirements">Requirements</label>
            <textarea id="r-requirements" value={form.requirements} onChange={(e) => updateForm("requirements", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="r-website">Website</label>
            <input id="r-website" type="url" value={form.website} onChange={(e) => updateForm("website", e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14, fontSize: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
              <input type="checkbox" checked={form.hours_247} onChange={(e) => updateForm("hours_247", e.target.checked)} /> 24/7
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
              <input type="checkbox" checked={form.free} onChange={(e) => updateForm("free", e.target.checked)} /> Free
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
              <input type="checkbox" checked={form.offers_detox} onChange={(e) => updateForm("offers_detox", e.target.checked)} /> Offers detox
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
              <input type="checkbox" checked={form.verified} onChange={(e) => updateForm("verified", e.target.checked)} /> Verified
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" className="btn" style={{ background: "transparent", border: "1px solid var(--line)" }} disabled={formVerifying || !form.website} onClick={handleFormVerify}>
              {formVerifying ? "Checking…" : "Check against website"}
            </button>
            <button className="btn btn-primary" type="submit">
              {editingId ? "Save changes" : "Add resource"}
            </button>
            {editingId && (
              <button type="button" className="btn" style={{ background: "transparent", border: "1px solid var(--line)" }} onClick={startAdd}>
                Cancel edit
              </button>
            )}
          </div>

          {formVerify && (
            <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--paper)", borderRadius: 8, fontSize: 12.5 }}>
              {formVerify.fetched ? (
                <>
                  <div>Phone on their site: {describeMatch(formVerify.phoneMatch)}</div>
                  <div>Address on their site: {describeMatch(formVerify.addressMatch)}</div>
                  {formVerify.phoneCandidates?.length > 0 && <div>Phone numbers found on page: {formVerify.phoneCandidates.join(", ")}</div>}
                </>
              ) : (
                <div>Couldn&apos;t check ({formVerify.reason || formVerify.error || "no website given"}).</div>
              )}
            </div>
          )}

          {formStatus && <div className={`form-msg ${formStatus.type === "ok" ? "ok" : "err"}`}>{formStatus.message}</div>}
        </form>
      </section>

      {/* ---- All resources ---- */}
      <section>
        <h3 style={{ fontSize: 17, marginBottom: 12 }}>All resources ({resources.length})</h3>
        <input
          type="search"
          placeholder="Filter by name or category…"
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          style={{ marginBottom: 12, maxWidth: 320 }}
        />
        <div style={{ maxHeight: 480, overflowY: "auto", border: "1px solid var(--line)", borderRadius: 10 }}>
          {filteredResources.map((r) => {
            const cat = CATEGORY_BY_SLUG[r.category];
            return (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "9px 14px",
                  borderBottom: "1px solid var(--line)",
                  fontSize: 13.5,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  {r.verified && <span title="Verified" style={{ color: "var(--sage)" }}>✓</span>}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                  <span className="badge" style={{ background: cat ? cat.tint : "var(--teal-tint)", color: cat ? cat.color : "var(--teal-dark)", borderColor: "transparent", flex: "none" }}>
                    {cat ? cat.label : r.category}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, flex: "none" }}>
                  <button className="btn" style={{ background: "transparent", border: "1px solid var(--line)", padding: "4px 10px", fontSize: 12.5 }} onClick={() => startEdit(r)}>
                    Edit
                  </button>
                  <button
                    className="btn"
                    style={{ background: "transparent", color: "var(--rust)", border: "1px solid var(--rust-tint)", padding: "4px 10px", fontSize: 12.5 }}
                    disabled={busyId === r.id}
                    onClick={() => handleDelete(r)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {filteredResources.length === 0 && <div className="empty">No resources match that filter.</div>}
        </div>
      </section>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="panel-block" style={{ padding: "14px 16px" }}>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value === null || value === undefined ? "—" : value.toLocaleString()}</div>
      <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{label}</div>
    </div>
  );
}

function describeMatch(match) {
  if (match === true) return "✓ found";
  if (match === false) return `${String.fromCharCode(10007)} not found`;
  return "— not checked";
}
