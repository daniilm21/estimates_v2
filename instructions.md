# Claude Instructions — Estimates v2 Project

> Read this file at the start of every session that touches the Estimates v2 project.

---

## File Roles

| File | Purpose | Audience |
|---|---|---|
| `product.md` | Source of truth for what Estimates v2 is, how every feature works, and why. Evolves as product decisions are made. | Humans + Claude |
| `demo.md` | Full spec for the demo app — scenarios, states, copy, interactions, data. Reflects whatever is in `product.md`. | Claude primarily |
| `workbook.md` | Live project plan — phases, tasks, owners, Jira links, status. | Humans + Claude |
| `instructions.md` | This file. Operating rules for Claude on this project. | Claude |
| `estimates_v2_prd.md` | Archive of the original combined PRD. Do not edit. | Archive |

---

## Working on product.md

- `product.md` is the primary working document. It defines what we're building.
- When Daniil and Claude align on a product decision in conversation, Claude writes it into `product.md` immediately.
- **Style: crisp, factual, decision-oriented.** Facts over prose. Tables over paragraphs. Decisions stated plainly. No fluff.
- `product.md` is NOT the audience-facing version. A separate narrative doc for leadership/engineers/designers will be written later. Do not write for that audience here.
- Every entry should capture the **what** and the **decision** — the "why" only when it is non-obvious or would be lost otherwise.

---

## PRD → Demo Impact Check (mandatory)

**Every time `product.md` is updated**, Claude must:

1. Check `demo.md` for any content that conflicts with or is affected by the change.
2. Classify the impact:
   - **No impact** — demo is already consistent, or the change is product-only strategy not yet in demo scope.
   - **Safe update** — change can be reflected in demo without breaking anything.
   - **Breaking change** — change requires demo logic/copy/data to be refactored; describe exactly what breaks and propose a fix.
3. Report to the user before touching `demo.md`. Examples:

> "We added the severe delay tier to `product.md`. Updating `demo.md` to match won't break anything — Scenario 2 just needs a new sub-state. Want me to add it?"

> "We changed the yellow notification threshold from ≥2 min to ≥2 min AND ≥5% relative. In `demo.md`, the Dev View notification panel in Scenario 2 references the old threshold. Updating it is safe but I'll need to change the annotation on the +20 min recalculation event. Want me to proceed?"

> "We restructured the Risk step attribution logic. This **will break** Scenario 4 Step 3 in `demo.md` — the ETA calculation and the 'no refund' copy both depend on the old model. Here's my proposed fix: [fix]. Want me to go this route?"

**Claude never edits `demo.md` without explicit user approval after this check.**

---

## Workbook

- `workbook.md` is the live project plan. Update it whenever phases, tasks, or statuses change.
- Mark the current active step clearly with `→ CURRENT`.
- Jira tickets are linked inline when they exist. Pull ticket status when the user references a specific item.
- Phases are added to `workbook.md` as they are defined — do not speculate ahead of what has been agreed.

---

## Tone and Approach

- **Always ask clarifying questions** before doing significant work. Don't assume.
- **Be direct and push back** when a proposal seems illogical, inconsistent with prior decisions, or bad for customers. State why.
- **Customers come first.** If a product decision optimises for Remitly's short-term economics at the expense of customer experience, flag it explicitly.
- **Never gold-plate.** If a question is simple, answer it simply. Don't add unrequested sections, features, or analysis.
- Prefer discussion → alignment → writing, in that order. Don't write spec for unaligned decisions.
