"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES } from "@/lib/categories";

const EMPTY_FORM = {
  submitter_type: "individual",
  name: "",
  category: CATEGORIES[1]?.slug || CATEGORIES[0].slug,
  description: "",
  phone: "",
  area: "",
  address: "",
  hours: "",
  requirements: "",
  website: "",
  note: "",
};

export default function AddResourcePage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null); // { type: 'ok' | 'err', message }
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const { error } = await supabase.from("submissions").insert({
      ...form,
      status: "pending",
    });

    setSubmitting(false);
    if (error) {
      setStatus({ type: "err", message: `Something went wrong (${error.message}). Please try again.` });
    } else {
      setStatus({ type: "ok", message: "Thanks — this will be reviewed before it appears in the directory." });
      setForm(EMPTY_FORM);
    }
  }

  return (
    <div className="panel-block" style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Add a resource</h2>
      <p style={{ color: "var(--ink-soft)", margin: "0 0 20px", fontSize: 13.5 }}>
        Know a service that should be listed — or run one yourself? Organizations are welcome to add
        their own listing directly. Every submission is reviewed before it goes live, which keeps the
        directory accurate and safe.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Who&apos;s submitting this?</label>
          <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
              <input
                type="radio"
                name="submitter_type"
                checked={form.submitter_type === "individual"}
                onChange={() => update("submitter_type", "individual")}
              />
              I found this resource
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
              <input
                type="radio"
                name="submitter_type"
                checked={form.submitter_type === "organization"}
                onChange={() => update("submitter_type", "organization")}
              />
              I represent this organization
            </label>
          </div>
        </div>

        <div className="field">
          <label htmlFor="s-name">Organization name</label>
          <input id="s-name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="s-category">Category</label>
          <select id="s-category" required value={form.category} onChange={(e) => update("category", e.target.value)}>
            {CATEGORIES.filter((c) => c.slug !== "start-here").map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="s-desc">What do they help with?</label>
          <textarea
            id="s-desc"
            required
            placeholder="Short description of services offered"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div className="field two">
          <div>
            <label htmlFor="s-phone">Phone</label>
            <input id="s-phone" type="tel" placeholder="(xxx) xxx-xxxx" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <label htmlFor="s-area">City / region</label>
            <input id="s-area" placeholder="e.g. Fort Worth, TX" value={form.area} onChange={(e) => update("area", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="s-address">Address</label>
          <input id="s-address" placeholder="Street, city, ZIP" value={form.address} onChange={(e) => update("address", e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="s-hours">Hours / days open</label>
          <input
            id="s-hours"
            placeholder="e.g. Mon-Fri 9am-3pm, closed Sun"
            value={form.hours}
            onChange={(e) => update("hours", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="s-requirements">Requirements to receive services (optional)</label>
          <textarea
            id="s-requirements"
            placeholder="e.g. photo ID, proof of address, appointment needed, income limits"
            value={form.requirements}
            onChange={(e) => update("requirements", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="s-website">Website (optional)</label>
          <input id="s-website" type="url" placeholder="https://" value={form.website} onChange={(e) => update("website", e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="s-note">Anything else the reviewer should know? (optional)</label>
          <textarea id="s-note" value={form.note} onChange={(e) => update("note", e.target.value)} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit for review"}
        </button>

        {status && <div className={`form-msg ${status.type === "ok" ? "ok" : "err"}`}>{status.message}</div>}
      </form>
    </div>
  );
}

