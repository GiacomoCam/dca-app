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

## Industry Benchmark Feature Gap (Prioritized)

Based on common capabilities in open-source DCA ecosystems (e.g., petbox-dca, dcapy, aRpsDCA, pydca style tooling) and commercial packages (Harmony, OFM, Aries, PHDWin), these are the highest-value missing features to prioritize.

| Priority | Feature | Why it matters for petroleum engineers | Complexity | Portfolio impact (LatAm operator/service roles) |
|---|---|---|---|---|
| 1 | **Segmented / multi-regime decline** (auto switch transient → BDF, hyperbolic-to-exponential terminal decline) | Core for realistic reserves in unconventional and mixed-flow periods; prevents EUR overestimation. | High | **Very High** — strongly signals practical reservoir/production engineering maturity. |
| 2 | **Rate + cumulative history matching dashboard** | Engineers validate both q(t) and Np(t); catches fits that look good on rate but fail on cumulative balance. | Medium | **High** — aligns with day-to-day technical workflows in operator asset teams. |
| 3 | **Uncertainty / probabilistic forecasts (P10/P50/P90)** | Commercial decisions and development economics need uncertainty ranges, not single deterministic curves. | High | **Very High** — differentiates portfolio for planning and reserves-oriented roles. |
| 4 | **Batch well processing + ranking** | Most field work is multi-well. Needed for campaign screening, surveillance, and portfolio triage. | High | **Very High** — strong relevance for service-company analytics and operator planning groups. |
| 5 | **Manual fit windows + outlier management UI** | Engineers need to exclude shut-ins/workovers and control analysis windows transparently. | Medium | **High** — practical, immediately useful in real data conditions common in LatAm fields. |
| 6 | **Economic layer (price, OPEX, NPV, payout)** | Converts engineering forecast into business metrics for investment and workover decisions. | High | **High** — valuable for integrated asset/economic screening profiles. |
| 7 | **Model diagnostics panel** (residual plots, autocorrelation, stability checks) | Improves fit defensibility and quality control in peer review and decision meetings. | Medium | **Medium-High** — showcases rigorous technical communication and QA mindset. |
| 8 | **Type-curve/template library + analog matching** | Accelerates early-stage forecasts when history is sparse. Common in practical field development. | Medium | **Medium-High** — useful for development planning and basin screening contexts. |
| 9 | **Units/conventions engine** (oil/gas, day/month/year, nominal/effective conversions) | Reduces interpretation errors across teams and reporting standards. | Medium | **Medium** — demonstrates production engineering detail awareness. |
| 10 | **Report generator** (PDF/Excel reserve summary packs) | Engineers routinely share standardized outputs for management and reserves audit trails. | Medium | **Medium** — practical for deliverables expected in consulting/service environments. |

> Recommendation: start with priorities 1, 3, and 4 to maximize both industry realism and portfolio strength.

---

## Tech Stack

- React + Vite
- Tailwind CSS 4 utility workflow
- Plotly.js visualization
- Levenberg–Marquardt nonlinear fitting

---

## Live Link

🔗 https://giacomocam.github.io/dca-app/

---

## Portfolio Navigation

- **Tool #1:** DCA Pro (this repository)
- **Tool #2:** OOIP Calculator → https://JaiOil-Dev.github.io/ooip-calculator/
