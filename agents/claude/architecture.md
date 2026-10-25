# System Architecture: Spatial Dual-Split Portfolio

Author: Claude / Orchestrator Synthesis
Target: Static Vite + TypeScript, Three.js r160, Vanilla CSS Spatial Tokens

---

## 1. High-Level Architecture
The application runs as a zero-dependency static single-page spatial experience.

```
┌────────────────────────────────────────────────────────┐
│                      HEADER / HUD                      │
│   Identity [Vishwjeet]           Status [Available]    │
├────────────────────────────────────────────────────────┤
│                   SPATIAL HERO SCENE                   │
│         [3D Refractive Gyroscope Canvas (WebGL)]        │
│          Tilt Left (Code) <---> Tilt Right (Craft)     │
├───────────────────────────┬────────────────────────────┤
│       LEFT: CODE (50%)    │     RIGHT: CRAFT (50%)     │
│   • Systems Engineering   │   • The Museum of Three.js │
│   • Data Pipelines        │   • Nepo Baby Web Toy      │
│   • ML Inference Engine   │   • Tata Truck Simulator   │
│   [See Under the Hood]    │   [See Under the Hood]     │
├───────────────────────────┴────────────────────────────┤
│                  MAGNETIC FLOATING DOCK                │
│   [ 1. Hire / Project Builder ] [ 2. CV / GitHub ]     │
│   [ 3. Instagram / Writing    ]                        │
└────────────────────────────────────────────────────────┘
```

## 2. Component Hierarchy
1. **`HeroGyroscope` (WebGL Canvas)**:
   - Manages Three.js scene, camera, renderer, animation loop, spring physics, and pointer drag inertia.
   - Fallback layer: `<img src="/img/gyro-poster.png" />` visible when WebGL is unavailable or reduced motion is preferred.
2. **`DualSplitLayout`**:
   - Desktop: 2-column flex grid with frosted glass dividers and spring hover expansion.
   - Mobile: Segmented control switch (`Code` | `Craft`) toggling active column with synchronized gyro tilt.
3. **`ProjectCard` (CSS 3D)**:
   - Interactive tilt on mouse move (`perspective: 1000px`, `transform-style: preserve-3d`).
   - Tags, stack badges, outcomes list, links, and "See Under the Hood" modal trigger.
4. **`UnderTheHoodModal`**:
   - Displays SVG architectural diagrams (Code) or procedural wireframe/3D breakdowns (Craft).
   - Traps focus and handles `Esc` key dismiss.
5. **`HireModal` (Project Scope Builder)**:
   - Multi-step configurator: Project Type, Scope, Timeline, Budget tier.
   - Generates formatted `mailto:` URL and one-click copyable proposal brief.
6. **`MagneticDock`**:
   - Floating frosted glass bar with proximity icon magnification.

## 3. Performance & Memory Budget
- Zero external fonts (native system font stack saves ~250ms blocking time).
- Procedural environment generation saves ~1.5MB HDRI download.
- Geometry vertex reuse with `MeshPhysicalMaterial`.
- Clean teardown protocol prevents GPU memory retention.
