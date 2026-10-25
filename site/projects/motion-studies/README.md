# Motion Studies: 3 Kinetic Algorithms in Code

A suite of three loopable kinetic motion studies implemented algorithmically in HTML5 Canvas and CSS 3D transforms.

## What It Is
An exploration of programmatic movement without pre-rendered video assets or heavy timeline libraries. Each study tests mathematical principles of spatial timing, harmonic resonance, and topological transition.

## The 3 Kinetic Studies
1. **Study 1: Kinetic Wave Typography:**
   - Harmonic kerning and baseline modulation: $y(t, i) = \sin(\omega t + i \cdot \phi) \cdot A$.
   - Variable font optical dilation across row cadences.
2. **Study 2: Particle-Text Morph:**
   - 1,200 autonomous point particles tracking vector displacement forces towards rasterized letter matrices: "SPATIAL" &rarr; "OPTICS" &rarr; "KINETIC".
   - Damped harmonic velocity damping ($v_{t+1} = v_t \cdot 0.88 + \Delta x \cdot 0.05$).
3. **Study 3: 3D Origami Prism Unfold:**
   - Real-time 3D wireframe geometric projection unfolding vertices outward along calculated normals with camera coordinate rotation.

## Video Capture & Post-Production Note
- **Raw Capture:** 8.6-second 60 FPS video captured headlessly via Playwright and encoded via ffmpeg to `motion-study.mp4` (817 KB).
- **Post-Production Note:** Color grading, film stock emulation, and editorial cuts in DaVinci Resolve are manual steps reserved for the human creator (logged in `NEEDS_HUMAN.md`). No DaVinci Resolve operations were automated.

## How To Run
Open `index.html` in any modern web browser or serve with `npx serve`.
