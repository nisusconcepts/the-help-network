:root {
  --paper: #eef1ee;
  --panel: #ffffff;
  --ink: #182422;
  --ink-soft: #4b5b56;
  --line: rgba(24, 36, 34, 0.13);
  --teal: #1f5f5b;
  --teal-dark: #123c39;
  --teal-tint: #e3efed;
  --amber: #c97a2b;
  --amber-tint: #f7e6d2;
  --rust: #a8443a;
  --rust-tint: #f5e0dd;
  --sage: #3f7057;
  --sage-tint: #e1ede4;
  --shadow: 0 1px 2px rgba(24, 36, 34, 0.06), 0 8px 24px -16px rgba(24, 36, 34, 0.25);
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: #0f1e1b;
    --panel: #16302b;
    --ink: #e9efec;
    --ink-soft: #a7bcb5;
    --line: rgba(255, 255, 255, 0.13);
    --teal: #69bbb2;
    --teal-dark: #8fd0c8;
    --teal-tint: rgba(105, 187, 178, 0.15);
    --amber: #e2a35d;
    --amber-tint: rgba(226, 163, 93, 0.16);
    --rust: #dd8b80;
    --rust-tint: rgba(221, 139, 128, 0.16);
    --sage: #84c4a1;
    --sage-tint: rgba(132, 196, 161, 0.16);
    --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px -16px rgba(0, 0, 0, 0.5);
  }
}

* {
  box-sizing: border-box;
}

html,
body {
  padding: 0;
  margin: 0;
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.5;
}

h1,
h2,
h3 {
  font-family: "Source Serif 4", Georgia, serif;
  text-wrap: balance;
  margin: 0;
}

.mono {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
}

a {
  color: var(--teal-dark);
}

button {
  font-family: inherit;
}

:focus-visible {
  outline: 2px solid var(--teal);
  outline-offset: 2px;
}

.shell {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px 64px;
}

.badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
  border: 1px solid var(--line);
  color: var(--ink-soft);
}
.badge.urgent {
  color: var(--rust);
  border-color: transparent;
  background: var(--rust-tint);
}
.badge.free {
  color: var(--sage);
  border-color: transparent;
  background: var(--sage-tint);
}

.panel-block {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 26px 28px;
  box-shadow: var(--shadow);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 14px;
}
.field label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-soft);
}
.field.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.field.two > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

input[type="text"],
input[type="tel"],
input[type="url"],
input[type="email"],
input[type="password"],
input[type="search"],
textarea,
select {
  padding: 9px 11px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--paper);
  color: var(--ink);
  font-size: 14px;
  font-family: inherit;
  width: 100%;
}
textarea {
  resize: vertical;
  min-height: 70px;
}

.btn {
  border: none;
  padding: 11px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: inline-block;
}
.btn-primary {
  background: var(--amber);
  color: #241407;
}
.btn:disabled {
  opacity: 0.55;
  cursor: default;
}

.form-msg {
  font-size: 13px;
  margin-top: 12px;
  padding: 9px 12px;
  border-radius: 8px;
}
.form-msg.ok {
  background: var(--sage-tint);
  color: var(--sage);
}
.form-msg.err {
  background: var(--rust-tint);
  color: var(--rust);
}

.empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--ink-soft);
}

/* Leaflet map container needs an explicit height or it renders collapsed */
.map-container {
  width: 100%;
  height: 420px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--line);
}
