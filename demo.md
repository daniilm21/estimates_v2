# Estimates v2 — Demo Spec

> Claude: this file is the source of truth for the demo app. Before editing, always check `instructions.md` for the PRD→demo impact protocol.
> Status: spec complete; build not started.

---

## Demo Overview

**App type:** Single-page React app, no backend, all data hardcoded.
**Audience:** Leadership / potential sponsors — familiar with Remitly internals.
**Location in product:** Send Flow page + Transfer Detail page (Narwhal).

### Two Views (persistent toggle, visible on all screens)

| View | Label | What it shows |
|---|---|---|
| **Customer View** *(default)* | — | Exactly what the customer sees. Labels: Payment, Disbursement, Review. Treasury hidden (absorbed into Payment timing). |
| **Dev View** | — | Same content + technical internals. Labels: Pay-In, Pay-Out, Risk, Treasury. Treasury visible as distinct step with banner: "⚙️ Dev View — Treasury is not shown to customers. ACH funding requires a 2-hour hold to secure funds." |

### Tab Bar (top of demo)

```
[Send Flow] | [1. Happy] [2. Delay] [3. Push Funds] [4. Risk Review] [5. Amendment] [6. SMB]
```

- `[Send Flow]` always shown first. On submit: Debit Card/ACH → Tab 1; Push Funds → Tab 3.
- Presenter can jump to any tab at any time.
- Customer/Dev View toggle persists across all tabs.

---

## Mock Transactions

### Scenarios 1–5 (Consumer — Carlos → Rosa)

| Field | Value |
|---|---|
| Sender | Carlos Mendoza, Chicago, IL, 🇺🇸 USA |
| Recipient | Rosa Mendoza (Carlos' grandmother), Guadalajara, 🇲🇽 Mexico |
| Corridor | USA → MEX |
| Amount | $300.00 |
| Pay-Out partner | BBVA Mexico — Bank Deposit |
| Transfer ID | #RM-2847561 (Scenarios 1–4) / #RM-3091742 (Scenario 5) |
| Transfer initiated | Today at 2:30 PM |
| Sender history | Returning customer — previously sidelined for doc review |

### Scenario 6 (SMB — John LLC batch)

| Field | Value |
|---|---|
| Sender | John LLC, New York, NY 🇺🇸 |
| Pay-In | Debit Card — instant |
| Total amount | $4,300.00 |
| Transfer ID | #RM-5193847 |
| Transfer initiated | Today at 10:00 AM |

Recipients:
| # | Recipient | Country | Amount | Method | Partner | Status |
|---|---|---|---|---|---|---|
| 1 | Maria Garcia | 🇲🇽 Mexico | $800 | Bank Deposit | BBVA Mexico | ✅ Delivered 11:47 AM |
| 2 | Juan Reyes | 🇵🇭 Philippines | $600 | Mobile Wallet | GCash | ✅ Delivered 12:03 PM |
| 3 | Priya Patel | 🇮🇳 India | $1,200 | Bank Deposit | HDFC Bank | 🟢 On track → 5:30 PM |
| 4 | Ana Oliveira | 🇧🇷 Brazil | $750 | Push to Card | Nubank | 🟢 On track → 6:00 PM |
| 5 | Carlos Diaz | 🇨🇴 Colombia | $950 | Cash Pickup | Efecty | 🔴 Late — 45 min delay |

---

## Send Flow Tab (Shared Prologue)

**Sender:** Carlos Mendoza — returning customer, previously sidelined for docs.

### Screen Layout

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

Order: Pay-Out selector → Pay-In selector → Doc Nudge (if applicable) → estimate bar → CTA.
Estimate bar lives below selectors — only appears once customer has made choices.
Everything except Pay-Out and Pay-In selectors is pre-filled (recipient, amount, sender KYC).

### Pay-In Selector — live bar behavior

| Pay-In selected | Payment segment | ETA impact |
|---|---|---|
| **Debit Card** *(default)* | ✅ instant, green | Base: 4h total |
| **ACH** | ⏳ 1–2 days, blue. Dev View: Treasury visible | 1–2 business days (ACH dominates; no intraday time) |
| **Wire Transfer** | 🔘 amber — "Active — Customer" | Conditional: "[payout time] after your wire" |

Pay-In card labels:
- Debit Card: "Arrives instantly"
- Bank Transfer / ACH: "Arrives in 1–2 business days"
- Wire Transfer: "You send funds to Remitly · Delivery starts on receipt" *(no "Business" tag)*

### Pay-Out Selector — live bar behavior

| Pay-Out selected | Disbursement | ETA (Debit Card) | ETA (ACH) | ETA (Wire) |
|---|---|---|---|---|
| **Bank Deposit** | 🟢 4h | 6:30 PM | 1–2 business days | 4h after your wire |
| **Mobile Wallet** | 🟢 1h | 3:30 PM | 1–2 business days | 1h after your wire |
| **Cash Pickup** | 🟢 30 min | 3:00 PM | 1–2 business days | 30 min after your wire |
| **Push to Card** | 🟢 10 min | 2:40 PM | 1 business day | 10 min after your wire |

**"X faster" delta label:** shown on each unselected Pay-Out card vs. current selection. Hidden when: option is slower/equal, no option selected yet, Wire Transfer is Pay-In, ACH is Pay-In.

**Disbursement segment:** gray/unfilled until Pay-Out selected. Selecting instantly fills — this is the visual "unlock" moment. Both Payment and Disbursement pills equal width (flexGrow=1).

**draft_estimate display:** clean point estimate, no "~" prefix, no disclaimer. e.g. "6:30 PM", "30 min total".
Dev View shows formula: `draft_estimate = Pay-In (Xmin) + Pay-Out (Xh Xmin) + buffers (2min)`

### Doc Nudge Banner

Appears after Pay-Out selected (history-based: Carlos was previously sidelined).

> 💡 "Last time you sent to Rosa, we paused the transfer to verify a document — it added about 4 hours to her wait. Upload a fresh copy now and keep this transfer on track. It takes 2 minutes."
> **"Upload docs"** | "Skip for now"

- **Upload docs:** inline upload flow → banner updates to ✅ "Documents received — your transfer is clear to go!" Dev View: `Risk segment: pre-cleared — removed from estimate`
- **Skip for now:** dismisses → soft warning: "Tip: having your docs ready speeds things up if we need to verify mid-transfer."

### Review & Submit

- draft_estimate shown in estimate bar above CTA — clean, no qualifier
- **"Send $300"** → draft_estimate locks as original_estimate → routes:
  - Debit Card or ACH → Tab 1 (Happy, in-progress state)
  - Wire Transfer (Push Funds) → Tab 3 (Push Funds, Payment in "Active — Customer" state)

---

## Scenario 1 — Happy Path

**Tab:** `[1. Happy]`
**Sub-states:** `[In Progress]` → `[Delivered 🎉]`
**Pay-In:** Debit Card — instant | **Pay-Out:** Bank Deposit — BBVA Mexico

### In Progress

| Stage | State | Detail |
|---|---|---|
| Payment / Pay-In | ✅ Completed | — |
| Disbursement / Pay-Out | 🔵 Active | BBVA Mexico processing |

- `original_estimate` = `current_estimate` = 4h → **by 6:30 PM**
- Pay-Out drill-down tap: "We're on track! Rosa's money arrives by 6:30 PM."
- Estimate Track Record near ETA: "✓ On time for your last 7 transfers to Rosa"

### Delivered

| Stage | State | Detail |
|---|---|---|
| Payment / Pay-In | ✅ Completed | — |
| Disbursement / Pay-Out | 🎉 Delivered | 5:47 PM — 43 minutes early |

- Celebratory message: "Rosa got her money! Delivered 43 minutes ahead of schedule."
- "Promised by 6:30 PM · Arrived at 5:47 PM"

---

## Scenario 2 — Remitly-Caused Delay

**Tab:** `[2. Delay]`
**Sub-states:** `[Yellow — Slight Delay]` ↔ `[Red — Significant Delay]` (toggle within tab)
**Pay-In:** Debit Card — instant | **Delay cause:** BBVA Mexico partner processing slower than expected

### Yellow Sub-State

| Stage | State |
|---|---|
| Payment / Pay-In | ✅ Completed |
| Disbursement / Pay-Out | 🟡 Yellow delay |

- `original_estimate` = 4h → by **6:30 PM**
- `current_estimate` = 4h 20min → by **6:50 PM** (+8.3%)
- Notification sent: "Heads up — Rosa's money is running about 20 minutes behind. We expect it to arrive by 6:50 PM."
- Bar notice: "As a thank-you for your patience, we've added a **$2 credit** to your next transfer. 💙"

### Red Sub-State

| Stage | State |
|---|---|
| Payment / Pay-In | ✅ Completed |
| Disbursement / Pay-Out | 🔴 Red delay |

- `original_estimate` = 4h → by **6:30 PM**
- `current_estimate` = 4h 30min → by **7:00 PM** (+12.5%)
- Notification: "We're sorry — Rosa's money will be delayed by about 30 minutes. New estimated arrival: 7:00 PM."
- Bar notice: "This delay is on us. We're refunding your **$3.99 fee** in full. 💙"

### Dev View — Notification Panel (below lifecycle bar, Dev View only)

> ⚙️ What's happening behind the scenes:
> - `6:34 PM` — current_estimate recalculated: +20 min (+8.3% relative) — yellow notification threshold crossed (≥2 min absolute AND ≥5% relative)
> - `6:34 PM` — push notification sent to Carlos: "Heads up — Rosa's money is running about 20 minutes behind..."
> - `6:34 PM` — $2 credit queued for Carlos' next transaction
> - *(Red sub-state)* `6:41 PM` — current_estimate recalculated: +30 min (+12.5% relative) — red notification threshold crossed (≥10 min absolute AND ≥10% relative)
> - *(Red sub-state)* `6:41 PM` — push + SMS notification sent + fee refund of $3.99 triggered automatically

*This panel shows leadership that estimates drive proactive outreach — customers are informed before they ask "where's my money?"*

---

## Scenario 3 — Customer-Caused Delay (Push Funds)

**Tab:** `[3. Push Funds]`
**Pay-In:** Wire Transfer (Push Funds) — customer must act
**Transfer initiated:** Today at 2:30 PM

| Stage | State |
|---|---|
| Payment / Pay-In | 🔘 Active — Customer (slate/amber) |
| Disbursement / Pay-Out | ⬜ Pending |

- Pay-In amber banner (always visible): bank name + reference number inline, one-tap copy buttons. Full wire details (account number, routing, amount) expandable below.
- Bar message: "Rosa's waiting — wire $300 to our account to get started."
- UX nudge: "Wire in the next hour and Rosa receives her money by **7:30 PM**. The sooner you act, the sooner she gets it."
  - Math: wire by 3:30 PM → Pay-Out 4h → delivery 7:30 PM
- Pay-Out shows: "Estimated delivery: 4h after your wire is received"

---

## Scenario 4 — Risk Review (Multi-Step)

**Tab:** `[4. Risk Review]`
**Sub-states:** `[Step 1: Remitly reviewing]` → `[Step 2: Your action needed]` → `[Step 3: Docs received]`
**Customer View flow:** Payment → Review → Disbursement
**Dev View flow:** Pay-In → Risk → Pay-Out
**Pay-In:** Debit Card — instant (completed)

### Step 1 — Remitly reviewing

| Stage | State |
|---|---|
| Pay-In | ✅ Completed |
| Risk step 1 | 🔵 Active + ⚠️ uncertainty badge |
| Risk steps 2 & 3 | ⬜ Pending |
| Pay-Out | ⬜ Pending |

- `original_estimate` = 4h → by **6:30 PM**
- `current_estimate` = 4h 27min → by **6:57 PM** (+11.25%) — cause unknown
- Risk drill-down: "We're reviewing Carlos' transfer — this usually takes about 27 minutes. We'll update you as soon as we know more."
- **No refund commitment** — cause not yet known (could be expired document on Carlos' side)
- Bar message: "We're on it. We'll send you an update shortly."

### Step 2 — Customer action needed

| Stage | State |
|---|---|
| Pay-In | ✅ Completed |
| Risk step 1 | ✅ Completed |
| Risk step 2 | 🔘 Active — Customer (slate), tappable CTA |
| Risk step 3 | ⬜ Pending |
| Pay-Out | ⬜ Pending |

- Tap → action sheet: "Rosa's money is on hold — we need a document from you to continue." + upload button + accepted documents list
- Bar nudge: "The sooner you upload, the sooner Rosa gets her money. Upload now"
- ETA: "After you upload, Rosa's money should arrive within about 4 hours."

### Step 3 — Docs received, Remitly re-reviewing

| Stage | State |
|---|---|
| Pay-In | ✅ Completed |
| Risk step 1 | ✅ Completed |
| Risk step 2 | ✅ Completed |
| Risk step 3 | 🔵 Active — Remitly reviewing |
| Pay-Out | ⬜ Pending |

- ETA: **"by about 7:15 p.m."** (docs received ~3:00 PM + 15 min review + 4h delivery)
- Drill-down: "We've received Carlos' documents — our team is reviewing them now. This usually takes about 15 minutes."
- Bar message: "Almost there! We're reviewing your documents. Rosa's money is next."

---

## Scenario 5 — Amendment: Stuck Payout

**Tab:** `[5. Amendment]`
**Sub-states:** `[Stuck — Action needed]` → `[Option A: Fix account]` → `[Option B: Switch & go faster]`
**Pay-In:** Debit Card — instant (completed)
**Payout (original):** Bank Deposit — BBVA Mexico
**Error:** Rosa's bank account number rejected — likely a typo

### Stuck Sub-State (default)

| Stage | State |
|---|---|
| Payment / Pay-In | ✅ Completed |
| Disbursement / Pay-Out | 🔘 Active — Customer (slate/amber) |

- `original_estimate` = 4h → by **6:30 PM**
- `current_estimate` = recalculated with 5-min fix buffer → displayed as new ETA (buffer not disclosed to customer)

Sticky banner above Disbursement segment:
> "Rosa's bank account number wasn't accepted by BBVA Mexico — looks like there might be a typo. Fix it below and her money will be on its way. 💙"

Pay-In preservation note (visible on all amendment states):
> "Your payment is already processed — no restart, no extra fee."

**Amendment cards (below lifecycle bar):**

**Option A — Fix the account number**
- Payout: Bank Deposit · BBVA Mexico
- ETA: **by 7:00 PM** (30 min slip from 6:30 PM; 5-min buffer included, not disclosed)
- CTA: "Update account number"

**Option B — Switch to Push to Card** *(demo WOW moment)*
- Payout: Push to Card · Visa Direct
- ETA: **by 3:20 PM** — in minutes, not hours
- "No extra cost"
- CTA: "Switch and send faster"
- **Callout: "⚡ 3h 40min faster than Option A"** — must be prominent on this card

### Option A Selected

- Inline form expands: "Update Rosa's bank account number" + input + "Confirm"
- After confirm → Pay-Out transitions to 🟢 Active
- Success: "You're all set! Rosa's updated account details are confirmed — her money is on its way and should arrive by 7:00 PM."

### Option B Selected

- Confirmation: "Switching Rosa's delivery to Push to Card — she'll get her $300 in minutes, at no extra cost to you."
- After confirm → Pay-Out transitions to 🟢 Active (Push to Card · Visa Direct)
- Success: "Done! We've switched Rosa's delivery to Push to Card. She'll get her money by 3:20 PM — in just a few minutes."

### Dev View

- Labels: Pay-In, Pay-Out
- TEC shown: `INVALID_ACCOUNT_NUMBER` (BBVA Mexico rejection)
- Note: self-service amendment eliminates a support ticket + cancellation

---

## Scenario 6 — SMB Batch Payment

**Tab:** `[6. SMB]`
**Note:** Static Transfer Detail only — no Send Flow. SMB send experience is out of demo scope.
**Sender:** John LLC, New York, NY 🇺🇸

### Layout

```
[Payment ✅] ──┬── [Disbursement: Maria Garcia 🇲🇽 $800]   ✅ Delivered 11:47 AM
               ├── [Disbursement: Juan Reyes 🇵🇭 $600]    ✅ Delivered 12:03 PM
               ├── [Disbursement: Priya Patel 🇮🇳 $1,200]  🟢 On track → 5:30 PM
               ├── [Disbursement: Ana Oliveira 🇧🇷 $750]   🟢 On track → 6:00 PM
               └── [Review ✅][Disbursement: Carlos Diaz 🇨🇴 $950] 🔴 Late
```

Payment (shared): ✅ Completed — Debit Card, $4,300.00 at 10:00 AM

### Recipient Tracks

**Maria Garcia 🇲🇽** — $800 — Bank Deposit, BBVA Mexico — ✅ Delivered 11:47 AM (1h 47min, on time)

**Juan Reyes 🇵🇭** — $600 — Mobile Wallet, GCash — ✅ Delivered 12:03 PM (2h 03min, on time)

**Priya Patel 🇮🇳** — $1,200 — Bank Deposit, HDFC Bank — 🟢 In Progress, original_estimate = 7h30min → by **5:30 PM**, on track

**Ana Oliveira 🇧🇷** — $750 — Push to Card, Nubank — 🟢 In Progress, original_estimate = 8h → by **6:00 PM**, on track

**Carlos Diaz 🇨🇴** — $950 — Cash Pickup, Efecty (Colombia)
- Review stage: ✅ Completed (Remitly-only, 1 step, 12 min, no customer action)
- Disbursement: 🔴 Late
  - `original_estimate` = 4h → by **2:00 PM**
  - `current_estimate` = 4h 45min → by **2:45 PM** (+18.75%, 45 min absolute)
  - Delay cause: Efecty partner processing backlog

Alert banner above Carlos Diaz track:
> "Sorry, we're 45 minutes late on Carlos' payment — our fault. We'll apply a **$200 credit** to your next transaction with us. 💙"

### Copy Notes (SMB)

- Tone: professional, accountable — not warm/family-oriented like consumer
- Emphasise reliability and transparency
- $200 credit = business-level concession (not consumer fee refund)
- Customer View: recipient names + countries prominent (businesses need per-recipient visibility)
- Dev View: per-track timing details + risk check results

---

## UX Audit Log (applied decisions)

All findings below are already incorporated into the scenario specs above. This log is for reference.

### Critical
| # | Finding | Resolution |
|---|---|---|
| 1 | Option B WOW moment buried — gap invisible | "⚡ 3h 40min faster than Option A" callout on Option B card |

### Major — Structural
| # | Finding | Resolution |
|---|---|---|
| 2 | Pay-In shown first — kills ETA magic moment | Reordered: Pay-Out → Pay-In → Doc Nudge → bar → CTA |
| 3 | Wire instructions hidden behind a tap | Bank name + reference inline in amber banner with copy buttons; full details expandable |
| 4 | Step 3 Risk ETA vague ("about 4h after review") | Changed to concrete projected time: "by about 7:15 p.m." |

### Major — Copy
| # | Finding | Resolution |
|---|---|---|
| 5 | Amendment missing Pay-In reassurance | Added "Your payment is already processed — no restart, no extra fee" across all amendment states |

### Minor — Polish
| # | Finding | Resolution |
|---|---|---|
| 6 | `~` in prose feels technical | → "about" in all natural-language copy |
| 7 | `⚠️` on yellow indistinguishable from red | → `⏳` on yellow |
| 8 | `/` separator in Dev View delta is code-like | → `·` (e.g. "+20 min · +8.3%") |
| 9 | Exclamation marks in nudge copy feel pushy | → periods |
| 10 | Confirmed nav labels show original text | → "Option A ✓ Done" / "Option B ✓ Done" |
| 11 | Step nav labels in title case | → sentence case (e.g. "Remitly reviewing") |
| 12 | subLabel font 10px — too small | → 12px |
| 13 | `→` in CTA button labels adds no value | Removed |
| 14 | `~` on all estimates signals uncertainty | Removed all `~` from every estimate |
| 15 | "Business" tag on Wire Transfer misleading | Removed — Wire is general, not SMB-specific |
| 16 | SMB tab had a send flow | Confirmed: SMB tab is static Transfer Detail only |
| 17 | Estimate bar at top creates empty state | Moved below selectors, above CTA |
| 18 | "Draft estimate · Final delivery time confirmed when you send" disclaimer | Removed |
| 19 | "This becomes your delivery promise the moment you send" disclaimer | Removed |
| 20 | Disbursement pill 2× wider than Payment | Both flexGrow=1, equal width |
| 21 | ACH + Push-to-card showed "2.2h total" | Fixed: ACH = 1–2 business days throughout |
| 22 | Wire + Push-to-card showed "30 min after your wire" | Fixed: "10 min after your wire" |
| 23 | Wire pay-out cards showed debit-card labels | Fixed: Wire pay-in uses its own label set |

---

## Build Reference — Narwhal (ref `0e306ef`)

| Path | Contents |
|---|---|
| `src/apps/sendFlow/flows/mobileSendMoneyFlow.ts` | Ordered send flow steps |
| `src/apps/sendFlow/screens/` | All send flow screen components |
| `src/apps/sendFlow/screenComponents/sendAmount/consolidatedCalculator/` | Calculator — first estimate shown |
| `src/apps/sendFlow/screenComponents/speedMerchandisingEstimates/` | Speed options with per-method ETA |
| `src/apps/sendFlow/screens/summary.tsx` | Summary step — draft_estimate shown |
| `src/apps/sendFlow/model/modelActions/createTransfer.ts` | draft_estimate → original_estimate |
| `src/components/transferCard/refreshedTransferCard/transferCardHeader/useTransferCardTitle.ts` | Delivery countdown logic |

**Narwhal UI note:** Match colors and fonts exactly — previous demo had mismatches. Check repo first; verify against live Remitly web app if not found.
