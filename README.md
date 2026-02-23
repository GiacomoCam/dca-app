# DCA Pro — Decline Curve Analysis Tool

A professional web application for performing **Arps Decline Curve Analysis (DCA)** on oil production data.

This tool allows petroleum engineers to fit exponential, hyperbolic, and harmonic decline models to production data and generate production forecasts.

---

## Features

- **Arps decline models**
  - Exponential (b = 0)
  - Hyperbolic (0 < b < 1)
  - Harmonic (b = 1)
- Automatic model selection using AIC
- Levenberg–Marquardt nonlinear optimization
- Production forecast with economic limit detection
- CSV upload or manual data paste
- Synthetic data generator for testing
- Interactive Plotly visualization

---

## Engineering Notes

- DCA is valid during boundary-dominated flow.
- Fit window should typically begin at peak production.
- Decline rate (Di) is initialized within petroleum-realistic ranges.
- Hyperbolic b-values greater than 1.0 may indicate unconventional behavior or poor fit.

---

## Usage

1. Upload or paste production data (date + rate).
2. Select model or enable automatic model selection.
3. Define fit window.
4. Run curve fitting.
5. Generate forecast and analyze results.

---

## Tech Stack

React · Vite · Plotly.js · Levenberg–Marquardt Optimization · GitHub Pages

---

## Live Application

🔗 https://giacomocam.github.io/dca-app/
