const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const projects = [
  { id: 'threejs-museum', title: 'The Museum of Three.js', tag: 'WebGL / Three.js', color: '#5ce1e6' },
  { id: 'nepo-baby-web-toy', title: 'Nepo Baby Web Toy', tag: 'Desi Kitsch / CSS 3D', color: '#f4a228' },
  { id: 'nepo-magazine-blender', title: 'Nepo Magazine Blender', tag: 'Editorial / 3D Canvas', color: '#bdff52' },
  { id: 'tata-truck-simulator', title: 'Tata Truck Simulator', tag: 'Web Audio / Simulation', color: '#cf005e' },
  { id: 'code-placeholder-1', title: 'Data & Systems Pipeline', tag: 'TypeScript / Systems', color: '#8e95a0' },
  { id: 'code-placeholder-2', title: 'ML Inference Engine', tag: 'PyTorch / Vision', color: '#8e95a0' }
];

async function generateThumbnails() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 600, height: 380 });

  const outDir = path.resolve(__dirname, '../public/img/projects');
  fs.mkdirSync(outDir, { recursive: true });

  for (const p of projects) {
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin:0; width:600px; height:380px; background:#0c0e14; color:#fff; font-family:-apple-system,system-ui,sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; border:2px solid ${p.color}; box-sizing:border-box; }
        .tag { font-family:monospace; font-size:12px; color:${p.color}; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; }
        h1 { margin:0; font-size:24px; font-weight:700; text-align:center; max-width:80%; }
        .grid { position:absolute; inset:0; background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06), transparent 70%); pointer-events:none; }
      </style>
    </head>
    <body>
      <div class="grid"></div>
      <div class="tag">${p.tag}</div>
      <h1>${p.title}</h1>
    </body>
    </html>`;
    await page.setContent(html);
    await page.screenshot({ path: path.join(outDir, `${p.id}.png`) });
    console.log(`Generated thumbnail: ${p.id}.png`);
  }

  // Also render CV to PDF
  const cvHtmlPath = 'file://' + path.resolve(__dirname, '../cv/index.html');
  await page.goto(cvHtmlPath);
  fs.mkdirSync(path.resolve(__dirname, '../site/public'), { recursive: true });
  fs.mkdirSync(path.resolve(__dirname, '../public'), { recursive: true });
  await page.pdf({
    path: path.resolve(__dirname, '../public/cv.pdf'),
    format: 'A4',
    printBackground: true
  });
  // Also copy to site/public/cv.pdf
  fs.copyFileSync(path.resolve(__dirname, '../public/cv.pdf'), path.resolve(__dirname, '../site/public/cv.pdf'));
  console.log('Generated CV PDF via Playwright!');

  await browser.close();
}

generateThumbnails().catch(console.error);
