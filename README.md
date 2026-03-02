# DCA Pro — Decline Curve Analysis Tool

Professional decline-curve analysis web app for petroleum engineers and technically minded investors.

**Author:** Built by Jainer M. · Petroleum Engineer

---

## Tool Description

DCA Pro fits production history with Arps models (exponential, hyperbolic, harmonic), scores model quality, and projects forecast performance down to economic limit.

Key outputs:
- Fitted parameters: `qi`, nominal `Di`, `b`
- Goodness of fit: RMSE, R², AICc, BIC
- Forecast KPIs: annual effective decline, time to economic limit, EUR

---

## Engineering Notes

- Arps DCA is most reliable in boundary-dominated flow, after transient behavior has faded.
- `Di` is handled as monthly nominal decline in this app.
- Forecast and EUR are tied to a configurable economic limit, enabling quick screening.
- Tooltips are intentionally written in plain English to support non-specialist stakeholders.

---

## Validation Test (Reference Case)

Input case:
- `qi = 1000 bbl/d`
- `Di = 0.10 /month`
- `b = 0.5`
- `Economic Limit = 50 bbl/d`

Expected checks:
- Time to limit ≈ **69.44 months** (5.79 years)
- EUR at limit ≈ **15,528** (app internal units)
- Annual Effective Decline = **60.94%**
- Nominal Di remains displayed as **0.10000 /month**

---

## Tech Stack

- React + Vite
- Tailwind CSS 4 utility workflow
- Plotly.js visualization
- Levenberg–Marquardt nonlinear fitting

---

## Live Link

🔗 https://jaioil-dev.github.io/dca-app/

---

## Portfolio Navigation

- **Tool #1:** DCA Pro (this repository)
- **Tool #2:** OOIP Calculator → https://JaiOil-Dev.github.io/ooip-calculator/
