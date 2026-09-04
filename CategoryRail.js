"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Browse" },
  { href: "/add", label: "Add a Resource" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--line)",
        background: "var(--panel)",
      }}
    >
      <div
        className="shell"
        style={{
          paddingTop: 28,
          paddingBottom: 22,
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: '"IBM Plex Mono"',
              fontSize: 11,
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              color: "var(--teal-dark)",
              margin: "0 0 6px",
            }}
          >
            Community resource directory
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 600 }}>
            <Link href="/" style={{ color: "var(--ink)", textDecoration: "none" }}>
              The Help Network
            </Link>
          </h1>
          <p style={{ margin: "6px 0 0", color: "var(--ink-soft)", maxWidth: "46ch", fontSize: 14 }}>
            A directory of mental health, recovery, shelter, and support resources — for people who
            need them, and the organizations that provide them. Starting in North Texas.
          </p>
        </div>
        <nav
          style={{
            display: "flex",
            gap: 4,
            background: "var(--teal-tint)",
            padding: 4,
            borderRadius: 10,
          }}
        >
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "9px 16px",
                  borderRadius: 7,
                  fontSize: 13.5,
                  fontWeight: 500,
                  textDecoration: "none",
                  color: active ? "var(--ink)" : "var(--teal-dark)",
                  background: active ? "var(--panel)" : "transparent",
                  boxShadow: active ? "var(--shadow)" : "none",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
