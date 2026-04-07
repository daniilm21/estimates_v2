# Estimates v2 — Product Requirements

> **Status:** Demo phase. Iterate here first; share with engineers/designers once happy.
> **Author:** Daniil Mossyakov | **Last updated:** 2026-03-26 (rev 2)

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
| **Delay display — Customer View** | **Minutes only** (e.g. "20 minutes late") — never show % to customers |
| **Delay display — Dev View** | Minutes + percentage (e.g. "+20 min · +8.3%") |
| Customer-caused color | Distinct muted color (e.g. grey/slate) vs Remitly/partner delays |
| Yellow delay action | Partial credit ($2) applied to next transaction |
| Red delay action | Full fee refund + notification |
| Uncertain delay (Risk review) | Proactive heads-up only — no refund commitment |
| Target app | Narwhal (React frontend) — Transfer Detail page |

---

## Glossary

Terms have two variants where applicable: **Dev** (internal/technical) and **Customer** (shown in the UI).

| Dev Term | Customer Term | Definition |
|---|---|---|
| **Pay-In** | **Payment** | Remitly capturing money from the sender (ACH, Debit Card, Apple/Google Pay, etc.) |
| **Pay-Out** | **Disbursement** | Remitly/partner delivering money to the recipient (Bank Deposit, Cash Pickup, Mobile Wallet, Push to Card) |
| **Risk / Sideline** | **Review** | Risk team pauses transaction; may require customer action (document upload). 3 sub-steps: Remitly review → Customer upload → Remitly review |
| **Treasury / CFP** | *(hidden from customers)* | Treasury adds delay to secure funds (e.g., for ACH). Dev View only |
| **Estimate** | — | Estimated time for a remittance transaction to complete |
| **PDP** | — | Perfect Delivery Promise — same as Estimate but specifically covers `original_estimate` |
| **PDP Hit/Miss** | — | Hit: disbursement_end < original_estimate. Miss: opposite. Measured in % |
| **PDP Accuracy** | — | % of transactions delivered within 30min before the promise (too early also = inaccuracy) |
| **draft_estimate** | — | Pre-submit estimate shown during send flow; not persisted |
| **original_estimate** | — | Calculated at "Send" press — most precise point-in-time estimate; persisted. Also called **`original_pdp`** in code — used interchangeably |
| **current_estimate** | — | Recalculated as transaction progresses; latest version shown to customer; all versions persisted. Also called **`current_pdp`** in code — used interchangeably |
| **Push Funds** | — | Pay-In method where the customer wires money to Remitly; customer owns the timing |
| **Partner / Route** | — | Disbursement partner |
| **Narwhal** | — | Frontend React app |
| **TUS** | — | Transaction User State — state machine state |
| **Transaction Lifecycle** | — | End-to-end progress bar from Payment to Disbursement |

---

## Context

Remitly estimates work like navigation ETA. Three estimate stages:

1. **draft_estimate** — shown during send flow as customer fills in details; inaccurate (not all info collected); not persisted
2. **original_estimate** — calculated at Send press; most precise; persisted
3. **current_estimate** — recalculated as transaction moves through TSM; multiple versions persisted; latest shown to customer

**The problem today:** Estimates are not used to guide customers or nudge them to act faster. The goal is a visual lifecycle bar that shows transaction state, ETA, blockers, and required customer actions.

---

## Demo Audience & Goals

**Audience:** Leadership / potential sponsors — familiar with internal systems and business metrics.

**Perspective:** Two views, toggled by a persistent **Customer View / Dev View** switch visible on all scenarios:

- **Customer View** *(default)*: Exactly what the customer sees in the Narwhal app. Uses customer-facing labels (Payment, Disbursement, Review). Treasury step is hidden — absorbed into Payment timing. This is the primary demo view.
- **Dev View**: Shows what's happening under the hood. Uses dev/technical labels (Pay-In, Pay-Out, Risk, Treasury). Treasury appears as a distinct step with a banner: *"⚙️ Dev View — Treasury is not shown to customers. ACH funding requires a 2-hour hold to secure funds."* All other content is identical to Customer View.

The toggle persists across scenario tabs.

**Demo structure:** Single page with a **scenario selector tab bar** at the top for live presentation:
`[Send Flow] | [1. Happy] [2. Delay] [3. Push Funds] [4. Risk Review] [5. Amendment] [6. SMB]`

- **`[Send Flow]`** — shared prologue. Always shown first. Submit routes to matching tab based on Pay-In selected: Debit Card/ACH → `[1. Happy]`, Push Funds → `[3. Push Funds]`. Presenter can jump to any tab at any time.
- **`[1–5]`** — Transfer Detail page states. Start directly in-flight; no send flow repeated.
- **`[6. SMB]`** — separate flow, addressed separately.

**Implementation:** React app (single-page, no backend, all data hardcoded).

Each tab has sub-states navigable within it (see below).

**Demo location in app:** Send Flow page (`[Send Flow]` tab) → Transfer Detail page (tabs 1–7).

---

## Mock Transactions

### Scenarios 1–4 (Consumer — Carlos → Rosa)

| Field | Value |
|---|---|
| **Sender** | Carlos Mendoza, Chicago, IL, 🇺🇸 USA |
| **Recipient** | Rosa Mendoza (Carlos' grandmother), Guadalajara, 🇲🇽 Mexico |
| **Country pairing** | 🇺🇸 USA → 🇲🇽 Mexico |
| **Amount** | $300.00 |
| **Pay-Out partner** | BBVA Mexico — Bank Deposit |
| **Transfer ID** | #RM-2847561 |
| **Transfer initiated** | Today at 2:30 PM |
| **Sender history** | Returning customer — previously sidelined for doc review (relevant to Scenario 1 doc nudge) |

Pay-In method and timing vary per scenario (defined in each scenario below).
**Send Flow tab** covers pre-submit for all consumer scenarios. Post-submit tabs (1–6) start at Transfer Detail directly.

### Scenario 5 (Amendment — Carlos → Rosa, stuck payout)

| Field | Value |
|---|---|
| **Sender** | Carlos Mendoza, Chicago, IL, 🇺🇸 USA |
| **Recipient** | Rosa Mendoza (Carlos' grandmother), Guadalajara, 🇲🇽 Mexico |
| **Pay-In method** | Debit Card — instant |
| **Pay-Out method** | Bank Deposit — BBVA Mexico *(stuck; amendment options available)* |
| **Amount** | $300.00 |
| **Transfer ID** | #RM-3091742 |
| **Transfer initiated** | Today at 2:30 PM |
| **Error** | Rosa's bank account number was rejected by BBVA Mexico — incorrect |

### Scenario 6 (SMB — John LLC batch payment)

| Field | Value |
|---|---|
| **Sender** | John LLC, New York, NY, 🇺🇸 USA |
| **Send country** | 🇺🇸 USA |
| **Pay-In method** | Debit Card — instant |
| **Total amount** | $4,300.00 |
| **Transfer ID** | #RM-5193847 |
| **Transfer initiated** | Today at 10:00 AM |

**Recipients (5 — different countries, different payout methods):**

| # | Recipient | Country | Amount | Payout Method | Partner | Status |
|---|---|---|---|---|---|---|
| 1 | Maria Garcia | 🇲🇽 Mexico | $800 | Bank Deposit | BBVA Mexico | ✅ Delivered — 11:47 AM |
| 2 | Juan Reyes | 🇵🇭 Philippines | $600 | Mobile Wallet | GCash | ✅ Delivered — 12:03 PM |
| 3 | Priya Patel | 🇮🇳 India | $1,200 | Bank Deposit | HDFC Bank | 🟢 In Progress — on track by 5:30 PM |
| 4 | Ana Oliveira | 🇧🇷 Brazil | $750 | Push to Card | Nubank | 🟢 In Progress — on track by 6:00 PM |
| 5 | Carlos Diaz | 🇨🇴 Colombia | $950 | Cash Pickup | Efecty | 🔴 Late — 45 min delay |

---

## Data Model

### Estimate Formula
```
original_estimate = max((Pay-In + Risk), Treasury) + Pay-Out + orchestration_buffers
current_estimate  = recalculated estimate + TUS-based buffers
```

### Four Estimate Producers

| Dev Label | Customer Label | Optional? | Customer-owned portion? | Notes |
|---|---|---|---|---|
| Pay-In | Payment | No | Sometimes (Push Funds) | DES provides hardcoded/estimated/instant types |
| Risk | Review | Yes | Yes (doc upload step only) | 3 sub-steps: Remitly review → Customer upload → Remitly review |
| Treasury | *(hidden)* | Yes | No | Hardcoded CFP rules; **Dev View only** — hidden in Customer View |
| Pay-Out | Disbursement | No | No | Final ETA; 43.3% of PDP misses; Hedwig ML model for key partners |

### Component Visual States

Each lifecycle stage has a distinct visual state. States should be rendered as visually rich pill/badge segments — not just icons. Color fills, iconography, and subtle animation all contribute.

| State | Visual Treatment | When Used |
|---|---|---|
| **Pending** | Muted / unfilled outline pill | Stage not yet started |
| **Active — Remitly** | Blue filled, subtle pulse animation | Remitly is processing this stage |
| **Active — Customer** | Amber/slate filled, call-to-action indicator | Waiting for customer action — covers all customer-caused blocks: pending wire (Push Funds), doc upload (Review), incorrect account number (Amendment). Visually consistent across all three cases. |
| **On Track** | Green filled | Stage complete or progressing within original_estimate |
| **Yellow Delay** | Yellow filled | Slight delay (<10% relative); partial credit offered |
| **Red Delay** | Red filled | Significant delay (≥10% relative); full fee refund |
| **Uncertain Delay** | Yellow filled + "?" badge | Risk review in progress; delay possible but cause unknown |
| **Completed** | Green filled + checkmark | Stage finished |
| **Delivered 🎉** | Green filled + celebration treatment | Final Pay-Out completed — money received |

### Estimate Display Rules

- Show **countdown** AND **datetime** format (e.g., "in 3h 45min · by 6:15 PM")
- Show `original_estimate` vs `current_estimate` when they differ — call out the delta
- Color the current state per the table above
- Customer-caused delays: **muted/slate color** — visually distinct from Remitly/partner delays
- Customer-caused components: **interactive/clickable** → detailed action instructions
- Happy-path components (no action needed): clickable → "We're on track! 🎉" with estimated time for that stage
- **Estimate Track Record** — small inline trust signal displayed near the ETA on green/on-track transactions: *"✓ On time for your last 7 transfers to Rosa"*. Only shown when there are ≥3 prior transactions on the same sender→recipient pair. Reinforces promise credibility without cluttering the UI.

### Copy Tone

- **Default:** Warm, simple, human. No technical jargon. Speak to Carlos, not to an engineer.
- **Customer-caused waits:** Empathetic + urgent nudge. "Rosa's counting on you — the sooner you act, the sooner she gets her money."
- **Remitly-caused delays:** Even warmer, take ownership. "We're sorry — this one's on us." Always include the new expected arrival time.
- **Uncertain delays (Risk review):** Honest + reassuring. "We're reviewing your transfer. We'll update you shortly." No commitments on refunds.
- **Delivered:** Celebratory. "Rosa got her money! 🎉 Delivered 43 minutes early."
- Always include the **expected arrival datetime** alongside any warm copy — customers need the functional answer even when the tone is emotional.

---

## Feature: Transaction Lifecycle Bar

### Bar Structure

A horizontal segmented progress bar on the Transfer Detail page, showing all stages left to right.

| | Customer View | Dev View |
|---|---|---|
| Always shown | Payment, Disbursement | Pay-In, Pay-Out |
| Shown if applicable | Review | Risk, Treasury |
| Treasury | Hidden (absorbed into Payment timing) | Visible as distinct step |
| Hidden if not applicable | Optional producers not involved in this transaction | Same |

### Per-Component Behaviour

- Each component shows its own estimate contribution and state
- Pay-Out estimate = final transaction ETA displayed prominently above or below the bar
- Every component is **tappable/clickable**:
  - Happy path: shows "We're on track! 🎉" + stage timing
  - Delayed (Remitly): shows delay explanation + refund/credit notice
  - Uncertain: shows "We're reviewing — we'll keep you posted"
  - Customer-action: opens action sheet with detailed instructions

### Customer Input Components

**Payment / Pay-In — Push Funds:**
- Rendered in muted/slate color (customer-owned)
- Message: "Wire $300 to our account to get started — Rosa's counting on you!"
- UX nudge: "Wire in the next 2 hours and Rosa's money arrives by 6:30 PM"
- Final ETA shown with "pending your action" caveat

**Review / Risk Sideline (3 sub-steps):**
1. Remitly reviews transaction ← *Remitly-owned*
2. Customer uploads requested documents ← *customer-owned, tappable*
3. Remitly reviews uploaded documents ← *Remitly-owned*

- Customer View label: "Review" (all 3 sub-steps share the parent label)
- Dev View label: "Risk" (with sub-step detail visible)
- Sub-step 2: tap → action sheet with upload instructions + urgency nudge
- Sub-step 1 & 3: tap → reassurance message + expected Remitly review time

### Remitly-Caused Delay Actions

**Yellow delay** (color: ≥2 min absolute AND >0% relative AND <10% relative; notification fires at ≥5% relative — see Notification Policy):
- Proactive push notification to customer
- Partial credit: *"We're running just a little behind. As a thank-you for your patience, we've added a $2 credit to your next transfer."*
- Reflect credit notice on lifecycle bar

**Red delay** (≥10% relative; notification fires at ≥10 min absolute AND ≥10% relative — see Notification Policy):
- Proactive push + SMS/WhatsApp notification to customer
- Full fee refund: *"We're sorry — this one's on us. We'll refund your $3.99 fee in full."*
- Reflect fee refund on lifecycle bar

**Uncertain delay — Risk review in progress:**
- Proactive heads-up: *"We're reviewing your transfer. This usually takes about 27 minutes. We'll update you as soon as we know more."*
- **Do not** commit to refund at this stage — cause of potential delay is unknown (could be customer document issue)
- If delay is later confirmed as Remitly-caused → standard red delay rules apply

---

## Feature: Estimate Change Notifications

### Overview

When an estimate changes — delay or early delivery — Remitly proactively notifies the sender. This policy governs which channels to use, when to send, and how to handle back-to-back recalculations.

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
| **SMS** | Moderate+ delays; also used as safety net when WhatsApp status is unknown |
| **WhatsApp** | If `whatsapp_flag = Y` or `whatsapp_flag = unknown` (attempt + SMS fallback) |
| **CS call** | Severe delays and stuck transfers — threshold varies by tier (see below) |

**WhatsApp flag logic:**
- `whatsapp_flag = Y` → WhatsApp only (no SMS)
- `whatsapp_flag = unknown` → WhatsApp + SMS
- `whatsapp_flag = N` → SMS only

### Notification Thresholds by Event

| Event | Trigger condition | Push | SMS / WhatsApp | CS call |
|---|---|---|---|---|
| **Slight delay (yellow)** | ≥2 min absolute AND ≥5% relative | ✅ | — | — |
| **Moderate delay (red)** | ≥10 min absolute AND ≥10% relative | ✅ | ✅ | HAT T2: if ≥3h late; HAT T3: if ≥3h late |
| **Severe delay** | ≥60 min absolute OR ≥25% relative | ✅ | ✅ | HAT T1: if ≥3h late; HAT T2+: any severe |
| **Transfer stuck** | Paused >4h (any cause) | ✅ | ✅ | HAT T1: >8h; HAT T2: >4h; HAT T3: immediately |
| **Customer action needed** | Risk doc upload, Push Funds pending, Amendment | ✅ | ✅ | — |
| **Delay resolved — back on track** | current_estimate returns to ≤ original_estimate | ✅ | — | — |
| **Early delivery** | Delivered ≥15 min before original_estimate | ✅ | — | — |

LAT transactions never receive CS calls — not economically viable.

CS calls are only placed during sender's local business hours (8am–8pm). Calls triggered outside these hours are queued for the following morning.

### Debounce and Batching Rules

1. **15-minute debounce window**: if the estimate changes again in the same direction within 15 minutes of the last notification, suppress the new outbound message. Update in-app state silently.
2. **Escalation override**: if a new recalculation crosses a higher severity tier (yellow → red, red → severe), send immediately — debounce does not apply.
3. **Recovery sends immediately**: "back on track" and "early delivery" notifications are never delayed. Good news overrides debounce.
4. **Maximum 3 delay notifications per transaction**: once 3 delay notifications have been sent, suppress further delay messages until delivery or escalation to "stuck" status.
5. **Per-direction reset**: after a "back on track" or "delivered" event, debounce window and notification count reset.

### Copy Tone per Channel

- **Push**: Warm, concise. One sentence + updated ETA.
- **SMS**: Functional. Transfer ID, new ETA, action link if applicable.
- **WhatsApp**: Slightly warmer than SMS. Short CTA with deep link where relevant.
- **CS call**: Empathetic and accountable. Lead with updated ETA → high-level cause → applicable concession (credit or refund).

---

## Feature: Concession Policy

### Principle

If Remitly committed to a delivery time and missed it for reasons within our control, a concession is owed — proactively, without the customer having to ask. Proactive concessions reduce CS call volume, which partially offsets their cost and builds long-term trust.

### Cause Attribution

| Stage | Scenario | Remitly-caused? |
|---|---|---|
| Pay-In | Infrastructure delay | Yes |
| Risk step 1 | Remitly initial review exceeds its own SLA | Yes |
| Risk step 2 | Customer takes time to upload documents | No |
| Risk step 3 | Remitly re-review of uploaded docs exceeds SLA | Yes — customer did their part; Remitly owns step 3 |
| Treasury / CFP | CFP hold runs longer than hardcoded rule | Yes (not disclosed to customer, but real delay) |
| Pay-Out | Partner processing slower than estimate | Yes — Remitly owns partner SLA |
| Amendment | Customer entered wrong account number | No for fix time; yes if Remitly's processing of the confirmed amendment exceeds commitment |

### Consumer Concession Tiers

Credits are applied to the customer's account balance automatically and deducted from the next transaction at checkout — no code, no claim required.

Red supersedes yellow: if a $2 yellow credit was issued and the transaction escalates to red, issue the full fee refund and cancel the credit (net: full refund, no stacking).

| Tier | Trigger | Concession |
|---|---|---|
| **Yellow** | ≥5% relative AND ≥2 min absolute | $2 goodwill credit on account |
| **Red** | ≥10% relative AND ≥10 min absolute | Full fee refund |
| **Severe** | ≥60 min absolute OR ≥25% relative | Full fee refund + $5 additional account credit |
| **HAT T3 severe** | ≥60 min absolute OR ≥25% relative | Full fee refund + $10 account credit + proactive CS call |

### SMB Concession Tiers

SMB concessions are percentage-based on the affected recipient's transfer amount, reflecting Remitly's high-confidence estimate commitment for business customers. Applied per affected recipient within a batch — on-time recipients in the same batch are unaffected.

Credits applied to the business account balance, automatically deducted from the next transaction.

| Tier | Trigger | Concession (per affected recipient) |
|---|---|---|
| **Yellow** | ≥5% relative AND ≥2 min absolute | 2% of affected transfer amount (min $25) |
| **Red** | ≥10% relative AND ≥10 min absolute | Full fee refund + 5% of affected transfer amount |
| **Severe** | ≥60 min absolute OR ≥25% relative | Full fee refund + 10% of affected transfer amount + proactive CS call |

*Example: $950 transfer, severe delay → fee refund + $95 credit. $5,000 transfer, severe delay → fee refund + $500 credit.*

### Escalation Handling

If a customer contacts CS after a proactive concession has already been issued:
- Agent confirms the concession applied and provides updated ETA
- No additional compensation is stacked automatically
- HAT T2/T3 and SMB severe cases may be escalated to a supervisor for discretionary judgment

### Measurement Framework

The goal is not zero concession spend — it is maximising the delta between long-term NPV retained and total intervention cost.

```
Net_intervention_cost = concession_amount + (CS_calls_not_prevented × $4)
```

A proactive $2 credit that prevents a $4 CS call is cost-neutral at worst. The retention effect makes it positive.

| Metric | Definition | Purpose |
|---|---|---|
| Concession spend per delayed transaction | `SUM(concessions) / delayed_transactions` | Unit economics baseline |
| CS call prevention rate | `call_rate_delayed_no_concession − call_rate_delayed_with_concession` | Quantifies the cost offset |
| Net intervention cost | `concession_spend − (calls_prevented × $4)` | Should trend toward zero or negative |
| 90-day retention: delayed+concession vs. delayed+no-concession | Cohort comparison | Measures near-term NPV impact |
| 12-month NPV delta | `(retained_customers × avg_LTV) − total_concession_spend` | Ultimate health check |

If the 12-month NPV delta is negative, the concession tier sizing is wrong — not the principle. Adjust tier thresholds or amounts before considering removal of proactive concessions.

---

## Demo Scenarios

### Navigation
Tab bar at top of demo:
`[Send Flow] | [1. Happy] [2. Delay] [3. Push Funds] [4. Risk Review] [5. Amendment] [6. SMB]`

- `[Send Flow]` always shown first; Submit routes based on Pay-In: Debit Card/ACH → `[1]`, Push Funds → `[3]`
- Presenter can jump to any tab at any time
- Customer / Dev View toggle persists across all tabs

---

### Send Flow Panel *(Shared Prologue)*

**Page:** Send Flow (pre-submit)
**Sender:** Carlos Mendoza — returning customer, previously sidelined for docs

#### Layout

Pay-Out selector first, then Pay-In selector, then Doc Nudge (if applicable), then the estimate bar, then the CTA. The estimate bar lives **below** the selections so it is only seen once the customer has made their choices — avoiding an empty/placeholder state at the top of the screen. Only the two inputs that drive the estimate are interactive; everything else (recipient, account details, sender KYC) is pre-filled.

```
[Recipient: Rosa Mendoza 🇲🇽]   [$300.00]

[Pay-Out: ○ Bank Deposit  ○ Push to Card  ○ Mobile Wallet  ○ Cash Pickup]
             ↑ selecting fills the Disbursement segment & shows ETA

[Pay-In:  ○ Debit Card  ○ ACH  ○ Wire Transfer]

[ Doc Nudge Banner — appears after Pay-Out is selected ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ← estimate bar ━━━━━
[ Payment ✓ ]  [ Disbursement — ]       Choose a delivery method
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ Send $300 ]
```

#### Pay-In selector — live bar behavior

| Pay-In selected | Payment segment | ETA impact |
|---|---|---|
| **Debit Card** *(default)* | ✅ instant, green | Base: 4h total |
| **ACH** | ⏳ 1–2 days (blue) + Treasury visible in Dev View | 1–2 business days (ACH dominates; no intraday time shown) |
| **Wire Transfer** | 🔘 amber — wire required ("Active — Customer") | Conditional: "[payout time] after your wire" (e.g. "4h after your wire", "10 min after your wire") |

#### Pay-Out selector — live bar behavior

| Pay-Out selected | Disbursement segment | ETA (with Debit Card) | ETA (with ACH) |
|---|---|---|---|
| **Bank Deposit** | 🟢 4h | 6:30 PM | 1–2 business days |
| **Mobile Wallet** | 🟢 1h | 3:30 PM | 1–2 business days |
| **Cash Pickup** | 🟢 30 min | 3:00 PM | 1–2 business days |
| **Push to Card** | 🟢 10 min | 2:40 PM | 1 business day |

*ETAs are USA → MX corridor approximations. Selecting a faster Pay-Out method shrinks the Disbursement segment and shifts the total ETA left in real time.*

**"X faster" delta label** — shown dynamically on each unselected Pay-Out card, comparing against the currently selected option. Only shown when the option is genuinely faster than the current selection; hidden when it would be slower or equal; hidden entirely when no option is selected yet, when Wire Transfer is Pay-In (no fixed baseline), or when ACH is Pay-In (payout method barely affects 1–2 day ACH timing). Pricing is not shown on Pay-In or Pay-Out cards.

**Pay-In card options:** Debit Card ("Arrives instantly"), Bank Transfer / ACH ("Arrives in 1–2 business days"), Wire Transfer ("You send funds to Remitly · Delivery starts on receipt"). No "Business" tag on Wire Transfer — Wire is a general pay-in option, not SMB-specific.

**Pill sizing:** Payment and Disbursement pills are equal width (both flexGrow=1). No oversizing of the Disbursement segment.

Disbursement segment stays **gray / unfilled** until a Pay-Out method is selected. Selecting one instantly fills it — this is the visual "unlock" moment.

`draft_estimate` displays **without a "~" prefix** — the system is confident enough to present a clean time (e.g., "6:30 PM", "30 min total"). No disclaimers shown beneath the estimate.
Dev View shows the formula live: `draft_estimate = Pay-In (Xmin) + Pay-Out (Xh Xmin) + buffers (2min)`

#### Doc Nudge — proactive banner

Appears after Pay-Out is selected (history-based: Carlos was previously sidelined).

> 💡 *"Last time you sent to Rosa, we paused the transfer to verify a document — it added about 4 hours to her wait. Upload a fresh copy now and keep this transfer on track. It takes 2 minutes."*
> → **"Upload docs →"** | *"Skip for now"*

- **"Upload docs →"**: upload flow inline → banner updates to ✅ *"Documents received — your transfer is clear to go!"* Dev View: `Risk segment: pre-cleared — removed from estimate`
- **"Skip for now"**: dismisses; soft warning persists: *"Tip: having your docs ready speeds things up if we need to verify mid-transfer."*

#### Review & Submit

- `draft_estimate` shown in the estimate bar above the CTA — clean, no "~" prefix, no disclaimer text beneath
- **"Send $300"** button → `draft_estimate` locks as `original_estimate` → routes to:
  - **Debit Card or ACH** → `[1. Happy]` (in-progress state)
  - **Push Funds** → `[3. Push Funds]` (Payment in "Active — Customer" state, waiting for wire)

---

### Scenario 1 — Happy Path

**Sub-states:** `[In Progress]` → `[Delivered 🎉]` *(Transfer Detail — picks up after Send Flow Submit)*

**Pay-In:** Debit Card — instant | **Pay-Out:** Bank Deposit — BBVA Mexico

**In Progress:**
- Payment / Pay-In: ✅ Completed
- Disbursement / Pay-Out: 🔵 Active (BBVA Mexico processing)
- `original_estimate` = `current_estimate` = 4h → by **6:30 PM** *(promise locked — "~" removed)*
- Pay-Out drill-down: *"We're on track! 🎉 Rosa's money arrives by 6:30 PM."*
- **Estimate Track Record** (near ETA): *"✓ On time for your last 7 transfers to Rosa"*

**Delivered 🎉:**
- Pay-In: ✅ Completed
- Pay-Out: 🎉 Delivered at **5:47 PM** — 43 minutes early
- Celebratory message: *"Rosa got her money! 🎉 Delivered 43 minutes ahead of schedule."*
- *"Promised by 6:30 PM · Arrived at 5:47 PM"*

---

### Scenario 2 — Remitly-Caused Delay

**Sub-states:** `[Yellow — Slight Delay]` → `[Red — Significant Delay]` (toggle within tab)

**Flow:** Payment → Disbursement *(Customer View)* / Pay-In → Pay-Out *(Dev View)*
**Pay-In method:** Debit Card — instant
**Delay cause:** BBVA Mexico partner processing slower than expected

**Yellow sub-state** (<10% relative delay):
- `original_estimate` = 4h → by **6:30 PM**
- `current_estimate` = 4h 20min → by **6:50 PM** (+8.3%)
- Pay-Out segment: yellow
- Proactive notification: *"Heads up — Rosa's money is running about 20 minutes behind. We expect it to arrive by 6:50 PM."*
- Partial credit notice on bar: *"As a thank-you for your patience, we've added a **$2 credit** to your next transfer. 💙"*

**Red sub-state** (≥10% relative AND ≥5 min absolute delay):
- `original_estimate` = 4h → by **6:30 PM**
- `current_estimate` = 4h 30min → by **7:00 PM** (+12.5%)
- Pay-Out segment: red
- Notification: *"We're sorry — Rosa's money will be delayed by about 30 minutes. New estimated arrival: 7:00 PM."*
- Fee refund notice on bar: *"This delay is on us. We're refunding your **$3.99 fee** in full. 💙"*

**Dev View only — notification panel** (shown as a meta-layer below the lifecycle bar, visible only in Dev View):
> ⚙️ *What's happening behind the scenes:*
> - `6:34 PM` — current_estimate recalculated: +20 min (+8.3% relative) — yellow notification threshold crossed (≥2 min absolute AND ≥5% relative)
> - `6:34 PM` — push notification sent to Carlos: *"Heads up — Rosa's money is running about 20 minutes behind..."*
> - `6:34 PM` — $2 credit queued for Carlos' next transaction
> - *(Red sub-state)* `6:41 PM` — current_estimate recalculated: +30 min (+12.5% relative) — red notification threshold crossed (≥10 min absolute AND ≥10% relative)
> - *(Red sub-state)* `6:41 PM` — push + SMS notification sent + fee refund of $3.99 triggered automatically

*This panel demonstrates to leadership that estimates drive proactive outreach — customers are informed before they think to ask "where's my money?"*

---

### Scenario 3 — Customer-Caused Delay (Push Funds / Payment)

**Flow:** Payment → Disbursement *(Customer View)* / Pay-In → Pay-Out *(Dev View)*
**Pay-In method:** Push Funds (wire transfer — customer must act)
**Transfer initiated:** Today at 2:30 PM

- Payment / Pay-In segment: **slate/amber color** — customer-owned, "Active — Customer" state
- Pay-Out: ⬜ Pending, ETA conditional on customer action
- Pay-In amber banner (always visible): shows bank name + reference number inline with one-tap copy buttons; full wire details (account number, routing, amount) remain expandable below
- Bar-level message: *"Rosa's waiting — wire $300 to our account to get started."*
- UX nudge: *"Wire in the next hour and Rosa receives her money by **7:30 PM**. The sooner you act, the sooner she gets it."*
  - *Math: wire by 3:30 PM → Pay-Out 4h → delivery 7:30 PM*
- Pay-Out shows: *"Estimated delivery: 4h after your wire is received"*

---

### Scenario 4 — Review / Risk Sideline (Multi-Step)

**Sub-states:** `[Step 1: Remitly Reviewing]` → `[Step 2: Your Action Needed]` → `[Step 3: Docs Received]` (step navigation within tab)

**Flow (Customer View):** Payment → Review → Disbursement
**Flow (Dev View):** Pay-In → Risk → Pay-Out
**Pay-In method:** Debit Card — instant (completed)

**Step 1 — Remitly Reviewing (uncertain delay):**
- Pay-In: ✅ Completed
- Risk step 1: 🔵 Active + ⚠️ uncertainty badge
- Risk steps 2 & 3: ⬜ Pending
- Pay-Out: ⬜ Pending (ETA shown as range)
- `original_estimate` = 4h → by **6:30 PM**
- `current_estimate` = 4h 27min → by **6:57 PM** (+11.25%) — but cause unknown
- Risk drill-down: *"We're reviewing Carlos' transfer — this usually takes about 27 minutes. We'll update you as soon as we know more."*
- **No refund commitment shown** — cause of delay is not yet known (could be an expired document on Carlos' side)
- Bar message: *"We're on it. We'll send you an update shortly."*

**Step 2 — Customer Action Needed (doc upload):**
- Pay-In: ✅ Completed
- Risk step 1: ✅ Completed (Remitly review done)
- Risk step 2: 🔘 Active — customer-owned (slate color), tappable CTA
- Risk step 3: ⬜ Pending
- Pay-Out: ⬜ Pending
- Tappable CTA opens action sheet: *"Rosa's money is on hold — we need a document from you to continue."* + upload button + list of accepted documents
- Bar nudge: *"The sooner you upload, the sooner Rosa gets her money. Upload now →"*
- ETA: *"After you upload, Rosa's money should arrive within ~4 hours."*

**Step 3 — Docs Received, Remitly Re-Reviewing:**
- Pay-In: ✅ Completed
- Risk step 1: ✅ Completed
- Risk step 2: ✅ Completed (docs uploaded)
- Risk step 3: 🔵 Active — Remitly reviewing uploaded docs
- Pay-Out: ⬜ Pending
- ETA shown as concrete projected time: *"by about 7:15 p.m."* (docs received ~3:00 PM + 15 min review + 4h delivery = ~7:15 PM)
- Drill-down: *"We've received Carlos' documents — our team is reviewing them now. This usually takes about 15 minutes."*
- Bar message: *"Almost there! We're reviewing your documents. Rosa's money is next."*

---

### Scenario 5 — Amendment: Stuck Payout

**Tab:** `[5. Amendment]`

**Sub-states:** `[Stuck — Action Needed]` → `[Option A: Fix Account]` → `[Option B: Switch & Go Faster]`

**Sender/Recipient:** Carlos Mendoza → Rosa Mendoza (same as Scenarios 1–4)
**Pay-In method:** Debit Card — instant (completed)
**Payout method (original):** Bank Deposit — BBVA Mexico
**Error cause:** Rosa's bank account number was rejected — likely a typo

#### Stuck sub-state (default view)

- Payment / Pay-In: ✅ Completed
- Disbursement / Pay-Out: 🔘 **Active — Customer** state — slate/amber color (consistent with Scenarios 4 & 5)
- `original_estimate` = 4h → by **6:30 PM**
- `current_estimate` = ⏸ Recalculated with 5-min fix buffer; displayed as new ETA without explaining the buffer to the customer

**Sticky banner above the Disbursement segment:**
> *"Rosa's bank account number wasn't accepted by BBVA Mexico — looks like there might be a typo. Fix it below and her money will be on its way. 💙"*

**Amendment options (shown as two cards below the lifecycle bar):**

**Option A — Fix the account number**
- Payout method stays: Bank Deposit · BBVA Mexico
- Estimated delivery: by **7:00 PM** *(recalculated ETA — 30 min slip from original 6:30 PM due to processing pause; 5-min fix buffer included, not disclosed to customer)*
- CTA button: "Update account number →"

**Option B — Switch to Push to Card (nearly instant, free)**
- New payout method: Push to Card · Visa Direct
- Estimated delivery: by **3:20 PM** — Rosa gets her money in minutes, not hours
- "No extra cost"
- CTA button: "Switch and send faster →"

#### Option A selected — Fix Account sub-state

- Inline form expands: "Update Rosa's bank account number" + input field + "Confirm" button
- After confirm → Pay-Out transitions to 🟢 Active
- Success message: *"You're all set! Rosa's updated account details are confirmed — her money is on its way and should arrive by 7:00 PM."*

#### Option B selected — Switch to Push to Card sub-state

- Confirmation screen: *"Switching Rosa's delivery to Push to Card — she'll get her $300 in minutes, at no extra cost to you."*
- After confirm → Pay-Out transitions to 🟢 Active (Push to Card · Visa Direct)
- Success message: *"Done! We've switched Rosa's delivery to Push to Card. She'll get her money by 3:20 PM — in just a few minutes. 🎉"*

*(Note: Option B is the demo's most dramatic moment — Option A means Rosa waits until 7:00 PM, Option B means Rosa gets her money in about 15 minutes. The gap is 3 hours 40 minutes — this delta must be prominently surfaced on Option B's card with an "⚡ 3h 40min faster than Option A" callout.)*

**Pay-In preservation note:** Visible across all amendment states (stuck + both options): *"Your payment is already processed — no restart, no extra fee."* This reassures Carlos that choosing either option does not redo or charge the Pay-In step.

#### Customer View vs Dev View

- **Customer View**: Labels — Payment, Disbursement. Slate/amber color on Disbursement = "Active — Customer" state (same visual treatment as Push Funds and Review). Both amendment options visible.
- **Dev View**: Labels — Pay-In, Pay-Out. TEC shown: `INVALID_ACCOUNT_NUMBER` (BBVA Mexico rejection). Amendment options same. Note that this scenario demonstrates how self-service amendments eliminate a support ticket + cancellation.

#### Copy tone notes

- Warm and direct — blame the situation, not Carlos. "Rosa's account number wasn't accepted" not "you entered the wrong number."
- Frame Option B as a genuine upgrade opportunity, not a workaround: *"Here's a chance to get Rosa her money even faster — and it's free."*
- Reinforce that both options preserve the original Pay-In — Carlos doesn't lose the fee or restart the transfer.

---

### Scenario 6 — SMB Batch Payment

**Tab:** `[6. SMB]`

> **Note:** The SMB tab shows a static post-send Transfer Detail view only. There is no SMB Send Flow — the SMB send experience is fundamentally different from the consumer flow (batch uploads, different pay-in methods, business account context) and is out of scope for this demo. The tab jumps directly into the in-flight state.

**Sender:** John LLC, New York, NY 🇺🇸
**Flow structure:** Single Payment → forks into 5 parallel Disbursement tracks (left to right)

#### Layout
All bars horizontal. The Payment segment spans the full left edge, then forks rightward into 5 individual recipient tracks. Each track runs left to right independently:

```
[Payment ✅] ──┬── [Disbursement: Maria Garcia 🇲🇽 $800]   ✅ Delivered 11:47 AM
               ├── [Disbursement: Juan Reyes 🇵🇭 $600]    ✅ Delivered 12:03 PM
               ├── [Disbursement: Priya Patel 🇮🇳 $1,200]  🟢 On track → 5:30 PM
               ├── [Disbursement: Ana Oliveira 🇧🇷 $750]   🟢 On track → 6:00 PM
               └── [Review ✅][Disbursement: Carlos Diaz 🇨🇴 $950] 🔴 Late
```

#### Payment stage (shared)
- ✅ Completed — Debit Card, $4,300.00 charged at 10:00 AM

#### Recipient tracks 1–4 (green)

**Maria Garcia 🇲🇽** — $800 — Bank Deposit, BBVA Mexico
- No Review step (not sidelined)
- Disbursement: ✅ Delivered at **11:47 AM** (1h 47min — on time)

**Juan Reyes 🇵🇭** — $600 — Mobile Wallet, GCash
- No Review step
- Disbursement: ✅ Delivered at **12:03 PM** (2h 03min — on time)

**Priya Patel 🇮🇳** — $1,200 — Bank Deposit, HDFC Bank
- No Review step
- Disbursement: 🟢 In Progress — `original_estimate` = 7h30min → by **5:30 PM**, on track

**Ana Oliveira 🇧🇷** — $750 — Push to Card, Nubank
- No Review step
- Disbursement: 🟢 In Progress — `original_estimate` = 8h → by **6:00 PM**, on track

#### Recipient track 5 — Carlos Diaz 🇨🇴 (red, Remitly-caused delay)

**Carlos Diaz** — $950 — Cash Pickup, Efecty (Colombia)

**Review stage:** ✅ Completed
- 1-step only (Remitly review — no customer document upload required)
- Dev View label: Risk | Customer View label: Review
- Completed in 12 minutes — no customer action was needed

**Disbursement stage:** 🔴 Late
- `original_estimate` = 4h → by **2:00 PM**
- `current_estimate` = 4h 45min → by **2:45 PM** (+18.75% relative, 45 min absolute)
- Delay cause: Efecty partner processing backlog

**Alert banner above Carlos Diaz track:**
*"Sorry, we're 45 minutes late on Carlos' payment — our fault. We'll apply a **$200 credit** to your next transaction with us. 💙"*

#### Business-specific copy notes
- No "Rosa's counting on you" warmth — tone is professional but still accountable
- Emphasise reliability and transparency over emotional warmth
- The $200 credit is a business-level concession (not a $3.99 consumer fee refund)
- Customer View shows recipient names + countries prominently — businesses care about per-recipient visibility

#### Customer View vs Dev View
- **Customer View**: Labels — Payment, Review, Disbursement. No Treasury (not applicable for Debit Card).
- **Dev View**: Labels — Pay-In, Risk, Pay-Out. Shows per-track timing details and risk check result.

---

## Source Material & Repos

### Pre-reads (already ingested)
- [Estimates v2 Requirements](https://docs.google.com/document/d/1RFq6sU5K-Upd3cHrOGzfFVQ4oSFN3_Be7C-VlkqKfvo/edit) — original source
- [Estimates Strategy 2025-2026](https://docs.google.com/document/d/1sRkGyzpExbJkMnEd9OWtjlKlO1AmFFemtSlfBLlgKeY/edit) — strategic context, formula, producer detail
- [PDP Audit](https://docs.google.com/document/d/1hcwxz48jXNiisPWGPK2UXZgAR_k0JL-kTZpWZCkA7cM/edit) — miss breakdown by producer, metrics, current gaps

### Repositories (to read when building)

| Repo | Purpose | Link |
|---|---|---|
| CXCoreService/pdp | Core estimates/PDP logic | https://github.com/Remitly/CXCoreService/tree/6d1886c0970359d8819a8c5ea10092b128730453/src/main/java/com/remitly/cxcore/domain/pdp |
| narwhal/transferCardHeader | Frontend estimates presentation example | https://github.com/Remitly/narwhal/blob/0e306ef4a3a292da3a6827597fdbc6860930ae64/src/components/transferCard/refreshedTransferCard/transferCardHeader/useTransferCardTitle.ts#L39-L75 |
| mammoth/ReviewTxnUserState | Risk sideline +1hr logic | https://github.com/Remitly/mammoth/blob/2cc903349de0ad641e6489f42b8145e7bbb7bc81/tsm/libs/TransactionStateMachine/TransactionUserStates/ReviewTxnUserState.php#L78 |
| narwhal (root) | Frontend app — colors, fonts, components | https://github.com/Remitly/narwhal/tree/0e306ef4a3a292da3a6827597fdbc6860930ae64 |
| product-merchandising-service *(legacy)* | Speed estimates powering calculator screen today — to be replaced by PDP/Estimates | https://github.com/Remitly/product-merchandising-service |

**Note on speed merchandising service (legacy):** The calculator screen and pre-submit speed estimates are currently served by `product-merchandising-service`, which reads from `data/speed_merchandising_estimate_config.csv`. This CSV contains `percentile_10_minutes` and `percentile_90_minutes` per `(corridor, payment_profile_type, payment_profile_variant, destination_type)` — an 80% confidence interval at the data level. However, the API response (`SpeedMerchandisingDisplay`) only exposes `icon`, `long_text`, `short_text` as strings; the interval data is discarded before reaching the frontend.

This service is on the road to deprecation. The v2 migration goal is a single PDP/Estimates service controlling estimates across all product screens. When that migration is complete, the p10/p90 interval data can be surfaced — enabling structured ranges on pre-selection screens (delivery method, payment method) rather than the current hardcoded text strings.

**Send Flow — key paths in narwhal (all relative to repo root, ref `0e306ef`):**

| Path | What it contains |
|---|---|
| `src/apps/sendFlow/flows/mobileSendMoneyFlow.ts` | Ordered list of all send flow steps — source of truth for step sequence |
| `src/apps/sendFlow/screens/` | All send flow screen components (sendAmount, summary, deliveryMethod, selectRecipient, etc.) |
| `src/apps/sendFlow/screenComponents/sendAmount/consolidatedCalculator/` | Main amount + FX calculator — where estimate is first shown |
| `src/apps/sendFlow/screenComponents/pricingBreakdown/pricingBreakdown.tsx` | Estimate/fee breakdown display component |
| `src/apps/sendFlow/screenComponents/speedMerchandisingEstimates/` | Speed options with per-method ETA display |
| `src/apps/sendFlow/screens/summary.tsx` | SendSummaryStep — final review before submit; draft_estimate shown here |
| `src/apps/sendFlow/model/modelActions/createTransfer.ts` | Submit action — where draft_estimate → original_estimate transition happens |
| `src/apps/sendFlow/redux/slice.ts` | Redux state — `model.pricingEstimate` holds current estimate throughout flow |

> **Note on Narwhal UI:** Pay close attention to colors and fonts — previous demo had mismatches with the Remitly app. If not in repo, check the Remitly web app directly.

### Dashboards (reference only)
- [Core PDP Dashboard](https://10az.online.tableau.com/#/site/tableauremitlyonline/views/PDPSpeed/AllUpPDP)
- [PDP Accuracy Dashboard](https://10az.online.tableau.com/#/site/tableauremitlyonline/views/Q2R2D2C/TransactionSpeed/)

---

## UX Audit Findings (applied 2026-03-26)

Findings from a 5-specialist ux-guru sweep (JTBD, HCD, Usability, A11y, Style Guide). All items below are applied to the demo.

### 🛑 Critical

| # | Finding | Fix applied |
|---|---|---|
| 1 | **Option B WOW moment buried** — 3h 40min gap between options was invisible; only raw ETAs shown | Added "⚡ 3h 40min faster than Option A" callout prominently on the Option B card |

### 🟨 Major — Structural

| # | Finding | Fix applied |
|---|---|---|
| 2 | **Send Flow order** — Pay-In shown first forces customers to think about payment method before seeing delivery ETA; kills the "magic moment" | Reordered: estimate bar teaser (Disbursement gray) → Pay-Out selector → Pay-In selector. Bar fills visually as customer picks delivery method — ETA is the reward |
| 3 | **Wire instructions hidden** — in Scenario 3, bank name and reference were behind a tap; high-friction for Push Funds users | Key fields (bank name + reference) now visible inline in amber banner with copy buttons; full details remain expandable |
| 4 | **Step 3 Risk ETA vague** — "about 4h after review" requires mental arithmetic; customers can't act on it | Changed to concrete projected time: "by about 7:15 p.m." |

### 🟨 Major — Copy

| # | Finding | Fix applied |
|---|---|---|
| 5 | **Amendment missing Pay-In reassurance** — customers fear their payment will be lost or charged again | Added "Your payment is already processed — no restart, no extra fee" note visible on all amendment states |

### 💅 Minor — Polish

| # | Finding | Fix applied |
|---|---|---|
| 6 | `~` in prose copy feels technical | Changed to "about" in all natural-language copy (e.g. "about 20 minutes late") |
| 7 | `⚠️` on yellow delay feels alarmist; red also uses `⚠️` so they're indistinguishable | Changed yellow banner to `⏳` |
| 8 | `/` separator in Dev View delay delta is code-like | Changed to `·` (e.g. "+20 min · +8.3%") |
| 9 | Exclamation marks in nudge copy feel pushy | Changed to periods |
| 10 | Confirmed nav labels still show original option text | Confirmed states show "Option A ✓ Done" / "Option B ✓ Done" |
| 11 | Step nav labels in title case (e.g. "Remitly Reviewing") | Changed to sentence case (e.g. "Remitly reviewing") |
| 12 | subLabel font size 10px — too small to read on mobile | Increased to 12px |
| 13 | `→` in CTA button labels (e.g. "Upload now →") adds no value | Removed; buttons are already clearly interactive |

### Round 2 — Additional polish (2026-03-26 rev 2)

| # | Finding | Fix applied |
|---|---|---|
| 14 | **"~" on all estimates signals uncertainty** — if the model is good enough, show confident numbers | Removed all `~` prefixes from every estimate (pay-out card subtitles, estimate bar header, segment pills, ETA lines, dev panel copy). System now presents clean times: "6:30 PM", "30 min total", "4h after your wire" |
| 15 | **"Business" tag on Wire Transfer is misleading** — wire is not SMB-exclusive | Removed the "Business" tag from the Wire Transfer pay-in card. SMB is its own scenario tab |
| 16 | **SMB tab had no send flow** — and shouldn't: SMB send experience is out of scope | Confirmed: SMB tab is static Transfer Detail only. No send flow. Documented explicitly |
| 17 | **Estimate bar at top creates empty/useless state** — customer sees "Choose delivery method" before making any selection | Moved estimate bar to below pay-out + pay-in selectors, directly above the CTA. Now only appears once meaningful |
| 18 | **"Draft estimate · Final delivery time confirmed when you send" disclaimer** | Removed. Clean estimate, no hedging |
| 19 | **"This becomes your delivery promise the moment you send" disclaimer** | Removed |
| 20 | **Disbursement pill 2× wider than Payment pill** — asymmetry had no meaningful signal | Both pills now equal width (flexGrow=1) |
| 21 | **ACH math wrong** — ACH + Push-to-card showed "2.2h total" when ACH alone is 1–2 days | Fixed: ACH timing now modeled as 1–2 business days throughout. ACH + any payout shows "1–2 business days" (or "1 business day" for Push to Card). No intraday clock times for ACH |
| 22 | **Wire + Push-to-card showed "30 min after your wire"** — should be 10 min | Fixed: wire payout labels now use per-method times ("10 min after your wire", "30 min after your wire", etc.) |
| 23 | **Wire pay-out cards showed debit-card labels** — "Arrives in 4h · by 6:30 PM" is meaningless for wire | Fixed: wire pay-in now uses its own label set: "[X] after your wire" per payout method |

---

## Out of Scope (Demo Phase)
- Real backend integration — all data is hardcoded/mocked
- Non-remittance transaction types (wallet, lending)
- ML model integration (Hedwig)
- Actual push notification delivery
- Automated concessions backend logic
- Amendment backend logic (Scenario 5 amendment options are mocked/static — no real TC/Mammoth integration)
