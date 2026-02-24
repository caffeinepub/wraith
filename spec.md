# Specification

## Summary
**Goal:** Build the WRAITH Ops Platform — a dark-themed classified operations web app with three core modules: Mission Management Dashboard, Intelligence Hub, and Field Ops Briefing Tool, all backed by a Motoko ICP backend with stable storage.

**Planned changes:**

**Mission Management Dashboard**
- Create, view, update, and delete covert missions with fields: codename, status (Active / Compromised / Completed / Aborted), threat level (Low / Elevated / Critical), assigned operatives, mission type (Recon / Cyber / Counter-Terror / In-Person Op), objectives list, and timestamped field reports
- Display missions in a sortable, filterable list with status badges and threat level indicators
- Filter missions by status and threat level

**Intelligence Hub**
- Asset Profiles sub-section: create, view, edit, and delete operative profiles with codename, clearance level, specialization, status, and bio notes
- Threat Assessments sub-section: create, view, edit, and delete threat entries with subject name, threat category, risk score (1–10), summary, and linked missions
- Encrypted Notes sub-section: create, view, edit, and delete classified notes with title, body, classification tag (CONFIDENTIAL / SECRET / TOP SECRET / TS-SCI), and timestamp
- Tabbed UI to navigate between the three sub-sections

**Field Ops Briefing Tool**
- Create, edit, delete, and view mission briefings with fields: operation codename, mission date, lead officer, objectives list (add/remove items), HVT profiles (name, description, threat tier), exfil routes (freeform text), rules of engagement, and classification level
- "Briefing View" mode renders a formatted classified document layout suitable for presentation

**Visual Theme**
- Dark near-black background with off-white, amber, and red high-contrast text
- Monospaced / military-style typography with glowing amber accent elements and terminal aesthetics
- Classification banner strips on sensitive views
- Redaction-style UI components (blacked-out bars for high-sensitivity fields)
- Side panel or top bar navigation styled as a classified ops control panel
- WRAITH logo and textured background applied across the app

**Backend**
- Motoko single-actor backend with stable storage for all missions, asset profiles, threat assessments, encrypted notes, and briefings

**User-visible outcome:** Users can manage covert missions, maintain an intelligence hub of operatives/threats/notes, and compose formatted classified briefings — all within a dark, terminal-styled classified-ops interface backed by an ICP Motoko backend.
