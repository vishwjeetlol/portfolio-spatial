# Art Direction Analysis (Gemini Vision Perspective)

Analysis of 8 reference studios: Linear, Resend, Rauno Freiberg, Paco Coursey, Emil Kowalski, Geist, Stripe Newsroom, Chronicle.

## 1. What Makes Them Feel Premium
- **Atmospheric Neutral Grounding:** None of the benchmark references use pure `#000000` or raw stark white blocks. The background is a velvety dark graphite (`#08090c` to `#0d0f14`), allowing 1px borders with subtle alpha (`rgba(255, 255, 255, 0.08)`) to define spatial elevation without visual noise.
- **Micro-Typographic Precision:** Font hierarchy uses strict optical scale ratios with generous line-heights ($1.5$ to $1.65$). Titles are restrained ($28\text{px}$ to $34\text{px}$, not screaming $72\text{px}$). Sentence case is strictly preserved. Zero all-caps tracking on body copy.
- **Spacing Rhythm & Grid Cadence:** Strict $8\text{px}$ spatial multiples ($16\text{px}, 24\text{px}, 32\text{px}, 48\text{px}, 64\text{px}$). Large breathing room around primary interactive viewports, tightly grouped metadata.
- **Material Restraint:** Frosted glass and depth blur are applied *only* where content slides underneath (e.g., sticky headers and floating docks). Glass is never applied as a flat decorative sticker on stationary cards.
- **Motion Polish:** Damped harmonic physics with high stiffness and critical damping. Zero spring overshoot that wobbles endlessly. Micro-interactions take $<150\text{ms}$.

## 2. What Destroys Studio Credibility (To Avoid)
- Decorative rainbow / purple-cyan gradient borders on every card.
- Emoji icons in technical UI.
- Center-aligned longform descriptions.
- Over-animated hover-lifts (`translateY(-8px)`) that feel like generic template kits.
- Low-contrast light gray text (`#444`) that fails WCAG accessibility.
