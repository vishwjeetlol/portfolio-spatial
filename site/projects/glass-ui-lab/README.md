# Glass UI Lab: 6 Spatial Components & Spring Physics

A sandbox of six interactive spatial interface components engineered in CSS 3D, hardware-accelerated transforms, and damped harmonic spring physics.

## What It Is
An exploratory component library demonstrating spatial tactile ergonomics for mixed reality and elevated 2.5D web applications. Every component adheres to frosted glass optical diffusion standards (`backdrop-filter: blur(24px) saturate(180%)`) with WCAG AAA compliant text contrast.

## The 6 Components
1. **Parallax Card Stack:** 3D card deck with depth layering (`translateZ(-30px)` to `translateZ(20px)`) that expands on hover.
2. **Magnetic Dock:** Circular frosted dock with proximity icon magnification and spring elevation.
3. **Draggable Sheet with Inertia:** Vertical sheet handle supporting touch/mouse dragging, momentum coasting, and boundary snapping.
4. **3D Tilt Card:** Cursor-following perspective card rotation with sub-pixel specular rim highlights.
5. **Spatial Toggles & Sliders:** Tactile binary state switches with smooth spring transitions.
6. **Command Palette (`Cmd+K`):** Keyboard-accessible dialog with `ArrowUp`/`ArrowDown` focus selection, `Enter` execution, and `Esc` dismissal.

## Accessibility
- Supports `prefers-reduced-motion` media queries by converting dynamic spring physics into instantaneous state transitions.
- Full keyboard traversal and focus trapping.

## How To Run
Open `index.html` in any modern web browser or serve statically with `npx serve`.
