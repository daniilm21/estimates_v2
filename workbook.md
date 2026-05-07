# Estimates v2 - Workbook

> Live project plan for Estimates v2, organized around the layered architecture (L1 / L2 / Dimensions / L3).
> Source spreadsheet: https://docs.google.com/spreadsheets/d/1OWZR1Fj4yq8biriurNwL3uBPsyWdgYhvoFODF207BAU/edit
> Program umbrella: [JAGUAR-1464](https://remitly.atlassian.net/browse/JAGUAR-1464)

---

## How to read this file

- **Phases** are the top-level units of work, aligned to L1 / L2 / Dimensions / L3.
- **`→ CURRENT`** marks the active phase.
- **Status:** `Not started` / `In progress` / `Done` / `Blocked`
- **Jira:** tickets linked inline as they exist. Pull status on request.

---

## Phase summary

| Phase | Layer | Type | Status | Description |
|---|---|---|---|---|
| Phase 0 | - | Product | In progress | Product definition: finalize `product.md` + `prd.md` |
| Phase 1 | L1 | Discovery | Not started | **L1 Audit (top item)**: enumerate warranted recalcs, document gaps, finalize reason taxonomy |
| Phase 2 | L1 | Build | Not started | L1 instrumentation + reason_code/reason_group fill + merchandising migration |
| Phase 3 | L2 | Build | Not started | Classification engine + label stamping |
| Phase 4 | Dimensions | Integration | Not started | Consume CapMan dimensions |
| Phase 5 | L3 | Build | Not started | Reactive display + Lifecycle bar (Narwhal) |
| Phase 6 | L3 | Build | Not started | Notifications (push, SMS, WhatsApp, CS calls) |
| Phase 7 | L3 | Build | Not started | Concessions backend |
| Phase 8 | L3 | Build | Not started | In-app guidance (Push Funds, Risk, Amendment) |
| Phase 9 | L3 | Build | Not started | Send-flow estimate presentation finalization |
| Phase 10 | All | Analytics | Not started | Instrumentation + dashboards |
| Phase 11 | All | QA | Not started | Testing |
| Phase 12 | All | Launch | Not started | Rollout + retro |

---

## Phase 0 - Product Definition *(→ CURRENT)*

Goal: align on layered architecture and produce the source-of-truth + readable PRD before any build begins.

| Task | Status | Jira | Notes |
|---|---|---|---|
| Lifecycle bar feature spec | Done | - | In `product.md` (L3.2) |
| Notification policy | Done | - | In `product.md` (L3.3) |
| Concession policy | Done | - | In `product.md` (L3.4) |
| Estimate presentation by screen | Done | - | In `product.md` (L3.6) |
| Speed merchandising migration path | Done | - | In `product.md` (L1 / L3.6) |
| Layered architecture refactor | Done | - | `product.md` reorganized around L1 / L2 / Dimensions / L3 |
| PRD (`prd.md`) | Done | - | Readable narrative, audience: PMs/analysts/eng + Directors |
| Workbook re-phasing | Done | - | This file |
| Project management setup (instructions.md update) | In progress | - | Add `prd.md` to file roles |
| Stakeholder review (PRD walkthrough) | Not started | - | Review with PM, eng leads, design, analytics |

---

## Phase 1 - L1 Audit *(top item; NEXT after Phase 0)*

Goal: ground L1 in reality. Enumerate the universe of warranted PDP recalc events and finalize the canonical reason taxonomy.

| Task | Status | Jira | Notes |
|---|---|---|---|
| Enumerate lifecycle events that warrant a recalc | Not started | TBD | Owner: TBD. Output: full list of state-machine events that should fire a recalc |
| Audit which events fire today vs are missing | Not started | TBD | Compare against `manila.transaction_delivery_promise` history |
| Inventory current `recalculation_reason` values | Not started | TBD | Today: ~4 codes. Document each with definition + example txns |
| Define canonical `reason_code` taxonomy | Not started | TBD | Final list of codes, each with definition |
| Define `reason_group` mapping (Remitly+partner / customer / mix) | Not started | TBD | E2E mapping owned by L1; ambiguous cases adjudicated here |
| Adjudicate ambiguous reasons (e.g., authorization latency) | Not started | TBD | Rules vs ML vs manual queue; decision documented |
| Audit deliverable | Not started | TBD | Doc + schema proposal + gap list with severity |

---

## Phase 2 - L1 Build

Goal: make L1 reliable and complete; close audit gaps; consolidate the data source.

| Task | Status | Jira | Notes |
|---|---|---|---|
| Schema additions to `manila.transaction_delivery_promise` (if needed) | Not started | TBD | `reason_code`, `reason_group` columns, indexes |
| Instrument missing recalc emit points | Not started | TBD | Per Phase 1 gap list |
| Backfill strategy decision | Not started | TBD | Forward-only vs historical backfill (open question in PRD) |
| Backfill execution (if approved) | Not started | TBD | - |
| Migrate `product-merchandising-service` to unified PDP/Estimates service | Not started | TBD | L1 data consolidation; expose p10/p90 to pre-submit screens |
| L1 SLOs defined (latency, completeness) | Not started | TBD | Recalc write within X seconds of trigger event |
| L1 monitoring + alerting | Not started | TBD | Coverage + reason_code completeness dashboards |

---

## Phase 3 - L2 Classification

Goal: stamp interesting `current_pdp` versions with business labels.

| Task | Status | Jira | Notes |
|---|---|---|---|
| Finalize label set | Not started | TBD | Initial: critical/mild absolute/relative, severe, early. See `product.md` |
| Threshold values approved | Not started | TBD | Canonical thresholds in `product.md`; confirm with stakeholders |
| Label parameter schema on `current_pdp` version | Not started | TBD | Single write at recalc persist time |
| Classification engine implementation | Not started | TBD | Cause-agnostic; magnitude only |
| Regression test suite for label correctness | Not started | TBD | ≥99% target |
| L2 monitoring + alerting | Not started | TBD | Label rate, conflicting label sequences |

---

## Phase 4 - Dimensions Integration

Goal: read customer/transaction segmentation from CapMan at recalc time.

| Task | Status | Jira | Notes |
|---|---|---|---|
| Confirm CapMan API + dimensions available | Not started | TBD | Owner: CapMan team. Initial set per `product.md` |
| Consumer client implementation | Not started | TBD | Read snapshot at recalc time |
| Caching / freshness policy | Not started | TBD | Dimensions can change between recalcs |
| Fallback behavior on CapMan unavailability | Not started | TBD | Default-tier behavior; do not block actions |

---

## Phase 5 - L3 Reactive Display + Lifecycle Bar

Goal: surface estimates on the Transfer Detail page; render lifecycle progress.

| Task | Status | Jira | Notes |
|---|---|---|---|
| Reactive display: latest `current_pdp` on Transfer Detail | Not started | TBD | Always-on; no trigger |
| Lifecycle bar visual states | Not started | TBD | Per `product.md` L3.2 |
| Customer View / Dev View toggle in Narwhal | Not started | TBD | Treasury hidden in Customer View |
| Estimate Track Record (sender→recipient on-time history) | Not started | TBD | Requires ≥3 prior on-pair transactions |
| Drill-down sheets (per stage tap) | Not started | TBD | Customer-action stages tappable to action sheet |

---

## Phase 6 - L3 Notifications

Goal: trigger proactive comms across push, SMS, WhatsApp, and CS call.

| Task | Status | Jira | Notes |
|---|---|---|---|
| Trigger engine wired to L2 labels + L1 reason_group + dimensions | Not started | TBD | Selection rule per `product.md` |
| Push channel | Not started | TBD | All events |
| SMS / WhatsApp routing per `whatsapp_flag` | Not started | TBD | Y / unknown / N rules |
| CS call queue + business-hours gating | Not started | TBD | LAT excluded; HAT thresholds per tier |
| Debounce + batch + 3-cap logic | Not started | TBD | 15-min debounce; severity escalation override; recovery immediate |
| Copy variants per channel | Not started | TBD | Push / SMS / WhatsApp / CS-call scripts |
| Localization | Not started | TBD | Per supported send-flow languages |

---

## Phase 7 - L3 Concessions

Goal: auto-apply credits and refunds based on L2 label + L1 reason_group + dimensions.

| Task | Status | Jira | Notes |
|---|---|---|---|
| Backend service for concession application | Not started | TBD | Auto-applied to account balance; deducted at next checkout |
| Consumer tier rules | Not started | TBD | $2 / fee refund / fee + $5 / fee + $10 + CS call |
| SMB tier rules (% of transfer) | Not started | TBD | 2% (min $25) / +5% / +10% + CS call |
| Supersession logic (red supersedes yellow, no stacking) | Not started | TBD | - |
| CS escalation policy (post-concession contacts) | Not started | TBD | No automatic stacking; supervisor discretion at HAT T2+ |
| Concession spend monitoring | Not started | TBD | Net intervention cost dashboard |

---

## Phase 8 - L3 In-app Guidance

Goal: actionable nudges for customer-action stages.

| Task | Status | Jira | Notes |
|---|---|---|---|
| Push Funds: inline wire instructions + copy buttons | Not started | TBD | Bank name + reference + amount + nudge |
| Risk doc upload action sheet | Not started | TBD | Upload + accepted docs + urgency |
| Amendment options (Option A: fix; Option B: switch faster) | Not started | TBD | Self-service amendment; "X faster" callout on faster option |
| Pay-In preservation copy on amendment screens | Not started | TBD | "Your payment is already processed; no restart, no extra fee" |

---

## Phase 9 - L3 Send-flow Estimate Presentation

Goal: ship the unified estimate presentation across calculator → method select → summary → post-submit → in-flight.

| Task | Status | Jira | Notes |
|---|---|---|---|
| Calculator teaser ("as fast as X min") | Not started | TBD | Corridor-only display |
| Method select range from p10/p90 | Not started | TBD | Requires unified PDP/Estimates service from Phase 2 |
| Summary point estimate ("by 6:30 PM") | Not started | TBD | The magic moment; clean, no qualifier |
| Post-submit point estimate (original_pdp lock) | Not started | TBD | - |
| In-flight point estimate + delta | Not started | TBD | "now by 7:00 PM (+30 min)" |

---

## Phase 10 - Analytics

Goal: instrument success metrics from PRD section 8.

| Task | Status | Jira | Notes |
|---|---|---|---|
| L1 coverage dashboard | Not started | TBD | % warranted recalcs captured |
| L1 reason_group accuracy sample audit | Not started | TBD | Quarterly human audit |
| L2 label correctness regression report | Not started | TBD | - |
| Notification reach metric | Not started | TBD | % delays with proactive notification before CS contact |
| CS call deflection metric | Not started | TBD | call_rate(no concession) - call_rate(with concession) |
| Net intervention cost dashboard | Not started | TBD | concession_spend - (calls_prevented × $4) |
| 12-month retention NPV cohort analysis | Not started | TBD | Delayed + concession vs delayed + no-concession |
| NPS impact dashboard | Not started | TBD | Cohort comparison |

---

## Phase 11 - QA

| Task | Status | Jira | Notes |
|---|---|---|---|
| L1 test plan (instrumentation coverage, schema, backfill) | Not started | TBD | - |
| L2 test plan (label correctness, edge cases) | Not started | TBD | - |
| L3 end-to-end test plan (lifecycle bar, notifications, concessions) | Not started | TBD | Across scenarios in `demo.md` |
| Localization QA | Not started | TBD | - |
| Load and reliability testing | Not started | TBD | Notification + concession services |

---

## Phase 12 - Launch

| Task | Status | Jira | Notes |
|---|---|---|---|
| Phased rollout plan (corridor / tier / dimension cuts) | Not started | TBD | Likely LAT first, HAT progressive |
| Feature-flag wiring | Not started | TBD | Statsig gates at L3 action level |
| Comms plan (CS readiness, internal launch) | Not started | TBD | - |
| Post-launch retro | Not started | TBD | 30 / 60 / 90 day reviews |

---

## Open dependencies

| Dependency | Owner | Blocks |
|---|---|---|
| CapMan dimensions API ready | CapMan team | Phase 4, then L3 phases |
| Notification infra (push / SMS / WhatsApp send) | Marketing eng / Comms platform | Phase 6 |
| CS call routing | CS Ops + comms platform | Phase 6 (CS call subset) |
| L1 audit ownership | Estimates team / TBD analyst | Phase 1 entirely |

---

## Notes and decisions log

| Date | Decision | Context |
|---|---|---|
| 2026-04-01 | Notification yellow threshold: ≥2 min AND ≥5% relative | Color threshold stays at >0% AND ≥2 min; notification requires additional ≥5% to avoid noise |
| 2026-04-01 | SMB concessions: % of transfer amount (not flat) | Reflects high-confidence estimate commitment for SMB; scales naturally with transfer size |
| 2026-04-01 | Red refund supersedes yellow credit | No stacking; if yellow credit issued and escalates to red, issue full refund and cancel credit |
| 2026-04-01 | Credit mechanics: auto-applied to account balance | No code, no claim; deducted automatically at next checkout |
| 2026-04-01 | `estimates_v2_prd.md` kept as archive | Original combined PRD; do not edit |
| 2026-04-01 | `product-merchandising-service` identified as legacy | p10/p90 data exists in CSV but discarded by API; migration to unified PDP/Estimates service will surface it |
| 2026-05-07 | Layered architecture adopted (L1 / L2 / Dimensions / L3) | Source of truth for the program structure; `product.md` and `prd.md` refactored accordingly |
| 2026-05-07 | reason_code → reason_group mapping is L1-owned E2E | L1 resolves ambiguous cases (e.g., auth latency); L2 stays cause-agnostic; L3 reads group as fact |
| 2026-05-07 | v1 ships full L3 surface | PRD covers full vision; workbook phases the release |
| 2026-05-07 | L1 audit is top workbook item | Without reliable raw inventory, L2 and L3 are built on sand |
