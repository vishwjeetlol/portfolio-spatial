const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const outDir = path.resolve(__dirname, '../design/social');
fs.mkdirSync(outDir, { recursive: true });

async function createSocialAssets() {
  const browser = await chromium.launch({ headless: true });

  // 1. Cover Template (1080x1350)
  const coverHtml = `<!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0; width: 1080px; height: 1350px; background: #090a0d; color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
        box-sizing: border-box; padding: 80px; display: flex; flex-direction: column;
        justify-content: space-between; position: relative; overflow: hidden;
      }
      .glow {
        position: absolute; width: 800px; height: 800px; border-radius: 50%;
        background: radial-gradient(circle, rgba(92,225,230,0.15), transparent 70%);
        top: 200px; left: 140px; pointer-events: none;
      }
      .badge {
        font-family: monospace; font-size: 24px; color: #5ce1e6;
        border: 2px solid rgba(92,225,230,0.3); border-radius: 9999px;
        padding: 12px 28px; width: fit-content; text-transform: uppercase;
      }
      .hero-center {
        text-align: center; z-index: 2; margin: auto 0;
      }
      h1 {
        font-size: 72px; line-height: 1.1; margin: 0 0 24px 0; font-weight: 800;
        background: linear-gradient(180deg, #ffffff, #8e95a0);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }
      p {
        font-size: 32px; color: #adb5bd; line-height: 1.4; margin: 0; max-width: 900px;
      }
      .footer {
        display: flex; justify-content: space-between; align-items: center;
        border-top: 2px solid rgba(255,255,255,0.1); padding-top: 40px;
        font-family: monospace; font-size: 24px; color: #868e96;
      }
    </style>
  </head>
  <body>
    <div class="glow"></div>
    <div class="badge">Spatial Engineering // 01</div>
    <div class="hero-center">
      <h1>REFRACTIVE GLASS GYROSCOPE</h1>
      <p>Building real-time WebGL optical physics at locked 60 FPS without external assets.</p>
    </div>
    <div class="footer">
      <span>VISHWJEET // SPATIAL STUDIO</span>
      <span>SWIPE &rarr;</span>
    </div>
  </body>
  </html>`;

  // 2. Carousel Slide (1080x1350)
  const carouselHtml = `<!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0; width: 1080px; height: 1350px; background: #0c0e14; color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
        box-sizing: border-box; padding: 80px; display: flex; flex-direction: column;
        justify-content: space-between; position: relative;
      }
      .header {
        display: flex; justify-content: space-between; align-items: center;
      }
      .tag {
        font-family: monospace; font-size: 24px; color: #bdff52; text-transform: uppercase;
      }
      .slide-num {
        font-family: monospace; font-size: 24px; color: #8e95a0;
      }
      .card {
        background: rgba(255,255,255,0.04); border: 2px solid rgba(255,255,255,0.14);
        border-radius: 32px; padding: 60px; margin: auto 0;
      }
      h2 {
        font-size: 56px; margin: 0 0 24px 0; color: #fff;
      }
      ul {
        font-size: 30px; line-height: 1.8; color: #ced4da; margin: 0; padding-left: 40px;
      }
      li { margin-bottom: 16px; }
      .footer {
        font-family: monospace; font-size: 24px; color: #868e96;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <span class="tag">Architecture Breakdown</span>
      <span class="slide-num">02 / 05</span>
    </div>
    <div class="card">
      <h2>Under the Hood: 3 Rings + Core</h2>
      <ul>
        <li><strong>Ring_Outer:</strong> Continuous slow Z-rotation (0.003 rad/frame).</li>
        <li><strong>Ring_Mid:</strong> Medium counter-axis Y-spin with momentum decay.</li>
        <li><strong>Ring_Inner:</strong> Fast tilted gimbal response to cursor coordinates.</li>
        <li><strong>Refractive Core:</strong> Icosahedron mesh with transmission 0.98.</li>
      </ul>
    </div>
    <div class="footer">
      <span>portfolio-spatial.vercel.app</span>
    </div>
  </body>
  </html>`;

  // 3. Story Template (1080x1920)
  const storyHtml = `<!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0; width: 1080px; height: 1920px; background: #090a0d; color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
        box-sizing: border-box; padding: 120px 80px; display: flex; flex-direction: column;
        justify-content: space-between; position: relative; overflow: hidden;
      }
      .ambient {
        position: absolute; inset: 0;
        background: radial-gradient(circle at 50% 30%, rgba(92,225,230,0.12), transparent 60%),
                    radial-gradient(circle at 80% 80%, rgba(207,0,94,0.08), transparent 50%);
      }
      .top-meta {
        position: relative; z-index: 2;
        font-family: monospace; font-size: 28px; color: #adb5bd;
      }
      .content {
        position: relative; z-index: 2; text-align: center; margin: auto 0;
      }
      h1 {
        font-size: 84px; line-height: 1.1; margin: 0 0 32px 0; font-weight: 800;
      }
      .tagline {
        font-size: 38px; line-height: 1.4; color: #ced4da; margin-bottom: 60px;
      }
      .pill {
        display: inline-block; background: #fff; color: #000; font-size: 32px;
        font-weight: 700; padding: 20px 48px; border-radius: 9999px; text-decoration: none;
      }
      .bottom-meta {
        position: relative; z-index: 2; text-align: center;
        font-family: monospace; font-size: 24px; color: #6c757d;
      }
    </style>
  </head>
  <body>
    <div class="ambient"></div>
    <div class="top-meta">VISHWJEET // SPATIAL STUDIO</div>
    <div class="content">
      <h1>NEW CASE STUDY</h1>
      <div class="tagline">Spatial Dual-Split Portfolio &amp; Real-time 3D Gyroscope</div>
      <div class="pill">TAP TO EXPLORE</div>
    </div>
    <div class="bottom-meta">Locked 60 FPS &bull; Static Architecture &bull; Open Source</div>
  </body>
  </html>`;

  const page = await browser.newPage();

  // Render Cover
  await page.setViewportSize({ width: 1080, height: 1350 });
  await page.setContent(coverHtml);
  await page.screenshot({ path: path.join(outDir, 'cover_1080x1350.png') });
  fs.writeFileSync(path.join(outDir, 'cover_1080x1350.html'), coverHtml);

  // Render Carousel
  await page.setContent(carouselHtml);
  await page.screenshot({ path: path.join(outDir, 'carousel_1080x1350.png') });
  fs.writeFileSync(path.join(outDir, 'carousel_1080x1350.html'), carouselHtml);

  // Render Story
  await page.setViewportSize({ width: 1080, height: 1920 });
  await page.setContent(storyHtml);
  await page.screenshot({ path: path.join(outDir, 'story_1080x1920.png') });
  fs.writeFileSync(path.join(outDir, 'story_1080x1920.html'), storyHtml);

  await browser.close();
  console.log('Social templates generated successfully in design/social/');
}

createSocialAssets().catch(console.error);
