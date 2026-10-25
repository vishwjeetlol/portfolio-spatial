# Spatial Studio Design Specification

## 1. Aesthetic Vision: Spatial Studio
The interface embodies a high-precision spatial design studio: dark cosmic graphite, brushed titanium edges, and frosted optical glass. The atmosphere is clinical yet tactile, driven by realistic spring physics, refraction optics, and kinetic responsiveness.

## 2. Core Components

### 2.1 The Gyroscope Hero
- 3 nested concentric brushed-titanium rings centered around an optical refractive icosphere.
- Smooth spring physics tilts the gimbal towards the cursor coordinate.
- Double-clicking the core triggers a dispersion pulse.
- Graceful poster fallback on mobile or no-WebGL devices.

### 2.2 The Dual-Split Shell
- **Desktop (>= 1024px):** A balanced 50/50 vertical division between `Code` (Left) and `Craft` (Right). Hovering expands the active column with smooth spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Mobile (< 1024px):** Segmented frosted pill control (`[ Code | Craft ]`) that switches active viewport and synchronizes the 3D gyroscope tilt.

### 2.3 CSS 3D Project Cards
- Elevated frosted glass slabs (`backdrop-filter: blur(24px)`).
- Sub-millimeter brushed rim lighting (`border: 1px solid rgba(255, 255, 255, 0.12)`).
- Mouse position translates into 3D card perspective tilt.
- "See Under the Hood" toggle displays architectural schematics and wireframe breakdowns.

### 2.4 Magnetic Floating Dock (3 Doors)
- **Door 1: Hire / Project Builder:** Launches interactive modal with project scope, timeline, and budget builder; pre-fills `mailto:` link.
- **Door 2: CV & GitHub:** Direct access to PDF curriculum vitae and GitHub repository.
- **Door 3: Instagram & Writing:** Direct access to the 30-day Instagram campaign and published technical notes.

## 3. Contrast & Accessibility
- Primary text on frosted glass has contrast ratio >= 7:1 (WCAG AAA compliant).
- Full keyboard focus trap in all modal dialogs with `Esc` key dismiss.
- Automatic reduced motion detection disables gyro loop and replaces dynamic transitions with instantaneous fades.
