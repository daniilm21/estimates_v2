# Estimates v2 — Demo

Interactive prototype for Remitly's Estimates v2 experience. Built with React + TypeScript + Vite.

---

## Running locally

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/daniilm21/estimates_v2.git
cd estimates_v2/demo
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## What's in the demo

The demo simulates a mobile phone UI with two modes and six scenarios.

### View modes (toggle at the top)

| Mode | Description |
|---|---|
| **Current CX** | Remitly's existing experience today |
| **New CX** | Proposed v2 customer-facing experience |
| **New CX + Dev** | Same as New CX with internal details visible (treasury, risk labels, ETA breakdown) |

### Scenarios (tabs above the phone)

| Tab | Scenario |
|---|---|
| **Send Flow** | Send money flow — calculator → review & send |
| **1. Happy** | Transfer completes on time, no issues |
| **2. Delay** | Transfer hits a delay; customer is notified with a revised ETA |
| **3. Push Funds** | Customer action required to push funds |
| **4. Risk Review** | Transfer flagged for risk review |
| **5. Amendment** | Transfer details need to be amended |
| **6. SMB** | Small business batch transfer view |

Start with **Current CX → Send Flow** to see the baseline, then switch to **New CX** to compare.

---

## Notes

- All data is hardcoded — no backend or API calls.
- This is a prototype only, not production code.
