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

## Features

- **Arps decline models**
  - Exponential (`b = 0`)
  - Hyperbolic (`0 < b < 1`)
  - Harmonic (`b = 1`)
- Automatic model selection using AIC/AICc comparison
- Levenberg–Marquardt nonlinear optimization
- Production forecast with economic limit detection
- EUR and time-to-limit calculations
- Annual effective decline display alongside nominal `Di`
- CSV upload or manual data paste
- Synthetic data generator for testing
- CSV export of history + forecast results
- Interactive Plotly visualization with linear/log scale toggle
- Contextual `[?]` tooltips for key parameters and results
- Portfolio navigation link to OOIP Calculator

---

## Engineering Notes

- Arps DCA is most reliable in boundary-dominated flow, after transient behavior has faded.
- Fit data should typically begin near stabilized peak/early decline period.
- `Di` is handled as nominal monthly decline in this app.
- Forecast and EUR are tied to a configurable economic limit, enabling quick screening.
- Hyperbolic `b > 1.0` may indicate unconventional/transient behavior and can overestimate EUR if no terminal decline is applied.

---

## Usage

1. Upload a CSV file (`date,rate`) or paste production data.
2. Choose a model (exponential, hyperbolic, harmonic) or `auto`.
3. Run curve fitting.
4. Review fitted parameters and fit quality metrics (RMSE, R², AICc, BIC).
5. Set forecast horizon and economic limit.
6. Review forecast outputs (time to limit, EUR, annual decline) and export CSV if needed.

---

## Validation Test (Reference Case)

Use:
- `qi = 1000 bbl/d`
- `Di = 0.10 /month`
- `b = 0.5`
- `Economic Limit = 50 bbl/d`

Expected:
- Time to limit ≈ **69.44 months** (5.79 years)
- EUR ≈ **15,528** (app internal units)
- Annual Effective Decline ≈ **60.94%**
- Nominal `Di` display: **0.10000 /month**

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

## Live Application

🔗 https://jaioil-dev.github.io/dca-app/

---

## Portfolio Navigation

- **Tool #1:** DCA Pro (this repository)
- **Tool #2:** OOIP Calculator → https://JaiOil-Dev.github.io/ooip-calculator/
