# Estimates v2 - Product Spec (source of truth)

> **Author:** Daniil Mossyakov | **Last updated:** 2026-05-07
> **Status:** Layered refactor complete. PRD lives in `prd.md`. Workbook lives in `workbook.md`.
>
> **How to use this file:**
> Internal working spec, organized around the layered architecture (L1 / L2 / Dimensions / L3). Crisp, factual, decision-oriented. Captures every product decision, component spec, and policy. NOT the audience-facing version (that is `prd.md`). Facts over prose, tables over paragraphs, decisions stated plainly.

---

## Quick Reference

| Item | Value |
|---|---|
| Architecture | L1 (raw inventory) → L2 (business labels) → Dimensions (CapMan) → L3 (actions) |
| L1 storage | `manila.transaction_delivery_promise` |
| L1 keys | `recalculation_reason`, `reason_group` (Remitly+partner / customer / mix) |
| L1 coverage rule | 100% of warranted recalcs recorded |
| L2 stamping unit | Label parameter on a `current_pdp` version |
| L3 selection rule | `action_set = f(L2_label, L1_reason_group, dimensions)` |
| PDP formula | `max((Pay-In + Risk), Treasury) + Pay-Out + buffers` |
| Producers (order) | Pay-In → Risk (optional) → Treasury (optional) → Pay-Out |
| L2 label: green (no stamp) | current_estimate ≤ original_estimate |
| L2 label: mild_relative_delay | current_estimate > original_estimate by ≥2 min absolute AND >0% relative AND <10% relative |
| L2 label: critical_relative_delay | current_estimate > original_estimate by ≥10% relative |
| L3 yellow notify trigger | mild_relative_delay AND ≥2 min absolute AND ≥5% relative |
| L3 red notify trigger | critical_relative_delay AND ≥10 min absolute AND ≥10% relative |
| L3 delay display, Customer View | Minutes only (e.g. "20 minutes late"); never show % to customers |
| L3 delay display, Dev View | Minutes + percentage (e.g. "+20 min · +8.3%") |
| L3 customer-caused color | Distinct muted/slate color vs Remitly/partner delays |
| L3 yellow action | $2 credit applied to account |
| L3 red action | Full fee refund |
| L3 uncertain action (Risk in progress) | Proactive heads-up; no refund commitment |
| Target app | Narwhal (React frontend) |

---

## Glossary

| Dev Term | Customer Term | Definition |
|---|---|---|
| **L1** | - | Raw inventory layer. Every warranted PDP recalc stored with reason and reason_group. |
| **L2** | - | Business classification layer. Stamps labels on interesting `current_pdp` versions. |
| **Dimensions** | - | Customer/transaction segmentation. Owned by CapMan, consumed by L3. |
| **L3** | - | Action layer. Selects and executes customer-facing actions. |
| **recalculation_reason** | - | Code identifying why a `current_pdp` row was written. L1-owned. |
| **reason_group** | - | Cause attribution: Remitly+partner, customer, or mix. L1-owned. |
| **L2 label** | - | Business classification stamped on a `current_pdp` version (e.g. `critical_relative_delay`). |
| **action_set** | - | Set of L3 actions selected for a single qualifying recalc. |
| **Pay-In** | **Payment** | Remitly capturing money from the sender (ACH, Debit Card, Apple/Google Pay, etc.) |
| **Pay-Out** | **Disbursement** | Remitly/partner delivering money to the recipient (Bank Deposit, Cash Pickup, Mobile Wallet, Push to Card) |
| **Risk / Sideline** | **Review** | Risk team pauses transaction; may require customer action. 3 sub-steps: Remitly review → Customer upload → Remitly review |
| **Treasury / CFP** | *(hidden)* | Treasury adds delay to secure funds (e.g. for ACH). Dev View only |
| **Estimate** | - | Estimated time for a remittance transaction to complete |
| **PDP** | - | Perfect Delivery Promise; same as Estimate but specifically the `original_pdp` |
| **PDP Hit/Miss** | - | Hit: disbursement_end < original_estimate. Miss: opposite. Measured in % |
| **PDP Accuracy** | - | % of transactions delivered within 30 min before the promise (too early also = inaccuracy) |
| **draft_estimate** | - | Pre-submit estimate shown during send flow; not persisted |
| **original_estimate** | - | Calculated at "Send" press; most precise point-in-time estimate; persisted. Also `original_pdp` in code |
| **current_estimate** | - | Recalculated as transaction progresses; latest version shown to customer; all versions persisted. Also `current_pdp` in code |
| **Push Funds** | - | Pay-In method where the customer wires money to Remitly; customer owns the timing |
| **Partner / Route** | - | Disbursement partner |
| **Narwhal** | - | Frontend React app |
| **TUS** | - | Transaction User State; state machine state |
| **Transaction Lifecycle** | - | End-to-end progress bar from Payment to Disbursement |
| **LAT** | - | Low Amount Transfer: $0 to $1,000 |
| **HAT** | - | High Amount Transfer. T1: $1k to $3k. T2: $3k to $30k. T3: $30k+ |
| **CapMan** | - | Capability Management; owner of customer/transaction dimensions |

---

## Architecture

Estimates v2 is a layered system. Each layer has one owner, one contract, and changes independently.

| Layer | Owner | Job | Output |
|---|---|---|---|
| **L1: Raw Inventory** | Estimates | Capture every warranted PDP recalc with reason and reason_group | Rows in `manila.transaction_delivery_promise` |
| **L2: Business Classification** | Estimates | Stamp interesting recalcs with business labels | Label parameter on a `current_pdp` version |
| **Dimensions** | CapMan | Provide customer/transaction segmentation | Read API consumed by L3 |
| **L3: Actions** | Estimates | Decide and execute customer-facing actions | Notifications, lifecycle bar, concessions, reactive UI |

### Selection rule

```
action_set = f(L2_label, L1_reason_group, dimensions)
```

L1 and L2 are cause-agnostic and dimension-agnostic. L3 reads cause from L1 and segmentation from Dimensions, then produces treatment.

### Data contract between layers

| Producer | Consumer | Contract |
|---|---|---|
| L1 → L2 | New `current_pdp` row with `recalculation_reason` and `reason_group` populated | L2 reads magnitude only (current vs original) |
| L1 → L3 | Same row + `reason_group` | L3 reads `reason_group` for ownership-aware action selection |
| L2 → L3 | Label parameter on the version | L3 fires when label crosses an action threshold |
| Dimensions → L3 | Customer + transaction segmentation snapshot at recalc time | L3 reads to pick channels, copy variants, concession tiers |

---

## Layer 1: Raw Inventory

### Goal

100% of warranted PDP recalculations are recorded in `manila.transaction_delivery_promise`, each row with a correct `recalculation_reason` and `reason_group`.

### Audit dependency (Phase 1, top item in workbook)

We do not know whether all warranted recalcs fire today. ~4 reason codes exist today. Phase 1 deliverable:

1. Enumerate lifecycle events that should trigger a recalc (full universe).
2. Compare against what fires today; document gaps.
3. Define canonical `reason_code` and `reason_group` taxonomy.
4. Adjudicate ambiguous reasons (e.g. authorization latency: customer or Remitly).

Until the audit closes, L2 and L3 design proceeds against the assumed shape, but downstream wiring waits.

### Reason taxonomy (illustrative; finalized by audit)

| Reason (illustrative) | reason_group |
|---|---|
| Transaction stuck in UDE | customer |
| Transaction amended | customer |
| Transaction sidelined (Risk rule X) | Remitly |
| Authorization took longer than expected | customer or Remitly (resolved per case during audit) |
| Customer did not wire funds | customer |
| Partner delay | Remitly |

### Scope of L1

In scope:

- Schema additions to `manila.transaction_delivery_promise` (if needed) for `reason_code` and `reason_group`.
- Instrumentation of recalc emit points across the transaction state machine.
- Migration of pre-submit speed estimates from `product-merchandising-service` to the unified PDP/Estimates service so all estimate surfaces share one data source.

Out of scope at L1:

- Magnitude classification (yellow/red).
- Notification, concession, or display logic.
- Cause re-derivation downstream. L1's `reason_group` is final.

---

## Layer 2: Business Classification

### Goal

Stamp the small subset of `current_pdp` versions that matter with a business label.

### Label set

| Label | Definition |
|---|---|
| `critical_absolute_delay` | current_pdp later than original_pdp by ≥10 min absolute |
| `critical_relative_delay` | current_pdp later than original_pdp by ≥10% relative |
| `mild_absolute_delay` | current_pdp later than original_pdp by ≥2 min and <10 min absolute |
| `mild_relative_delay` | current_pdp later than original_pdp by >0% and <10% relative |
| `severe_delay` | current_pdp later by ≥60 min OR ≥25% relative |
| `early_delivery` | current_pdp earlier than original_pdp by ≥15 min |

Labels are not mutually exclusive: a recalc can carry multiple labels. L3 decides combination handling.

### Stamping mechanism

- Label is a parameter attached to a `current_pdp` version row.
- Computed and written when the recalc is persisted (single write, no separate state machine).
- The version is the unit of classification.

### Cause-agnostic

L2 reads magnitude only. Cause attribution is L1's reason_group, read directly by L3.

---

## Dimensions

### Source

CapMan owns customer and transaction dimensions. Estimates is a consumer.

### Dimensions consumed (initial set)

| Dimension | Values |
|---|---|
| Customer tenure | NCA (new customer activation), Nth (returning) |
| Customer type | Regular, SMB, Freelancer |
| Amount tier | LAT ($0 to $1k), HAT T1 ($1k to $3k), HAT T2 ($3k to $30k), HAT T3 ($30k+) |
| Send pattern | 1:1, 1:many (bulk send), many:1 |
| Geography | Corridor (sender country to recipient country) |

Adding a new dimension is a CapMan-side change plus an L3 read; L1 and L2 are unaffected.

---

## Layer 3: Actions

### Selection rule

```
action_set = f(L2_label, L1_reason_group, dimensions)
```

L3 produces a set of actions per qualifying recalc, scoped to the customer and the transaction.

### v1 action surface

| Action | Type | When fired |
|---|---|---|
| Reactive display | Always-on | Every Transfer Detail page render |
| Lifecycle bar render | Always-on | Every Transfer Detail page render |
| Push notification | Triggered | L2 label crosses notify threshold; debounced |
| SMS / WhatsApp notification | Triggered | Critical/severe labels; channel by tier dimension |
| CS call | Triggered | HAT T2+, severe or stuck; in business hours only |
| Goodwill credit | Triggered | mild_*_delay AND reason_group = Remitly |
| Fee refund | Triggered | critical_*_delay AND reason_group = Remitly |
| Severe concession | Triggered | severe_delay AND reason_group = Remitly |
| In-app guidance | Triggered | reason_group = customer AND customer can act |

### L3.1 Reactive display

Transfer Detail page renders the latest `current_pdp` on every view. No trigger; always live.

Estimate display rules:

- Show countdown AND datetime: "in 3h 45min · by 6:15 PM"
- When current_estimate ≠ original_estimate, show both and call out the delta explicitly.
- Customer-caused delays: slate/amber color (visually distinct from Remitly/partner delays).
- **Estimate Track Record**: inline trust signal near the ETA on green/on-track transactions: "✓ On time for your last 7 transfers to Rosa". Only shown when ≥3 prior transactions exist on the same sender→recipient pair.

### L3.2 Lifecycle Bar

Horizontal segmented progress bar on the Transfer Detail page (and as a teaser in the send flow).

#### Bar structure

| | Customer View | Dev View |
|---|---|---|
| Always shown | Payment, Disbursement | Pay-In, Pay-Out |
| Shown if applicable | Review | Risk, Treasury |
| Treasury | Hidden (absorbed into Payment timing) | Visible as distinct step |
| Hidden if not applicable | Producers not involved in this transaction | Same |

#### Visual states

| State | Visual treatment | When used |
|---|---|---|
| Pending | Muted / unfilled outline | Stage not yet started |
| Active - Remitly | Blue filled, subtle pulse | Remitly is processing |
| Active - Customer | Amber/slate filled, CTA indicator | Waiting for customer action (Push Funds wire, doc upload, Amendment fix) |
| On Track | Green filled | Progressing within original_estimate |
| Yellow Delay | Yellow filled | mild_*_delay AND reason_group = Remitly |
| Red Delay | Red filled | critical_*_delay AND reason_group = Remitly |
| Uncertain Delay | Yellow filled + "?" badge | Risk review in progress; cause unknown |
| Completed | Green filled + checkmark | Stage finished |
| Delivered | Green filled + celebration | Final Pay-Out completed |

#### Customer input stages

**Push Funds** (Pay-In, customer-owned):

- Slate color; shows wire instructions inline (bank name + reference, one-tap copy).
- Nudge: "Wire in the next 2 hours and Rosa's money arrives by 6:30 PM"
- Pay-Out shows conditional ETA: "4h after your wire is received"

**Risk / Review** (3 sub-steps):

1. Remitly initial review (Remitly-owned, blue)
2. Customer document upload (customer-owned, slate, tappable CTA)
3. Remitly re-review (Remitly-owned, blue)

Sub-step 2 tap → action sheet with upload instructions + urgency nudge.
Sub-steps 1 and 3 tap → reassurance + expected Remitly review time.

#### Copy tone

- Default: warm, simple, human. Speak to Carlos, not an engineer.
- Customer-caused waits: empathetic + urgent. "Rosa's counting on you. The sooner you act, the sooner she gets her money."
- Remitly-caused delays: take ownership. "We're sorry. This one's on us." Always include new ETA.
- Uncertain delays: honest + reassuring. No refund commitments.
- Delivered: celebratory. "Rosa got her money! Delivered 43 minutes early."

### L3.3 Notifications

#### Channel selection

| Channel | When to use |
|---|---|
| Push notification | Always; first channel for all events |
| SMS | Moderate+ delays; safety net when WhatsApp status unknown |
| WhatsApp | `whatsapp_flag = Y` → WhatsApp only. `whatsapp_flag = unknown` → WhatsApp + SMS. `whatsapp_flag = N` → SMS only |
| CS call | Severe delays and stuck transfers; threshold varies by tier |

#### Triggers

| Event (L2 label + reason_group + dimension) | Push | SMS / WhatsApp | CS call |
|---|---|---|---|
| `mild_*_delay` (yellow) AND reason=Remitly AND ≥2 min absolute AND ≥5% relative | ✅ | - | - |
| `critical_*_delay` (red) AND reason=Remitly AND ≥10 min absolute AND ≥10% relative | ✅ | ✅ | HAT T2+: if ≥3h late |
| `severe_delay` AND reason=Remitly | ✅ | ✅ | HAT T1: if ≥3h late; HAT T2+: any severe |
| Transfer stuck, paused >4h | ✅ | ✅ | HAT T1: >8h; HAT T2: >4h; HAT T3: immediately |
| Customer action needed (reason=customer): doc upload, Push Funds, Amendment | ✅ | ✅ | - |
| Delay resolved (current_estimate ≤ original_estimate) | ✅ | - | - |
| `early_delivery` (delivered ≥15 min early) | ✅ | - | - |

LAT: no CS calls. CS calls placed during sender's local business hours (8am to 8pm) only; outside hours queue for next morning.

#### Debounce and batching

1. **15-minute debounce**: same-direction changes within 15 min are suppressed and updated in-app silently.
2. **Escalation override**: higher severity tier crossed → send immediately, ignore debounce.
3. **Recovery always immediate**: good news never delayed.
4. **3-notification cap per transaction**: suppress further delay notifications after 3 sent, until delivery or "stuck" escalation.
5. **Reset on recovery**: after "back on track" or "delivered", debounce window and count reset.

#### Copy tone per channel

- Push: warm, one sentence + updated ETA.
- SMS: functional. Transfer ID, new ETA, action link if applicable.
- WhatsApp: warmer than SMS, short CTA with deep link.
- CS call: lead with ETA → cause → applicable concession.

### L3.4 Concessions

Principle: if Remitly committed to a delivery time and missed it for reasons within our control, a concession is owed proactively, without the customer asking. L3 reads `reason_group` from L1; L2 magnitude label sets the tier; dimensions set the size.

#### Cause attribution (read from L1 reason_group)

| Stage | Scenario | reason_group |
|---|---|---|
| Pay-In | Infrastructure delay | Remitly |
| Risk step 1 | Remitly initial review exceeds SLA | Remitly |
| Risk step 2 | Customer delays document upload | customer |
| Risk step 3 | Remitly re-review exceeds SLA | Remitly (customer did their part) |
| Treasury / CFP | CFP hold exceeds hardcoded rule | Remitly |
| Pay-Out | Partner processing slower than estimate | Remitly (we own partner SLA) |
| Amendment | Customer entered wrong account number | customer for fix time; Remitly if our processing of the amendment exceeds commitment |

#### Consumer concession tiers

Credits auto-applied to account balance; deducted automatically at next checkout. Red supersedes yellow (full refund, no stacking).

| L2 label | Concession |
|---|---|
| `mild_*_delay` (yellow) | $2 goodwill credit |
| `critical_*_delay` (red) | Full fee refund |
| `severe_delay` | Full fee refund + $5 credit |
| `severe_delay` AND HAT T3 | Full fee refund + $10 credit + CS call |

#### SMB concession tiers

Percentage-based on affected recipient's transfer amount. Applied per affected recipient within a batch; on-time recipients unaffected.

| L2 label | Concession (per affected recipient) |
|---|---|
| `mild_*_delay` (yellow) | 2% of transfer amount (min $25) |
| `critical_*_delay` (red) | Full fee refund + 5% of transfer amount |
| `severe_delay` | Full fee refund + 10% of transfer amount + CS call |

Examples: $950 severe delay → fee refund + $95 credit. $5,000 severe delay → fee refund + $500 credit.

#### Escalation handling

If a customer contacts CS after a proactive concession: agent confirms applied concession + updated ETA; no automatic stacking. HAT T2/T3 and SMB severe may escalate to supervisor for discretionary judgment.

### L3.5 In-app guidance

Triggered when `reason_group = customer` and the customer can act.

| Trigger | Guidance |
|---|---|
| Push Funds Pay-In active | Wire instructions inline (bank name + reference + amount + one-tap copy). Time-bounded nudge ("wire in the next 2 hours and Rosa's money arrives by 6:30 PM"). |
| Risk doc upload required | Action sheet with upload instructions + accepted document list + urgency nudge. |
| Amendment required (e.g., bad account number) | Two options: (A) fix the value, (B) switch to a faster pay-out. Option B includes "X faster than Option A" prominent callout. |

### L3.6 Send-flow estimate presentation

Pre-commit estimates (calculator, method selection, summary) read from L1 directly. No L2 stamp involved (no commitment yet). The point estimate at summary is the moment `original_pdp` is locked.

#### By screen

| Screen | Data available | Recommended format |
|---|---|---|
| Calculator (no method selected) | Corridor only | "as fast as X min" teaser; no commitment |
| Delivery method select | Corridor + each pay-out option | Range per option from p10/p90 (e.g. "30 to 90 min"). Helps customer compare. |
| Payment method select | Corridor + pay-out + each pay-in option | Narrow range or point approaching specificity |
| Summary (draft_estimate) | Full: corridor + pay-in + pay-out + recipient | **Point estimate: "by 6:30 PM"**. The magic moment. Clean, confident, no qualifier. |
| Post-submit (original_estimate) | All of the above, locked | **Point: "by 6:30 PM"**. The promise. |
| During execution (current_estimate) | original_estimate + live TSM state | Point + delta: "now by 7:00 PM (+30 min)" |

Design principles:

- Pre-commit: ranges acceptable (the customer has not committed; ranges help compare methods).
- Post-commit: point estimate only.
- During execution: point estimate, with explicit delta vs. original_estimate when they differ.
- No `~` prefix anywhere. No hedging disclaimers.

#### Migration: product-merchandising-service → unified PDP/Estimates service

Pre-submit speed estimates today come from `product-merchandising-service`, reading a static CSV (`data/speed_merchandising_estimate_config.csv`) with `percentile_10_minutes` and `percentile_90_minutes` per `(corridor, payment_profile_type, payment_profile_variant, destination_type)`. The API discards the interval and returns display strings only.

Migration goal: replace `product-merchandising-service` with the unified PDP/Estimates service so one service controls estimates across all product screens. This is L1 build work.

---

## Out of Scope (v1)

- Hedwig ML model integration for pay-out estimation (future improvement).
- Non-remittance products (wallet, lending).
- Partner-side feedback (e.g., automated partner penalty signals).
- Real-time SMS / WhatsApp delivery infrastructure (assumed available; not built here).
- New dimensions beyond CapMan's current set.
- Customer-facing PDP audit visibility (showing the customer the recalc history).
- Demo backend integration; demo continues with hardcoded data.

---

## Source Material and Repos

### Reference documents

- [Estimates v2 Requirements](https://docs.google.com/document/d/1RFq6sU5K-Upd3cHrOGzfFVQ4oSFN3_Be7C-VlkqKfvo/edit)
- [Estimates Strategy 2025-2026](https://docs.google.com/document/d/1sRkGyzpExbJkMnEd9OWtjlKlO1AmFFemtSlfBLlgKeY/edit)
- [PDP Audit](https://docs.google.com/document/d/1hcwxz48jXNiisPWGPK2UXZgAR_k0JL-kTZpWZCkA7cM/edit)
- [JAGUAR-1464](https://remitly.atlassian.net/browse/JAGUAR-1464) (program umbrella)

### Key repositories

| Repo | Purpose | Layer |
|---|---|---|
| `Remitly/CXCoreService` (`/src/.../domain/pdp`) | Core estimates/PDP logic | L1, L2 |
| `Remitly/narwhal` | Frontend React app | L3 (lifecycle bar, reactive display, in-app guidance) |
| `Remitly/mammoth` (`ReviewTxnUserState.php`) | Risk sideline +1hr logic | L1 (recalc emit) |
| `Remitly/product-merchandising-service` *(legacy)* | Pre-submit speed estimates; to be replaced by unified PDP/Estimates service | L1 (migrating) |
