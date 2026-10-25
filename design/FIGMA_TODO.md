# Figma Token Synchronization TODO

Status: Figma pass pending (design/figma-tokens.json not yet supplied)

## Steps for Human Designer:
1. Export Figma Variables or Token Studio JSON from your master Figma design file.
2. Save the exported JSON to `design/figma-tokens.json`.
3. Expected token mapping:
   - `colors.silver.*` -> Titanium and silver metallic ramp
   - `colors.glass.*` -> Frosted glass surface properties (blur, opacity, rim borders)
   - `radii.*` -> Card, pill, and dock corner radii
   - `physics.springCurves.*` -> Easing curves for split expansion and dock magnification
4. **Brand Concept Refinement (`site/projects/brand-concept/`):**
   - Fine-tune vector node constraints for the Aether Focal Mark in Figma.
   - Vector export of die-cut packaging creases to SVG for production print proofs.
5. Once saved, diffs will be automatically merged into `design/tokens.json` on a branch.
