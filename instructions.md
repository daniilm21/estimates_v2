# Claude Instructions - Estimates v2 Project

> Read this file at the start of every session that touches the Estimates v2 project.

---

## File Roles

| File | Purpose | Audience |
|---|---|---|
| `product.md` | Source of truth for what Estimates v2 is. Tech-heavy spec, organized around L1 / L2 / Dimensions / L3. Carries canonical thresholds, schemas, copy. | Humans + Claude |
| `prd.md` | Readable narrative PRD for PMs/analysts/eng + Directors. Architectural commitments and rationale. References `product.md` for canonical values. | Humans (review), Claude |
| `demo.md` | Full spec for the demo app: scenarios, states, copy, interactions, data. Reflects whatever is in `product.md`. | Claude primarily |
| `workbook.md` | Live project plan: phases, tasks, owners, Jira links, status. Phased around L1 / L2 / Dimensions / L3. | Humans + Claude |
| `instructions.md` | This file. Operating rules for Claude on this project. | Claude |
| `estimates_v2_prd.md` | Archive of the original combined PRD. Do not edit. | Archive |

---

## Layered Architecture (the spine of the program)

| Layer | Owner | Job | Output |
|---|---|---|---|
| **L1: Raw Inventory** | Estimates | Capture every warranted PDP recalc with reason and reason_group | Rows in `manila.transaction_delivery_promise` |
| **L2: Business Classification** | Estimates | Stamp interesting recalcs with business labels | Label parameter on a `current_pdp` version |
| **Dimensions** | CapMan | Provide customer/transaction segmentation | Read API consumed by L3 |
| **L3: Actions** | Estimates | Decide and execute customer-facing actions | Notifications, lifecycle bar, concessions, reactive UI |

Selection rule: `action_set = f(L2_label, L1_reason_group, dimensions)`.

---

## Working on product.md

- `product.md` is the primary working document. Source of truth for what we are building.
- When Daniil and Claude align on a product decision in conversation, Claude writes it into `product.md` immediately.
- **Style:** crisp, factual, decision-oriented. Facts over prose. Tables over paragraphs. Decisions stated plainly. No fluff.
- `product.md` is NOT the audience-facing version. That is `prd.md`.
- Every entry captures the **what** and the **decision**. The **why** only when non-obvious or would otherwise be lost.
- Place each entry in the correct layer section. If a decision spans layers, write it in the layer that owns it primarily and cross-reference.

---

## Working on prd.md

- `prd.md` is the readable narrative for PMs, analysts, eng, and their managers (Directors as top reviewer).
- Mirror architectural commitments from `product.md` but explain the WHY for a non-spec audience.
- Do not duplicate canonical values; reference `product.md` for thresholds, copy, and tables.
- Keep the layered structure: L1 / L2 / Dimensions / L3.

---

## PRD → Demo Impact Check (mandatory)

**Every time `product.md` is updated**, Claude must:

1. Check `demo.md` for any content that conflicts with or is affected by the change.
2. Classify the impact:
   - **No impact**: demo is already consistent, or the change is product-only strategy not yet in demo scope.
   - **Safe update**: change can be reflected in demo without breaking anything.
   - **Breaking change**: change requires demo logic/copy/data to be refactored; describe exactly what breaks and propose a fix.
3. Report to the user before touching `demo.md`.

**Claude never edits `demo.md` without explicit user approval after this check.**

---

## Workbook

- `workbook.md` is the live project plan. Update it whenever phases, tasks, or statuses change.
- Mark the current active step clearly with `→ CURRENT`.
- Jira tickets are linked inline when they exist. Pull ticket status when the user references a specific item.
- Phases are organized around the layered architecture (Phase 0 = product definition; Phase 1 = L1 audit; etc.).

---

## Tone and Approach

- **Always ask clarifying questions** before doing significant work. Do not assume.
- **Be direct and push back** when a proposal seems illogical, inconsistent with prior decisions, or bad for customers. State why.
- **Customers come first.** If a product decision optimizes for Remitly's short-term economics at the expense of customer experience, flag it explicitly.
- **Never gold-plate.** If a question is simple, answer it simply. Do not add unrequested sections, features, or analysis.
- **Avoid em-dashes and AI-speak.** Sound authentic.
- Prefer discussion → alignment → writing, in that order. Do not write spec for unaligned decisions.
