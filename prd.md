# Estimates v2 - Product Requirements Document

> **Author:** Daniil Mossyakov | **Last updated:** 2026-05-07
> **Jira:** [JAGUAR-1464](https://remitly.atlassian.net/browse/JAGUAR-1464)
> **Audience:** PMs, analysts, engineers, and their managers (Directors as top reviewer).
> **Companion document:** `product.md` (tech-heavy spec). This PRD is the readable narrative; `product.md` carries canonical thresholds, schemas, and copy.

---

## 1. Problem

Estimates already exist in Remitly's backend. `manila.transaction_delivery_promise` records `current_pdp` recalculations as a transaction moves through the state machine, and individual recalculation reasons are partially captured. The signal does not drive customer experience.

Customers in delay situations find out by calling Customer Service. Notifications, when they go out, are inconsistent in trigger and tone. Concessions are reactive: a CS agent has to decide and apply them. There is no shared definition of what counts as an "interesting" delay versus noise, and no programmatic mapping from delay severity to customer treatment. Cause attribution exists in the data but is not exposed in a form that downstream systems can act on.

Three compounding gaps:

- **Detection.** We do not know whether 100% of warranted recalculations are captured today. Today's reason set has roughly 4 codes and partial coverage.
- **Interpretation.** Raw recalcs are not classified into business-meaningful events. Yellow vs red, on-time vs early, are not first-class concepts in the data.
- **Action.** No system reads delay events and decides what to do, segmented by who the customer is and what we owe them.

## 2. Vision

Turn the PDP recalculation stream into the operating signal for customer-facing actions. Build a layered system in which:

1. raw recalcs are reliable and exhaustive (the inventory),
2. interesting recalcs are stamped with business labels (the interpretation), and
3. labels combine with customer dimensions to drive concrete actions (the treatment).

Each layer has a single owner, a single contract, and changes independently of the others.

## 3. Why a layered architecture

Estimates v2 is not a single feature. It is a program covering data instrumentation, business logic, customer segmentation, and a growing set of customer-facing actions. The components evolve at very different rates:

- Raw data structure and reason taxonomy change rarely. Once correct, they are stable for years.
- Business classification rules (what counts as a critical delay) change as we learn what matters to customers.
- Customer dimensions are owned outside Estimates and grow over time.
- Actions are the most volatile: copy, channels, concession amounts, and segment-specific treatments will iterate constantly.

A monolithic design forces every iteration on actions to touch data plumbing and classification. A layered design isolates each concern. Adding a new notification copy variant does not require a database migration. Reclassifying a "mild" threshold does not require new instrumentation. Adding a new dimension (e.g., loyalty tier) does not require touching L2.

### The four elements

| Layer | Owner | Job | Output |
|---|---|---|---|
| **L1: Raw Inventory** | Estimates | Capture every warranted PDP recalc, with reason and reason_group | Rows in `manila.transaction_delivery_promise` |
| **L2: Business Classification** | Estimates | Stamp interesting recalcs with business labels | Label parameter on a `current_pdp` version |
| **Dimensions** | CapMan | Provide customer/transaction segmentation | Read API consumed by L3 |
| **L3: Actions** | Estimates (consumer of L1, L2, Dimensions) | Decide and execute customer-facing actions | Notifications, lifecycle bar, concessions, reactive UI |

### Selection rule

```
action_set = f(L2_label, L1_reason_group, dimensions)
```

L1 and L2 are cause-agnostic and dimension-agnostic. L3 is where attribution and segmentation come together to produce treatment.

## 4. Layer 1: Raw Inventory

### Goal

Every warranted PDP recalculation is recorded in `manila.transaction_delivery_promise`, with a correct `recalculation_reason` and a correct `reason_group` (Remitly+partner / customer / mix).

### Why E2E ownership of the reason_group mapping

The mapping from reason to reason_group is non-trivial in some cases. An auth latency event may be customer-driven (slow bank response on the sender's side) or Remitly-driven (gateway latency). L1 owns the resolution end-to-end: by the time a row lands in the table, its reason_group is final. L2 and L3 do not re-derive cause attribution.

This keeps L2 cause-agnostic (it only classifies magnitude) and lets L3 read group as fact, not policy.

### Audit dependency

We do not know today whether recalcs fire in every warranted case, and we have approximately 4 reason codes in the system today. The first deliverable of this program is an audit that:

- enumerates lifecycle events that should trigger a recalc,
- compares against what fires today,
- documents gaps,
- defines the canonical reason_code and reason_group taxonomy.

Examples of expected reasons (illustrative, not final):

| Reason (illustrative) | reason_group |
|---|---|
| Transaction stuck in UDE | customer |
| Transaction amended | customer |
| Transaction sidelined (Risk rule X) | Remitly |
| Authorization took longer than expected | customer or Remitly (resolved per case during audit) |
| Customer did not wire funds | customer |
| Partner delay | Remitly |

The audit's output is the canonical taxonomy. Until the audit is complete, L2 and L3 design proceeds against the assumed shape, but downstream wiring waits.

### Out of scope at L1

Magnitude classification (yellow/red), notification logic, concession logic. L1 reports facts; it does not interpret them.

## 5. Layer 2: Business Classification

### Goal

Translate raw recalcs into business-meaningful events. Stamp the small subset of recalcs that matter with a label that downstream systems can react to.

### Initial label set

| Label | Definition |
|---|---|
| `critical_absolute_delay` | current_pdp later than original_pdp by ≥ X minutes |
| `critical_relative_delay` | current_pdp later than original_pdp by ≥ Y% |
| `mild_absolute_delay` | within smaller absolute threshold |
| `mild_relative_delay` | within smaller relative threshold |
| `early_delivery` | delivered or projected to deliver ≥ Z minutes ahead of original_pdp |

Canonical thresholds live in `product.md`. Labels are not mutually exclusive: a recalc can be both `critical_absolute_delay` and `critical_relative_delay`. L3 decides how to handle combinations.

### Stamping mechanism

A label is a parameter attached to a `current_pdp` version. It is computed and written when the recalc is persisted. L2 does not maintain a separate state machine: the version is the unit of classification.

### Cause-agnostic by design

L2 reads only magnitude. The cause (Remitly / customer / mix) lives in L1's reason_group and is read directly by L3. This separation is deliberate: business rules about what counts as a delay should not be entangled with policy about who pays.

## 6. Dimensions

### Source

CapMan owns customer and transaction dimensions. Estimates is a consumer.

### Dimensions consumed (initial set)

| Dimension | Values |
|---|---|
| Customer tenure | NCA (new), Nth (returning) |
| Customer type | Regular, SMB, Freelancer |
| Amount tier | LAT ($0 to $1k), HAT T1 ($1k to $3k), HAT T2 ($3k to $30k), HAT T3 ($30k+) |
| Send pattern | 1:1, 1:many (bulk send), many:1 |
| Geography | Corridor (sender country to recipient country) |

Adding a new dimension is a CapMan-side change plus an L3 read. It does not affect L1 or L2.

## 7. Layer 3: Actions

### Selection rule

```
action_set = f(L2_label, L1_reason_group, dimensions)
```

L3 produces a set of actions per qualifying recalc, scoped to the customer and the transaction.

### v1 action surface

| Action | Description |
|---|---|
| **Reactive display** | Transfer Detail page renders the latest current_pdp on every view. Always live. |
| **Lifecycle bar** | Segmented progress bar showing transaction state, ETA, and delay color. Visual states: on-track, yellow delay, red delay, customer-action-needed, uncertain (Risk in progress), delivered. |
| **Proactive notifications** | Push, SMS, WhatsApp, and optional CS call. Triggered by L2 label crossing threshold; channel selection by tier dimension. Debounce and batching per policy. |
| **Concessions** | Goodwill credit (yellow), full fee refund (red), fee + percentage credit (severe). SMB scaled by transfer amount. Auto-applied; no claim required. |
| **In-app guidance** | Push-funds wire instructions, document upload nudges, amendment options (fix vs switch faster). Triggered when reason_group is customer and customer can act. |

Full thresholds, copy, and concession amounts are in `product.md`. The PRD makes the architectural commitment; the spec carries the values.

### Send-flow estimate presentation

Pre-commit estimates (calculator, method selection, summary) read from L1 directly without going through L2 (no label needed; the customer has not committed yet). The point estimate at summary is the moment `original_pdp` is locked. Migration of pre-submit estimates from `product-merchandising-service` to the unified PDP/Estimates service is part of L1 build, consolidating the data source for all estimate surfaces.

### v1 cut

The full action surface above ships in v1. Workbook (`workbook.md`) phases the release. Future actions (e.g., partner-side feedback loops, programmatic outbound calls beyond the current CS-call rule) are not in v1.

### Worked example: a single recalc end-to-end

A USA to Mexico transfer for $300, returning customer, debit-card pay-in, BBVA bank-deposit pay-out. Original PDP says delivery by 6:30 PM. Partner reports a backlog at 6:34 PM.

- **L1**: writes a new `current_pdp` row. New ETA 6:50 PM. `recalculation_reason = partner_delay`. `reason_group = Remitly`.
- **L2**: stamps `mild_relative_delay` (8.3%) and (depending on the absolute threshold) potentially `mild_absolute_delay` (20 min).
- **Dimensions**: customer is Nth, LAT, 1:1, USA-MEX corridor.
- **L3**: selects `{push notification, $2 goodwill credit, lifecycle bar transitions to yellow}`. Sends, applies, renders.

If at 6:41 PM the partner reports a longer delay (now 7:00 PM, +30 min):

- **L1**: writes another row. `reason_group = Remitly`.
- **L2**: stamps `critical_relative_delay` (12.5%) and `mild_absolute_delay`.
- **L3**: selects `{push + SMS, fee refund (supersedes prior credit), lifecycle bar to red}`.

The system reacts on the L2 stamp, with no special-case wiring per scenario.

## 8. Success Metrics

### L1 (data quality)

| Metric | Target |
|---|---|
| Recalc coverage | 100% of warranted lifecycle events produce a recalc row |
| reason_code completeness | 100% of recalc rows have a non-null reason_code |
| reason_group accuracy | ≥ 95% on human-audited sample |

### L2 (classification quality)

| Metric | Target |
|---|---|
| Label correctness | ≥ 99% on automated regression test against canonical thresholds |
| Label stability | < 1% of versions with conflicting label sequences in a single transaction |

### L3 (customer impact)

| Metric | Definition |
|---|---|
| Proactive notification reach | % of qualifying delays where customer received notification before contacting CS |
| CS call deflection | call_rate(no concession) minus call_rate(with concession), per delay tier |
| Net intervention cost | concession_spend minus (calls_prevented × $4) |
| 12-month retention NPV delta | Delayed + concession cohort versus delayed + no-concession cohort |
| NPS impact | NPS delta between cohorts that received proactive comms versus matched controls |

A negative net intervention cost is the threshold for concession sizing. If 12-month NPV delta is negative, we adjust tier sizing rather than abandon the principle.

## 9. Scope and out of scope

### In scope (v1)

- L1 audit and instrumentation across `manila.transaction_delivery_promise`
- L1 reason_code and reason_group taxonomy, finalized
- L2 classification engine with the label set above
- Dimensions consumed from CapMan
- L3 action surface as listed in section 7

### Out of scope (v1)

- Hedwig ML model integration for pay-out estimation (future improvement)
- Non-remittance products (wallet, lending)
- Partner-side feedback (e.g., automated partner penalty signals)
- Real-time SMS / WhatsApp delivery infrastructure (assumed available; not built here)
- New dimensions beyond CapMan's current set
- Customer-facing PDP audit visibility (e.g., showing the customer the recalc history)

## 10. Open Questions

1. **Adjudication policy for ambiguous reasons.** Authorization latency cause is not always programmatically resolvable. Do we adjudicate with rules, ML, or a human-reviewed queue? Owner: L1 audit.
2. **Backfill strategy.** Once the canonical reason taxonomy is set, do we backfill historical PDP recalcs, or only forward-instrument? Affects analytics and concession claims for in-flight transactions.
3. **L2 label versioning.** When thresholds change, do prior versions get re-stamped? Likely no for in-flight, yes for analytics. Decision needed.
4. **L3 action stacking and supersession.** A red label after a yellow: cancel the credit, or stack with the refund? Current policy says supersede. Confirm for severe-after-red.
5. **Out-of-hours CS calls.** Today's policy queues for next morning. Is this acceptable for HAT T3? Open with CS leadership.
6. **Concession sizing for new dimensions.** SMB tiers exist but no Freelancer-specific tiering. Treat as Regular for v1?

## Appendix: Demo scenarios as L3 illustrations

Two scenarios in `demo.md` make the L2 to L3 hand-off concrete:

- **Scenario 2 (Delay)**: yellow then red sub-states. Same transaction, same reason_group (Remitly), L2 label crosses from mild to critical, L3 action set escalates from {push + credit} to {push + SMS + refund}.
- **Scenario 5 (Amendment)**: customer reason_group with two L3 paths offered (Option A: fix, Option B: switch to faster pay-out). Demonstrates L3 selecting an in-app guidance action over a notification action when the customer can act.

The remaining four scenarios (happy path, push funds, risk review, SMB batch) illustrate edge cases that the layered model handles without bespoke logic.
