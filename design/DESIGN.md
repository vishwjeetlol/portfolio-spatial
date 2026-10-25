# Spatial Studio Design Specification (Arbiter Consolidated)

Synthesized from multimodal inputs (`agents/gemini/direction.md`, `agents/claude/direction.md`, `agents/gpt/anti-patterns.md`) and refined for the 7 showcase projects.

## 1. Aesthetic Vision: Precision Spatial Studio
The interface embodies a high-precision spatial design and creative engineering studio: deep non-black graphite, brushed titanium rim lighting, and optical glass used strictly where depth occlusion occurs. The environment is clinical, tactile, and restrained. Zero decorative fluff.

## 2. The Spatial Titanium Matrix (Color Palette)
- **`Void` (`#08090c`)**: Background substrate. Non-black, prevents ocular contrast vibration.
- **`Graphite` (`#111318`)**: Primary panel and container surface. Solid matte; zero unnecessary glass blur.
- **`Graphite Raised` (`#181b22`)**: Secondary elevated control surface and active tabs.
- **`Rim Border Subdued` (`rgba(255, 255, 255, 0.08)`)**: Structural division lines.
- **`Titanium Silver` (`#ced4da`)**: Primary interactive borders, icons, and secondary telemetry text.
- **`Pure Alabaster` (`#f8f9fa`)**: Primary text and active values (Contrast ratio ≥ 14:1 against Void).
- **`Subject Accents` (Strictly one per project, never blended into decorative gradients):**
  - `neural-playground`: Electric Cyan (`#5ce1e6`)
  - `seismic-globe`: Subduction Amber (`#f4a228`)
  - `digit-atlas`: Phosphor Chartreuse (`#a3e635`)
  - `material-lab`: Specular Titanium (`#e2e8f0`)
  - `brand-concept`: Spatial Monolith (`#ffffff` / switchable brand shifts)
  - `glass-ui-lab`: Optical Quartz (`#94a3b8`)
  - `motion-studies`: Kinetic Ochre (`#eab308`)

## 3. Typographic System & Scale
Only system font stacks. Zero external Google Font or CDN network requests.
- **Display / Heading**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", -ui-sans-serif, system-ui, sans-serif`. Weight `600` / `700`, letter-spacing `-0.02em`. Sentence case strictly required.
- **Body / Prose**: `-apple-system, BlinkMacSystemFont, "SF Pro Text", -ui-sans-serif, system-ui, sans-serif`. Weight `400`, letter-spacing `-0.005em`, line-height `1.6`, max line length `68ch`.
- **Telemetry / Mono**: `"SF Mono", Menlo, Monaco, Consolas, monospace`. Weight `500`, letter-spacing `0.02em`, font-size `12px` / `13px`. Used for coordinates, parameters, FPS, weights, and code.

### Type Scale (Strict 8px Multiples)
- Title: `24px` / `32px` line-height
- Section Heading: `16px` / `24px` line-height
- Body: `14px` / `22px` line-height
- Meta / Telemetry: `12px` / `16px` line-height

## 4. Layout Architecture & Spatial Grid
- Strict 8px spatial rhythm: `8px`, `16px`, `24px`, `32px`, `48px`, `64px`.
- Max 2 corner radii rule:
  - **`Radius Control` = `6px`**: Buttons, segmented controls, inputs, badges, sliders.
  - **`Radius Surface` = `14px`**: Structural canvas viewports, panels, drawers.
- **Immediate Verifiability**: Every project opens immediately into its primary interactive canvas/viewport. Never show a passive splash card, skeleton loader, or banner that pushes the artifact below the fold.
- **Header**: Fixed, compact height (`52px`), frosted backdrop (`backdrop-filter: blur(20px)`), containing:
  - Left: Back link `← Studio`
  - Center: Project Title and Category badge (`Code` or `Craft`)
  - Right: `Self-initiated project` metadata tag
- **Main Workspace**: Split layout on desktop (Viewport left/center + Precision Control Panel right); stacked layout on mobile (< 900px).
- **Under The Hood Drawer**: Collapsible panel at the base containing architecture schematics, math/code excerpts, and measured benchmarks.

## 5. Prohibited Anti-Patterns (Banned AI & Junior Tells)
1. **No AI Gradient Washes**: No purple-cyan or multi-color gradients across headers, borders, or text.
2. **No One-Word Headline Highlights**: Never style a single word with an accent color.
3. **No All-Caps Eyebrow Spam**: Never put `UPPERCASE LETTER-SPACING` tags above every single heading.
4. **No Faux-Editorial Numbering**: No `01`, `02`, `03` unless items represent an ordered sequential step.
5. **No Center-Aligned Paragraphs**: All descriptive body prose must be left-aligned.
6. **No Uniform Hover-Lifts**: No `translateY(-8px)` or box-shadow explosions on hover. Hover states change subtle border luminescence or background alpha.
7. **No Browser Default Controls**: Native unstyled range sliders, scrollbars, and select boxes are strictly forbidden.
8. **No Emoji As Interface Icons**: Bespoke SVG geometry or plain typographic labels only.
9. **No Fluff Adjectives**: No "Revolutionary", "Next-gen", "Seamless", "Supercharged". Write plain authorial verbs describing what the system does.

## 6. Motion & Spring Restraint
- Spring physics must use critical damping (damping ratio $\zeta \approx 1.0$). Zero perpetual oscillation.
- Fast interactive response: micro-interactions $\le 150\text{ms}$.
- Full support for `prefers-reduced-motion: reduce`: instantly collapse transitions to immediate state updates.
