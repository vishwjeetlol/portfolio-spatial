# Anti-Patterns & AI Generation Tells (Codex / GPT Perspective)

Specific tells that instantly give away junior design or low-effort AI generation:

## 1. Visual & Chromatic Tells
- **The "AI Purple/Cyan" Wash:** Indiscriminate use of `#8b5cf6` to `#06b6d4` linear gradient backgrounds or glowing outlines on cards without semantic justification.
- **Pure Black (#000000) & White (#ffffff) Clashing:** Harsh uncalibrated contrast that causes eye strain and optical vibration.
- **Inconsistent Corner Radii:** Mixing `4px`, `8px`, `16px`, `24px`, and `999px` haphazardly across sibling containers.
- **Hairline Filler Rules:** Excessive horizontal rules (`<hr>`) and dot grids used as crutches to mask empty layout space.

## 2. Typographic Tells
- **The "One Colored Word" Headline:** Artificially coloring exactly one word in a headline (e.g., "Build the *future* of web").
- **All-Caps Eyebrow Tracking Overload:** Placing `UPPERCASE LETTER-SPACING: 0.2EM` tags above every single heading regardless of importance.
- **Faux-Editorial Numbering:** Slapping `01`, `02`, `03` numbers on items that are not sequential steps or chronologies.
- **Center-Aligned Prose Blocks:** Centering multi-line body paragraphs (> 2 lines), breaking natural left-to-right eye scan lines.

## 3. Motion & Ergonomic Tells
- **The Uniform "Hover Lift":** Adding `transform: translateY(-8px)` and a drop-shadow explosion to every single card on mouse hover.
- **Unbounded Wobble Physics:** Spring animations with zero damping that oscillate 10 times before resting.
- **Browser Default Form Controls:** Leaving native gray HTML `<input type="range">` sliders, blocky select menus, and system scrollbars unstyled.
- **Emoji As Interface Icons:** Using 🚀, ⚡, 🧠, 🎨 as functional UI icons instead of bespoke SVG symbols or clean typography.
