# Estimates v2 — Product Requirements

> **Author:** Daniil Mossyakov | **Last updated:** 2026-04-01
> **Status:** In progress — product discussions ongoing. See `workbook.md` for phase status.
>
> **How to use this file:**
> This is the internal working document — crisp, factual, decision-oriented. It captures every product decision, component spec, and policy as we align on them. It is NOT the audience-facing version. A separate, more readable narrative doc will be written later for leadership/engineers/designers. When adding to this file: facts over prose, tables over paragraphs, decisions stated plainly.

---

## Quick Reference

| Item | Value |
|---|---|
| PDP formula | `max((Pay-In + Risk), Treasury) + Pay-Out + buffers` |
| Producers (order) | Pay-In → Risk (optional) → Treasury (optional) → Pay-Out |
| Delay color: green | current_estimate ≤ original_estimate |
| Delay color: yellow | current_estimate > original_estimate by ≥2 min absolute AND >0% relative AND <10% relative *(Dev View label only)* |
| Delay color: red | current_estimate > original_estimate by ≥10% relative *(Dev View label only)* |
| Notify threshold — yellow (push) | ≥2 min absolute AND ≥5% relative — see Notification Policy |
| Notify threshold — red (push + SMS/WhatsApp) | ≥10 min absolute AND ≥10% relative — see Notification Policy |
| Delay display — Customer View | Minutes only (e.g. "20 minutes late") — never show % to customers |
| Delay display — Dev View | Minutes + percentage (e.g. "+20 min · +8.3%") |
| Customer-caused color | Distinct muted/slate color vs Remitly/partner delays |
| Yellow delay action | $2 credit applied to account |
| Red delay action | Full fee refund |
| Uncertain delay (Risk review) | Proactive heads-up only — no refund commitment |
| Target app | Narwhal (React frontend) |

---

## Glossary

| Dev Term | Customer Term | Definition |
|---|---|---|
| **Pay-In** | **Payment** | Remitly capturing money from the sender (ACH, Debit Card, Apple/Google Pay, etc.) |
| **Pay-Out** | **Disbursement** | Remitly/partner delivering money to the recipient (Bank Deposit, Cash Pickup, Mobile Wallet, Push to Card) |
| **Risk / Sideline** | **Review** | Risk team pauses transaction; may require customer action (document upload). 3 sub-steps: Remitly review → Customer upload → Remitly review |
| **Treasury / CFP** | *(hidden from customers)* | Treasury adds delay to secure funds (e.g. for ACH). Dev View only |
| **Estimate** | — | Estimated time for a remittance transaction to complete |
| **PDP** | — | Perfect Delivery Promise — same as Estimate but specifically covers `original_estimate` |
| **PDP Hit/Miss** | — | Hit: disbursement_end < original_estimate. Miss: opposite. Measured in % |
| **PDP Accuracy** | — | % of transactions delivered within 30min before the promise (too early also = inaccuracy) |
| **draft_estimate** | — | Pre-submit estimate shown during send flow; not persisted |
| **original_estimate** | — | Calculated at "Send" press — most precise point-in-time estimate; persisted. Also called `original_pdp` in code |
| **current_estimate** | — | Recalculated as transaction progresses; latest version shown to customer; all versions persisted. Also called `current_pdp` in code |
| **Push Funds** | — | Pay-In method where the customer wires money to Remitly; customer owns the timing |
| **Partner / Route** | — | Disbursement partner |
| **Narwhal** | — | Frontend React app |
| **TUS** | — | Transaction User State — state machine state |
| **Transaction Lifecycle** | — | End-to-end progress bar from Payment to Disbursement |
| **LAT** | — | Low Amount Transfer: $0–$1,000 |
| **HAT** | — | High Amount Transfer. T1: $1k–$3k. T2: $3k–$30k. T3: $30k+ |

---

## Context and Problem

Remitly estimates work like navigation ETA — they are not a single number but a live, recalculating signal across three stages:

1. **draft_estimate** — shown during the send flow as the customer fills in details. Not all info collected yet; not persisted.
2. **original_estimate** — calculated at the moment the customer presses Send. Most precise; persisted. This is the promise.
3. **current_estimate** — recalculated as the transaction moves through the state machine; all versions persisted; the latest is shown to the customer.

**The problem today:** Estimates exist in the backend but are not used to actively guide customers, surface blockers, or nudge action. Customers in delay situations find out by calling CS — not from Remitly. The goal of Estimates v2 is to flip this: proactive, real-time communication that treats the customer as a partner in getting their money delivered on time.

---

## Estimate Presentation Across the Send Flow

### Design principle

- **Pre-commit (send flow):** Ranges are acceptable — the customer hasn't committed yet, and ranges help them make an informed choice between methods.
- **Post-commit (original_estimate):** Point estimate only. This is the promise. Remitly owns it.
- **During execution (current_estimate):** Point estimate, with explicit delta vs. original_estimate when they differ.
- No `~` prefix anywhere. No hedging disclaimers. The system presents clean, confident numbers.

### By screen

| Screen | Data available | Recommended format |
|---|---|---|
| Calculator (no method selected) | Corridor only | "as fast as X min" teaser — no commitment |
| Delivery method select | Corridor + each pay-out option | Range per option derived from p10/p90 (e.g. "30–90 min"). Helps customer compare. |
| Payment method select | Corridor + pay-out + each pay-in option | Narrow range or point approaching specificity |
| Summary (draft_estimate) | Full: corridor + pay-in + pay-out + recipient | **Point estimate: "by 6:30 PM"** — the magic moment. Clean, confident, no qualifier. |
| Post-submit (original_estimate) | All of the above, locked | **Point: "by 6:30 PM"** — the promise. |
| During execution (current_estimate) | original_estimate + live TSM state | Point + delta: "now by 7:00 PM (+30 min)" |

### Speed estimate data — current state and migration path

Pre-submit speed estimates (calculator, method selection screens) are currently served by `product-merchandising-service`, reading from a static CSV (`data/speed_merchandising_estimate_config.csv`). This CSV contains `percentile_10_minutes` and `percentile_90_minutes` per `(corridor, payment_profile_type, payment_profile_variant, destination_type)` — an 80% confidence interval — but the API response discards this interval and returns only display strings (`long_text`, `short_text`, `icon`).

**Migration goal:** Replace `product-merchandising-service` with the unified PDP/Estimates service, so one service controls estimates across all product screens. This unlocks structured p10/p90 data for pre-selection screens and eliminates the text-string approach.

---

## Feature: Transaction Lifecycle Bar

### Purpose

A horizontal segmented progress bar on the Transfer Detail page (and as a teaser in the send flow). Shows the customer exactly where their money is, what's coming next, and what (if anything) they need to do.

### Bar Structure

| | Customer View | Dev View |
|---|---|---|
| Always shown | Payment, Disbursement | Pay-In, Pay-Out |
| Shown if applicable | Review | Risk, Treasury |
| Treasury | Hidden — absorbed into Payment timing | Visible as distinct step |
| Hidden if not applicable | Producers not involved in this transaction | Same |

### Visual States

Each stage is a pill/badge segment with color fill, iconography, and optional animation.

| State | Visual Treatment | When Used |
|---|---|---|
| **Pending** | Muted / unfilled outline | Stage not yet started |
| **Active — Remitly** | Blue filled, subtle pulse | Remitly is processing |
| **Active — Customer** | Amber/slate filled, CTA indicator | Waiting for customer action (Push Funds wire, doc upload, Amendment fix) |
| **On Track** | Green filled | Progressing within original_estimate |
| **Yellow Delay** | Yellow filled | Slight Remitly-caused delay (<10% relative) |
| **Red Delay** | Red filled | Significant delay (≥10% relative) |
| **Uncertain Delay** | Yellow filled + "?" badge | Risk review in progress; cause unknown |
| **Completed** | Green filled + checkmark | Stage finished |
| **Delivered** | Green filled + celebration | Final Pay-Out completed |

### Estimate Display Rules

- Show countdown AND datetime: "in 3h 45min · by 6:15 PM"
- When current_estimate ≠ original_estimate, show both and call out the delta explicitly
- Customer-caused delays: slate/amber color — visually distinct from Remitly/partner delays
- Customer-caused stages: tappable → action sheet with instructions
- Remitly-owned stages: tappable → status detail ("We're on track!" or delay explanation + concession notice)
- **Estimate Track Record:** inline trust signal near the ETA on green/on-track transactions: "✓ On time for your last 7 transfers to Rosa". Only shown when ≥3 prior transactions exist on the same sender→recipient pair.

### Customer Input Stages

**Push Funds (Pay-In — customer-owned):**
- Slate color; shows wire instructions inline (bank name + reference, one-tap copy)
- Nudge: "Wire in the next 2 hours and Rosa's money arrives by 6:30 PM"
- Pay-Out shows conditional ETA: "4h after your wire is received"

**Risk / Review (3 sub-steps):**
1. Remitly initial review — Remitly-owned (blue)
2. Customer document upload — customer-owned (slate, tappable CTA)
3. Remitly re-review — Remitly-owned (blue)

Sub-step 2: tap → action sheet with upload instructions + urgency nudge
Sub-steps 1 & 3: tap → reassurance + expected Remitly review time

### Remitly-Caused Delay Actions

**Yellow delay** (color: ≥2 min AND >0% AND <10% relative; notification fires at ≥5% relative):
- Push notification + $2 goodwill credit
- Lifecycle bar shows: "As a thank-you for your patience, we've added a $2 credit to your next transfer."

**Red delay** (≥10% relative; notification fires at ≥10 min AND ≥10% relative):
- Push + SMS/WhatsApp notification + full fee refund
- Lifecycle bar shows: "This delay is on us. We're refunding your fee in full."

**Uncertain delay (Risk review in progress):**
- Proactive heads-up only: "We're reviewing your transfer. This usually takes about 27 minutes."
- No refund commitment — cause not yet known
- If later confirmed Remitly-caused → standard delay rules apply

### Copy Tone

- **Default:** Warm, simple, human. Speak to Carlos, not an engineer.
- **Customer-caused waits:** Empathetic + urgent. "Rosa's counting on you — the sooner you act, the sooner she gets her money."
- **Remitly-caused delays:** Take ownership. "We're sorry — this one's on us." Always include new ETA.
- **Uncertain delays:** Honest + reassuring. No refund commitments.
- **Delivered:** Celebratory. "Rosa got her money! Delivered 43 minutes early."
- Always include expected arrival datetime alongside warm copy.

---

## Feature: Estimate Change Notifications

### Overview

When an estimate changes — delay or early delivery — Remitly notifies the sender proactively. The policy below defines channels, thresholds, and batching rules.

### Transaction Tiers

| Tier | Send amount |
|---|---|
| LAT | $0 – $1,000 |
| HAT Tier 1 | $1,000 – $3,000 |
| HAT Tier 2 | $3,000 – $30,000 |
| HAT Tier 3 | $30,000+ |

### Channel Selection

| Channel | When to use |
|---|---|
| **Push notification** | Always — first channel for all events |
| **SMS** | Moderate+ delays; safety net when WhatsApp status unknown |
| **WhatsApp** | `whatsapp_flag = Y` → WhatsApp only. `whatsapp_flag = unknown` → WhatsApp + SMS. `whatsapp_flag = N` → SMS only |
| **CS call** | Severe delays and stuck transfers — threshold varies by tier |

### Notification Thresholds

| Event | Trigger | Push | SMS / WhatsApp | CS call |
|---|---|---|---|---|
| Slight delay (yellow) | ≥2 min AND ≥5% relative | ✅ | — | — |
| Moderate delay (red) | ≥10 min AND ≥10% relative | ✅ | ✅ | HAT T2+: if ≥3h late |
| Severe delay | ≥60 min OR ≥25% relative | ✅ | ✅ | HAT T1: if ≥3h late; HAT T2+: any severe |
| Transfer stuck | Paused >4h | ✅ | ✅ | HAT T1: >8h; HAT T2: >4h; HAT T3: immediately |
| Customer action needed | Doc upload, Push Funds, Amendment | ✅ | ✅ | — |
| Delay resolved | current_estimate ≤ original_estimate | ✅ | — | — |
| Early delivery | Delivered ≥15 min early | ✅ | — | — |

LAT: no CS calls. CS calls placed during sender's local business hours (8am–8pm) only; outside hours → queue for next morning.

### Debounce and Batching

1. **15-minute debounce**: same-direction changes within 15 min → suppress, update in-app silently.
2. **Escalation override**: higher severity tier crossed → send immediately, ignore debounce.
3. **Recovery always immediate**: good news never delayed.
4. **3-notification cap per transaction**: suppress further delay notifications after 3 sent, until delivery or "stuck" escalation.
5. **Reset on recovery**: after "back on track" or "delivered", debounce window and count reset.

### Copy Tone per Channel

- **Push**: Warm, one sentence + updated ETA.
- **SMS**: Functional — transfer ID, new ETA, action link if applicable.
- **WhatsApp**: Warmer than SMS, short CTA with deep link.
- **CS call**: Lead with ETA → cause → applicable concession.

---

## Feature: Concession Policy

### Principle

If Remitly committed to a delivery time and missed it for reasons within our control, a concession is owed — proactively, without the customer asking. Proactive concessions reduce CS call volume, partially offsetting their cost, and build long-term trust and retention.

### Cause Attribution

| Stage | Scenario | Remitly-caused? |
|---|---|---|
| Pay-In | Infrastructure delay | Yes |
| Risk step 1 | Remitly initial review exceeds SLA | Yes |
| Risk step 2 | Customer delays document upload | No |
| Risk step 3 | Remitly re-review exceeds SLA | Yes — customer did their part |
| Treasury / CFP | CFP hold exceeds hardcoded rule | Yes |
| Pay-Out | Partner processing slower than estimate | Yes — Remitly owns partner SLA |
| Amendment | Customer entered wrong account number | No for fix time; yes if Remitly's processing of the amendment exceeds commitment |

### Consumer Concession Tiers

Credits auto-applied to account balance; deducted automatically at next checkout. Red supersedes yellow (full refund, no stacking).

| Tier | Trigger | Concession |
|---|---|---|
| Yellow | ≥5% relative AND ≥2 min | $2 goodwill credit |
| Red | ≥10% relative AND ≥10 min | Full fee refund |
| Severe | ≥60 min OR ≥25% relative | Full fee refund + $5 credit |
| HAT T3 severe | ≥60 min OR ≥25% relative | Full fee refund + $10 credit + CS call |

### SMB Concession Tiers

Percentage-based on affected recipient's transfer amount, reflecting Remitly's high-confidence estimate commitment for business customers. Applied per affected recipient within a batch; on-time recipients unaffected.

| Tier | Trigger | Concession (per affected recipient) |
|---|---|---|
| Yellow | ≥5% relative AND ≥2 min | 2% of transfer amount (min $25) |
| Red | ≥10% relative AND ≥10 min | Full fee refund + 5% of transfer amount |
| Severe | ≥60 min OR ≥25% relative | Full fee refund + 10% of transfer amount + CS call |

*Example: $950 severe delay → fee refund + $95 credit. $5,000 severe delay → fee refund + $500 credit.*

### Escalation Handling

If a customer contacts CS after a proactive concession: agent confirms applied concession + updated ETA; no automatic stacking. HAT T2/T3 and SMB severe may escalate to supervisor for discretionary judgment.

### Measurement Framework

```
Net_intervention_cost = concession_amount + (CS_calls_not_prevented × $4)
```

| Metric | Definition | Purpose |
|---|---|---|
| Concession spend per delayed transaction | SUM(concessions) / delayed_transactions | Unit economics baseline |
| CS call prevention rate | call_rate_no_concession − call_rate_with_concession | Quantifies cost offset |
| Net intervention cost | concession_spend − (calls_prevented × $4) | Should trend toward zero or negative |
| 90-day retention delta | Delayed+concession vs delayed+no-concession cohort | Near-term NPV signal |
| 12-month NPV delta | (retained_customers × avg_LTV) − total_concession_spend | Ultimate health check |

If 12-month NPV delta is negative: adjust tier sizing, not the principle.

---

## Out of Scope

- Real backend integration (all estimates v2 work starts with demo; hardcoded data)
- Non-remittance transaction types (wallet, lending)
- Hedwig ML model integration (referenced as future Pay-Out improvement)
- Actual push notification / SMS / WhatsApp delivery infrastructure
- Automated concessions backend
- Amendment backend logic

---

## Source Material & Repos

### Reference Documents

- [Estimates v2 Requirements](https://docs.google.com/document/d/1RFq6sU5K-Upd3cHrOGzfFVQ4oSFN3_Be7C-VlkqKfvo/edit)
- [Estimates Strategy 2025–2026](https://docs.google.com/document/d/1sRkGyzpExbJkMnEd9OWtjlKlO1AmFFemtSlfBLlgKeY/edit)
- [PDP Audit](https://docs.google.com/document/d/1hcwxz48jXNiisPWGPK2UXZgAR_k0JL-kTZpWZCkA7cM/edit)

### Key Repositories

| Repo | Purpose |
|---|---|
| `Remitly/CXCoreService` — `/src/.../domain/pdp` | Core estimates/PDP logic |
| `Remitly/narwhal` | Frontend React app |
| `Remitly/mammoth` — `ReviewTxnUserState.php` | Risk sideline +1hr logic |
| `Remitly/product-merchandising-service` *(legacy)* | Pre-submit speed estimates — to be replaced by unified PDP/Estimates service |
