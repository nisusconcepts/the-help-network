"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="panel-block" style={{ maxWidth: 380 }}>
      <h2 style={{ fontSize: 20, marginBottom: 6 }}>Admin sign in</h2>
      <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 18 }}>
        This is the review-queue login — create your account in the Supabase dashboard first (see
        README.md), then sign in here.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {error && <div className="form-msg err">{error}</div>}
      </form>
    </div>
  );
}

