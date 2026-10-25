# Claude Scene Specialist Brief: 3D Gyroscope & Spatial Architecture

## Requirements
1. **Model & Geometry:**
   - 3 nested concentric brushed-titanium rings (`Ring_Outer`, `Ring_Mid`, `Ring_Inner`) + central refractive glass icosphere (`Core`).
   - `Ring_Outer`: radius ~2.4, tube ~0.08
   - `Ring_Mid`: radius ~1.8, tube ~0.07
   - `Ring_Inner`: radius ~1.2, tube ~0.06
   - `Core`: radius ~0.65, detail level 3 (icosphere / sphere)
2. **Materials:**
   - Rings: Brushed titanium finish (`metalness: 0.95`, `roughness: 0.25`, silver specular).
   - Core: Refractive optical glass (`transmission: 1.0`, `ior: 1.5`, `roughness: 0.05`, `thickness: 1.2`, `chromaticAberration / dispersion`).
3. **Environment:**
   - Procedural cube/equirectangular gradient generated dynamically in memory (no external HDRI network fetch).
4. **Interaction & Motion Physics:**
   - Pointer tracking: pointer X eases tilt toward left (Code) or right (Craft) using damped spring interpolation.
   - Rotational rates: Outer ring (slow), Mid ring (medium, counter-axis), Inner ring (fast, tilted).
   - Interactive inertia: Pointer drag adds rotational momentum; decays with exponential damping.
   - Double-click core easter egg: Pulse wave expansion and momentary chromatic dispersion burst.
   - Teardown & Lifecycle: Full resource disposal on unmount (`dispose()` on geometries, materials, textures, renderer).
   - Accessibility: Detects `prefers-reduced-motion` and pauses continuous rotation; gracefully falls back to poster image if WebGL is unsupported.
