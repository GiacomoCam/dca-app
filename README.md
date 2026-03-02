# DCA Pro — Decline Curve Analysis Tool

A professional web application for performing **Arps Decline Curve Analysis (DCA)** on oil production data.

This tool allows petroleum engineers to fit exponential, hyperbolic, and harmonic decline models to production data and generate production forecasts.

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

- DCA is most reliable during **boundary-dominated flow**.
- Fit data should typically begin near stabilized peak/early decline period.
- `Di` in this app is handled as **nominal monthly decline**.
- Annual effective decline is derived from the fitted Arps parameters.
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

## Tech Stack

React · Vite · Plotly.js · Levenberg–Marquardt Optimization · GitHub Pages

---

## Live Application

🔗 https://jaioil-dev.github.io/dca-app/

---

## Portfolio Navigation

- **Tool #1:** DCA Pro (this repository)
- **Tool #2:** OOIP Calculator → https://JaiOil-Dev.github.io/ooip-calculator/

---

**Built by Jainer M. · Petroleum Engineer**
