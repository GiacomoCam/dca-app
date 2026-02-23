# DCA Pro — Decline Curve Analysis Tool

A professional web application for petroleum engineering decline curve analysis, 
built to demonstrate Arps decline models on real production data.

## About

Built by **Jainer Campo** — Petroleum Engineer (BSc, IUP Santiago Mariño) 
with specialized expertise in heavy oil recovery and Venezuelan reservoir operations.

This tool is part of a portfolio of petroleum engineering applications 
demonstrating the intersection of reservoir engineering knowledge 
and modern AI-assisted development.

## Features

- **Three Arps decline models:** Exponential (b=0), Hyperbolic (0<b<1), Harmonic (b=1)
- **Auto model selection** using AIC (Akaike Information Criterion)
- **Levenberg-Marquardt optimization** for robust curve fitting
- **Fit quality warnings** — flags build-up phases and poor fits automatically
- **Forecast horizon** up to 50 years with economic limit detection
- **CSV upload or paste** production data directly
- **Synthetic data generator** for practice and testing
- **Export report** functionality

## Engineering Notes

- DCA is only valid during boundary-dominated flow — always set fit window 
  to start at peak production, not first production
- Di initialized at petroleum-realistic values (0.05–0.30/month)
- b values above 1.0 trigger a warning — uncommon in conventional reservoirs

## Tech Stack

React · Vite · Plotly.js · Levenberg-Marquardt (optimization) · 
GitHub Pages (deployment) · GitHub Actions (CI/CD)

## Live App

[https://giacomocam.github.io/dca-app/](https://giacomocam.github.io/dca-app/)
