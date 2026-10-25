# Seismic Globe: 30-Day Earthquake Visualizer

An interactive 3D WebGL globe mapping global seismic activity from the past 30 days.

## Data Source
- **Provider:** United States Geological Survey (USGS) Earthquake Hazards Program
- **Feed:** Keyless Public GeoJSON Summary Feed (`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson`)
- **Citation:** U.S. Geological Survey (2026). Real-time Earthquake Map. U.S. Department of the Interior.

## What It Is
An exploratory planetary telemetry tool that parses real-world tectonic shifts. Build-time Python routines ingest and clean USGS seismic records, writing static JSON datasets. The browser renders an interactive Three.js globe plotting earthquakes with scale mapped to Richter magnitude and chromatic gradation mapped to hypocentral depth.

## How It Works
1. **Build-Time ETL (`fetch_and_clean.py`):** Runs using pandas in a dedicated Python virtual environment (`.venv`). Cleans null coordinates, filters events with $M \ge 2.5$, calculates summary statistics, and serializes `earthquakes.json`.
2. **Spherical Coordinate Projection:** Converts latitude and longitude degrees to 3D Cartesian coordinates:
   $$x = -R \cdot \sin(\phi) \cdot \cos(\theta), \quad y = R \cdot \cos(\phi), \quad z = R \cdot \sin(\phi) \cdot \sin(\theta)$$
3. **Interactive Telemetry:** Real-time filtering across magnitude ($M \ge 2.5$ to $M \ge 7.0$) and temporal recency (1 to 30 days), accompanied by full drag-to-orbit inertial controls.

## How To Run
1. Run `python fetch_and_clean.py` in `.venv` to refresh static data.
2. Open `index.html` in any modern web browser or serve with `npx serve`.
