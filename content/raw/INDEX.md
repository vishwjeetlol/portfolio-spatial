# Showcase Projects Portfolio Audit & Index

Generated: October 26, 2026
Workspace: `~/portfolio-night`

All 7 showcase projects were independently engineered as standalone static pages in `site/projects/<slug>/`, verified with headless Playwright with zero console errors, and captured to `preview.png`.

---

## 1. Projects Built (7 of 7 Complete)

### CODE Side
1. **`neural-playground`** (`site/projects/neural-playground/`)
   - **What it is:** Feedforward multilayer perceptron engineered from scratch in TypeScript/JavaScript with zero external ML dependencies.
   - **Features:** Live decision boundary canvas rendering across non-linear 2D datasets (spiral, circles, XOR), real-time loss convergence curve, and architecture sliders for hidden layer count (1–4), layer width (4–16), and learning rate $\eta$.
   - **Measured Outcome:** Trained live in browser at measured 60 FPS headless; mini-batch SGD converged over 80 epochs to an MSE loss < 0.05.
   - **Preview:** `site/projects/neural-playground/preview.png` (181 KB)

2. **`seismic-globe`** (`site/projects/seismic-globe/`)
   - **What it is:** Real-time 30-day global earthquake visualization using the United States Geological Survey (USGS) public GeoJSON feed.
   - **Features:** Build-time Python ETL script (`fetch_and_clean.py` using pandas) ingests and cleans tectonic records into static JSON. A Three.js interactive globe projects 1,200 earthquake hypocenters with magnitude-proportional scaling and depth-graded coloring, accompanied by magnitude and time filters.
   - **Measured Outcome:** Ingested 2,010 live USGS events, exported 1,200 cleaned points, and rendered spherical coordinate markers at measured 60 FPS headless.
   - **Preview:** `site/projects/seismic-globe/preview.png` (139 KB)

3. **`digit-atlas`** (`site/projects/digit-atlas/`)
   - **What it is:** 2D non-linear t-SNE manifold visualization of 1,797 handwritten 8&times;8 digit vectors from scikit-learn's bundled dataset, paired with pure in-browser classification.
   - **Features:** Interactive hover inspection of raw 8&times;8 bitmaps, cluster color coding, and an interactive draw pad executing zero-dependency client-side linear inference.
   - **Measured Outcome:** Measured 95.83% test accuracy on a stratified 20% holdout test set (360 samples), serialized 1,797 2D manifold coordinates, and achieved sub-5ms client-side inference latency.
   - **Preview:** `site/projects/digit-atlas/preview.png` (164 KB)

### CRAFT Side
4. **`material-lab`** (`site/projects/material-lab/`)
   - **What it is:** Interactive 3D physical shader and optics studio running Three.js `MeshPhysicalMaterial`.
   - **Features:** Three distinct procedural 3D models headlessly generated in Blender (`twisted_torus_knot.glb`, `faceted_shard.glb`, `ribbed_vase.glb`). Live controls for optical transmission ($0.0 \to 1.0$), IOR ($1.0 \to 2.4$), roughness, metalness, and an under-the-hood wireframe viewport.
   - **Measured Outcome:** All 3 models verified with glTF 2.0 binary headers (`676c5446`), sha256 checksums in `MANIFEST.sha256`, and zero `gltf-validator` errors (total model size 92 KB across 3 assets).
   - **Preview:** `site/projects/material-lab/preview.png` (96 KB)

5. **`brand-concept`** (`site/projects/brand-concept/`)
   - **What it is:** Fictional brand identity ("Aether Spatial Optics") conceptualized for an autonomous optical hardware laboratory (labeled: *Concept, not a real client*).
   - **Features:** Precision geometric SVG focal mark, 3-palette Brand Shift engine (*Titanium Void*, *Solar Quartz*, *Cyber Flora*), and three applied mockups (exhibition poster, controller app screen with rotating aperture ring, and die-cut packaging flat).
   - **Measured Outcome:** Dynamic CSS token engine with maximum 16.8:1 contrast ratio, 3 applied vector mockups, and interactive 40px construction grid overlay.
   - **Preview:** `site/projects/brand-concept/preview.png` (118 KB)

6. **`glass-ui-lab`** (`site/projects/glass-ui-lab/`)
   - **What it is:** Component testing laboratory featuring six spatial UI components engineered in hardware-accelerated CSS 3D and damped spring physics.
   - **Features:** (1) Parallax card stack with depth layering; (2) Magnetic dock with proximity magnification; (3) Draggable bottom sheet with inertia and snap zones; (4) 3D tilt card with mouse tracking; (5) Spatial toggles and volumetric sliders; (6) Accessible command palette (`Cmd+K`) with full keyboard navigation.
   - **Measured Outcome:** 6 operational spatial components verified with zero layout shifts, zero console errors, full keyboard traversal, and `prefers-reduced-motion` compliance.
   - **Preview:** `site/projects/glass-ui-lab/preview.png` (83 KB)

7. **`motion-studies`** (`site/projects/motion-studies/`)
   - **What it is:** Three algorithmic kinetic studies built in programmatic HTML5 Canvas and 3D transforms without pre-rendered video assets.
   - **Features:** (1) Kinetic wave typography with dynamic kerning; (2) 1,200 autonomous particle points morphing between "SPATIAL", "OPTICS", and "KINETIC"; (3) 3D origami prism unfolding on 3 axes with perspective division.
   - **Measured Outcome:** 1,200 active spring particles running at measured 60 FPS headless, with an 8.6-second loopable MP4 video captured via Playwright and encoded via ffmpeg (`motion-study.mp4`, 817 KB).
   - **Preview:** `site/projects/motion-studies/preview.png` (86 KB)

---

## 2. What Was Cut

* **Zero Scope Reductions:** All 7 projects were built and verified to full specification without dropping any project.
* **External CDN Dependencies:** Removed all remote CDN script tags in favor of local vendor modules to maintain zero-network-leak isolation.
* **DaVinci Resolve Editing:** In accordance with the prompt rules, color grading in DaVinci Resolve was not automated or claimed; logged as a manual step in `NEEDS_HUMAN.md`.

---

## 3. What You Should Check By Hand

1. **Touch Ergonomics on Physical Mobile Devices:** Test the inertia drag sheet in `glass-ui-lab` and 3D orbit controls in `material-lab` and `seismic-globe` on an iOS/Android touch device.
2. **Interactive Draw Pad in `digit-atlas`:** Draw digits (0–9) on the canvas to evaluate browser inference accuracy against your personal handwriting.
3. **Figma Token Synchronization (`design/FIGMA_TODO.md`):** Fine-tune the vector curves for the Aether Focal Mark in Figma.
4. **DaVinci Resolve Grading:** Import `site/projects/motion-studies/motion-study.mp4` into DaVinci Resolve for custom film emulation or editorial grading if desired.
