import json
import os
import requests
import pandas as pd
from datetime import datetime

# Build-time ETL script for Seismic Globe
# Fetches public earthquake data from USGS (United States Geological Survey)

USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

print(f"Fetching USGS feed from: {USGS_URL}")
res = requests.get(USGS_URL, headers={"User-Agent": "Portfolio-Seismic-Globe/1.0"}, timeout=20)
res.raise_for_status()
raw_data = res.json()

features = raw_data.get("features", [])
print(f"Raw earthquake records fetched: {len(features)}")

records = []
for f in features:
    props = f.get("properties", {})
    geom = f.get("geometry", {})
    coords = geom.get("coordinates", [0, 0, 0])
    
    mag = props.get("mag")
    if mag is not None and mag > 0:
        records.append({
            "id": f.get("id"),
            "place": props.get("place", "Unknown"),
            "mag": float(mag),
            "time": int(props.get("time", 0)),
            "lon": float(coords[0]),
            "lat": float(coords[1]),
            "depth": float(coords[2])
        })

df = pd.DataFrame(records)
df = df.dropna().sort_values("time", ascending=False)

# Keep top 1200 events for crisp WebGL rendering without memory bloat
df_export = df.head(1200)

stats = {
    "totalEvents": int(len(df)),
    "exportedEvents": int(len(df_export)),
    "maxMagnitude": float(df["mag"].max()),
    "minMagnitude": float(df["mag"].min()),
    "avgMagnitude": float(round(df["mag"].mean(), 2)),
    "maxDepthKm": float(round(df["depth"].max(), 1)),
    "minDepthKm": float(round(df["depth"].min(), 1)),
    "avgDepthKm": float(round(df["depth"].mean(), 1)),
    "earliestDate": datetime.fromtimestamp(df["time"].min() / 1000).strftime("%Y-%m-%d"),
    "latestDate": datetime.fromtimestamp(df["time"].max() / 1000).strftime("%Y-%m-%d"),
    "source": "USGS (United States Geological Survey) Keyless Public GeoJSON Feed"
}

# Export clean static JSON
with open(os.path.join(OUTPUT_DIR, "earthquakes.json"), "w") as out_f:
    json.dump(df_export.to_dict(orient="records"), out_f)

with open(os.path.join(OUTPUT_DIR, "summary.json"), "w") as sum_f:
    json.dump(stats, sum_f, indent=2)

print(f"SUCCESS: Exported {len(df_export)} earthquakes and summary stats to {OUTPUT_DIR}")
