---
title: Seismic Globe
side: code
role: Self-initiated project
stack: [Python, pandas, requests, Three.js, WebGL, GeoJSON]
publish: true
preview: site/projects/seismic-globe/preview.png
---
An interactive 3D planetary hypocenter visualizer backed by USGS keyless public earthquake feeds. A build-time Python pipeline cleans, filters, and serializes 30 days of global seismic activity into static JSON for interactive spherical projection.
Outcome: 1,200 earthquake hypocenters rendered at 60 FPS in headless Playwright; zero runtime network requests with build-time payload footprint under 180 KB.
