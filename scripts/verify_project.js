const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node verify_project.js <project-slug>');
  process.exit(1);
}

const projectDir = path.resolve(__dirname, `../site/projects/${slug}`);
if (!fs.existsSync(projectDir)) {
  console.error(`Project directory does not exist: ${projectDir}`);
  process.exit(1);
}

// Start static server serving from project directory
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(projectDir, reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath);
    let ct = 'text/html';
    if (ext === '.js') ct = 'application/javascript';
    if (ext === '.css') ct = 'text/css';
    if (ext === '.json') ct = 'application/json';
    if (ext === '.png') ct = 'image/png';
    if (ext === '.svg') ct = 'image/svg+xml';
    if (ext === '.glb') ct = 'model/gltf-binary';
    if (ext === '.mp4') ct = 'video/mp4';

    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

async function run() {
  await new Promise(resolve => server.listen(5180, resolve));
  console.log(`Verifying project [${slug}] on port 5180...`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=metal']
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500); // Allow any canvas/animation to paint

  const previewPath = path.join(projectDir, 'preview.png');
  await page.screenshot({ path: previewPath });

  await browser.close();
  server.close();

  if (consoleErrors.length > 0) {
    console.error(`FAIL: Console errors detected in [${slug}]:`, consoleErrors);
    process.exit(1);
  }

  const stat = fs.statSync(previewPath);
  console.log(`PASS: [${slug}] verified with zero console errors. Screenshot saved: ${previewPath} (${Math.round(stat.size / 1024)} KB)`);
}

run().catch(err => {
  console.error(`Verification error for [${slug}]:`, err);
  if (server) server.close();
  process.exit(1);
});
