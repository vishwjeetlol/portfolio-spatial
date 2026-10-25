# Overnight Orchestration Dossier: Spatial Dual-Split Portfolio & Social Kit

Generated: October 26, 2026
Orchestrator: Antigravity (`agy`) / Gemini 3.8

---

## 1. Live Deployment & Repository URLs

- **Production URL:** [https://portfolio-spatial-eight.vercel.app](https://portfolio-spatial-eight.vercel.app)
- **Deployment Preview Alias:** [https://portfolio-spatial-i3fblmorh-vishwjeetchavan123-9223.vercel.app](https://portfolio-spatial-i3fblmorh-vishwjeetchavan123-9223.vercel.app)
- **GitHub Repository (Public):** [https://github.com/vishwjeetlol/portfolio-spatial](https://github.com/vishwjeetlol/portfolio-spatial)
- **Release Tag:** `v0.1.0`
- **Latest Commit:** Verified on `main` (clean working tree)

---

## 2. Visual Captures & Gyro Poster

- **Hero Poster Fallback:** `public/img/gyro-poster.png` (370 KB)
- **Left Tilt (Code Focus):** `public/img/gyro-still-1.png` (365 KB)
- **Right Tilt (Craft Focus):** `public/img/gyro-still-2.png` (366 KB)
- **Multi-Device Responsive Audits:**
  - Desktop 1440px: `sandbox/screenshots/desktop-1440.png`
  - Tablet 768px: `sandbox/screenshots/tablet-768.png`
  - Mobile 360px: `sandbox/screenshots/mobile-360.png`

---

## 3. Tool Attribution Matrix

- **GitHub CLI (`gh`):** Audited `@vishwjeetlol` repositories without cloning, created private repo, pushed tags, and toggled public visibility after gate clearance.
- **Blender 5.4.0 Alpha:** Headless execution of `blender/generate_gyro.py` generating `public/models/gyroscope.glb` (161 KB, glTF 2.0).
- **Three.js (r160):** Rendered 3 concentric titanium rings and refractive optical icosphere core with transmission 0.98.
- **Vite 5.4 + TypeScript:** Static compilation completed in 334ms with zero warnings and zero layout shifts.
- **Playwright Chromium:** Automated headless cross-viewport audits (360/768/1440), 20x mount/unmount memory leak tests, and PDF CV compilation.
- **Claude CLI:** Interactive login required; orchestrator synthesis fallback executed for `agents/claude/architecture.md`.
- **Gemini CLI:** Standalone CLI absent from PATH; native Gemini 3.8 model generated `agents/gemini/art_direction.md` and asset audits.
- **Codex / ChatGPT CLI:** Absent from PATH; structured synthesis generated `agents/gpt/case_study_copy_b.md` and 30-day Instagram calendar.
- **Open Design:** Authored spatial design system tokens and rendered Instagram social campaign assets.
- **Lovable / AI Studio:** Optional non-blocking tools; candidate prompts drafted in documentation.

---

## 4. Verification & Quality Gates

- **`scripts/verify.sh`:** **PASSED (100%)**
  - All 15 required non-empty files present.
  - GLB verification passed: glTF magic header `676c5446` validated, sha256 checksum matched `public/models/MANIFEST.sha256`, zero `gltf-validator` errors.
  - Schema validation passed: `src/data/projects.json` verified with local `ajv` against `projects.schema.json`.
  - Secret key scan passed: Zero API keys, bearer tokens, or `.env*` files present across repo and build output.
  - Network isolation passed: Zero unauthorized external network or tracking requests made.
- **Sandbox Performance:**
  - 20x mount/unmount cycles verified without memory leaks.
  - Indicative frame rate: ~60 FPS under headless Chromium (hardware GPU check pending for human).

---

## 5. Pending Human Actions (Action Required)

1. **Figma Pass (`design/FIGMA_TODO.md`):** Export Figma variables/tokens to `design/figma-tokens.json` to override base tokens.
2. **Intake Data Update:** Replace `[PLACEHOLDER]` entries in `src/data/projects.json` for contact email, Instagram handle, and booking URL.
3. **Real Code Projects:** Add 1–2 real backend/systems/ML repositories to replace `project-5` and `project-6` placeholders.
4. **Physical Device Performance:** Test interactive gyroscope touch and inertia physics on real iOS/Android devices.
5. **Overleaf CV (Optional):** `cv/main.tex` is formatted and ready for import into Overleaf or local LaTeX compilation.
6. **Custom Domain:** Point your DNS records to Vercel if binding a custom apex or subdomain.

---

## 6. Social Campaign Checklist (Nothing Posted)

- [x] 30-day Instagram campaign plan documented in `social/instagram_launch_plan.md`
- [x] Instagram Feed Cover (1080x1350) rendered in `design/social/cover_1080x1350.png`
- [x] Instagram Carousel Slide (1080x1350) rendered in `design/social/carousel_1080x1350.png`
- [x] Instagram Story Template (1080x1920) rendered in `design/social/story_1080x1920.png`
- [x] Zero social accounts logged into; zero posts published.

---

## 7. Known Risks

- Mobile iOS Safari `<canvas>` power throttling: ensure device low-power mode does not artificially cap requestAnimationFrame to 30 FPS.
- Vercel hobby plan bandwidth: 3D model is 161 KB (well within limits), but monitor CDN traffic if viral.

---

## 8. The ONE Next Action to Take First

> **Open [https://portfolio-spatial-eight.vercel.app](https://portfolio-spatial-eight.vercel.app) on your primary desktop browser and test the cursor tilt, drag-to-spin inertia, and double-click the central core.**
