# Estimates v2 — Workbook

> This is the live project plan for Estimates v2. Claude updates this whenever phases, tasks, or statuses change.
> Source spreadsheet: https://docs.google.com/spreadsheets/d/1OWZR1Fj4yq8biriurNwL3uBPsyWdgYhvoFODF207BAU/edit

---

## How to Read This File

- **Phases** are the top-level units of work. They expand over time as product, demo, and dev work are defined.
- **`→ CURRENT`** marks the active step.
- **Status:** `Not started` / `In progress` / `Done` / `Blocked`
- **Jira:** tickets are linked inline when they exist. Claude pulls status on request.

---

## Project Phases

> Phases TBD — to be defined once `product.md` is complete and fully aligned.
> Current state: product discussions in progress. Phase plan will be built at the end of the product definition stage.

### Phase 0 — Product Definition *(→ CURRENT)*

Goal: Fully align on what Estimates v2 looks like across every dimension before any build begins. Output: finalized `product.md`.

| Task | Status | Jira | Notes |
|---|---|---|---|
| Lifecycle bar — feature spec | Done | — | In `product.md` |
| Notification policy | Done | — | In `product.md` |
| Concession policy | Done | — | In `product.md` |
| Estimate presentation by screen | Done | — | In `product.md` |
| Speed merchandising migration path | Done | — | In `product.md` |
| Project management setup (this file + instructions.md) | Done | — | — |
| Remaining product topics (TBD) | Not started | — | To be identified |

---

## Upcoming Phases (outline — details TBD)

These phases will be fully specced once Phase 0 is complete.

| Phase | Type | Description |
|---|---|---|
| Phase 1 | Demo | Build Send Flow tab |
| Phase 2 | Demo | Build Scenario 1 — Happy Path |
| Phase 3 | Demo | Build Scenario 2 — Delay |
| Phase 4 | Demo | Build Scenario 3 — Push Funds |
| Phase 5 | Demo | Build Scenario 4 — Risk Review |
| Phase 6 | Demo | Build Scenario 5 — Amendment |
| Phase 7 | Demo | Build Scenario 6 — SMB |
| Phase 8 | Demo | Polish + UX review pass |
| Phase 9 | Demo | Present to leadership |
| Phase 10 | Dev | Backend — unified PDP/Estimates service |
| Phase 11 | Dev | Frontend — Narwhal integration (lifecycle bar) |
| Phase 12 | Dev | Notifications infrastructure |
| Phase 13 | Dev | Concessions backend |
| Phase 14 | QA | Testing |
| Phase 15 | Analytics | Instrumentation + dashboards |
| Phase 16 | Launch | — |

*Phases will be broken into tasks with Jira links as work approaches.*

---

## Jira Integration

Jira tickets will be linked inline in the task tables above. Claude pulls ticket status on request when a specific item is referenced.

Project board: TBD (link here when confirmed)

---

## Notes & Decisions Log

| Date | Decision | Context |
|---|---|---|
| 2026-04-01 | Notification yellow threshold: ≥2 min AND ≥5% relative | Color threshold stays at >0% AND ≥2 min; notification requires additional ≥5% to avoid noise |
| 2026-04-01 | SMB concessions: % of transfer amount (not flat) | Reflects high-confidence estimate commitment for SMB; scales naturally with transfer size |
| 2026-04-01 | Red refund supersedes yellow credit | No stacking — if yellow credit issued and escalates to red, issue full refund and cancel credit |
| 2026-04-01 | Credit mechanics: auto-applied to account balance | No code, no claim — deducted automatically at next checkout |
| 2026-04-01 | estimates_v2_prd.md kept as archive | Original combined PRD; do not edit |
| 2026-04-01 | `product-merchandising-service` identified as legacy | p10/p90 data exists in CSV but discarded by API; migration to unified PDP/Estimates service will surface it |
