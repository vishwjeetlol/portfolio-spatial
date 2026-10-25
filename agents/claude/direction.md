# Design Plan & Architecture Specification (Claude Perspective)

## 1. Palette: The Spatial Titanium Matrix (5 Named Hex Colors)
- **`Void` (`#08090c`):** Deep non-black background substrate. Absorbs light without crushing shadows.
- **`Graphite` (`#111318`):** Raised component surface with natural ambient occlusion.
- **`Titanium Silver` (`#ced4da`):** Primary interactive rim border and subdued metadata color.
- **`Pure Alabaster` (`#f8f9fa`):** Primary text and high-contrast focal points (WCAG AAA ≥ 14:1).
- **`Specular Cyan` (`#5ce1e6`):** Precision accent for real-time telemetry, active state ticks, and focal nodes.

## 2. Typographic Roles (System Font Stack Only)
- **Display / Heading:** `-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif`. Weight: `600` / `700`. Letter-spacing: `-0.02em`. Sentence case.
- **Body / Prose:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif`. Weight: `400`. Max line-length: `68ch`. Line-height: `1.6`.
- **Telemetry / Mono:** `"SF Mono", Menlo, Monaco, Consolas, monospace`. Weight: `500`. Letter-spacing: `0.02em`. Used for parameters, coordinates, benchmarks, and code snippets.

## 3. Five Core Principles
1. **Immediate Verifiability:** Each project opens immediately to its primary live artifact (canvas, simulation, or 3D viewport)—never a title card or passive splash.
2. **Singular Boldness:** Spend boldness in exactly one place per project; everything else remains whisper-quiet.
3. **Physical Materiality with Purpose:** Frosted glass exists strictly where occlusion occurs. Flat cards use solid matte graphite.
4. **Sentence Case & Authorial Verbs:** Clean, direct, adult language. No marketing slogans, no self-congratulatory adjectives.
5. **Deterministic Performance:** Build-time data serialization, zero external runtime fetch calls, 60 FPS animation ceilings.

## 4. ASCII Wireframes

### Shell Wireframe
```
+-------------------------------------------------------------------------+
| [Back to Studio]      PROJECT TITLE // SUB-SYSTEM         [Code | Craft]|
+-------------------------------------------------------------------------+
|                                                                         |
|  +-------------------------------------+  +--------------------------+  |
|  |                                     |  | PARAMETERS & CONTROLS    |  |
|  |                                     |  | Sliders, Toggles, Modes  |  |
|  |     PRIMARY INTERACTIVE CANVAS      |  +--------------------------+  |
|  |   (Live WebGL / 2D Canvas / DOM)    |  | MEASURED TELEMETRY       |  |
|  |                                     |  | FPS: 60 | Loss: 0.04     |  |
|  |                                     |  +--------------------------+  |
|  +-------------------------------------+  | [See Under The Hood]     |  |
|                                           +--------------------------+  |
+-------------------------------------------------------------------------+
| [v] UNDER THE HOOD: Architecture Diagram / Code Excerpt / Stats         |
+-------------------------------------------------------------------------+
```

### Project Page Detail Wireframe (e.g. `neural-playground`)
```
+-------------------------------------------------------------------------+
| <- All Projects            Neural Playground               [Self-initiated]
+-------------------------------------------------------------------------+
| [2D Boundary Canvas (220x220)]   | ARCHITECTURE CONTROLS                |
| - Continuous decision field      | - Dataset: [Spiral | Circles | XOR]  |
| - Colored scatter data points    | - Hidden Layers: [ -===------ ] 2    |
| - Real-time gradient shift       | - Neurons:       [ ---===---- ] 8    |
|                                  | - Learning Rate: [ -==------- ] 0.08 |
|                                  | [Train Live] [Reset]                 |
|                                  +--------------------------------------+
| Epoch: 120 | Loss: 0.042 | 60fps | [V] Under The Hood                   |
|                                  | Loss curve canvas + backprop math    |
+-------------------------------------------------------------------------+
```
