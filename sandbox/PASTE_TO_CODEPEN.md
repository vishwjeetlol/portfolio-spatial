# CodePen Standalone Preview Instructions

To preview the 3D Gyroscope and Spatial Dual-Split layout in CodePen:

1. Open [codepen.io/pen](https://codepen.io/pen).
2. Set **HTML Preprocessor** to None.
3. Paste the contents of `sandbox/codepen_preview.html` directly into the HTML editor pane.
4. In **Settings -> JS**, ensure `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js` is included (it is already embedded in the `<script>` tag in the HTML).
5. Interactivity checklist:
   - Move mouse across left and right halves: Gyroscope gimbals smoothly tilt toward the active half.
   - Click and drag the canvas: Inertia spin rotates rings with momentum decay.
   - Double-click the central core: Easter egg dispersion pulse scales the refractive icosphere.
   - Hover over project cards: CSS 3D perspective transforms cards outward with smooth spring physics.
