const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8089;
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  const filePath = path.join(ROOT, reqPath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found: ' + filePath);
    return;
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    const idx = path.join(filePath, 'index.html');
    if (fs.existsSync(idx)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(idx).pipe(res);
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.glb': 'model/gltf-binary',
    '.mp4': 'video/mp4'
  }[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
});

async function runQA(slug) {
  server.listen(PORT);
  console.log(`Server listening on http://localhost:${PORT}`);

  const browser = await chromium.launch();
  const errors = [];

  // Desktop 1440x900
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });

  const url = `http://localhost:${PORT}/site/projects/${slug}/index.html`;
  console.log(`Navigating to ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const desktopScreenshot = path.join(ROOT, 'site/projects', slug, 'preview.png');
  await page.screenshot({ path: desktopScreenshot, fullPage: false });
  console.log(`Saved desktop preview to ${desktopScreenshot}`);

  // Mobile 390x844
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobilePage.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[Mobile] Console Error: ${msg.text()}`);
  });
  mobilePage.on('pageerror', err => errors.push(`[Mobile] Page Error: ${err.message}`));
  await mobilePage.goto(url, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  const mobileScreenshot = path.join(ROOT, 'site/projects', slug, 'preview-mobile.png');
  await mobilePage.screenshot({ path: mobileScreenshot, fullPage: false });
  console.log(`Saved mobile preview to ${mobileScreenshot}`);

  await browser.close();
  server.close();

  if (errors.length > 0) {
    console.error(`QA Failed with ${errors.length} errors:`);
    errors.forEach(e => console.error(e));
    process.exit(1);
  } else {
    console.log(`QA Passed with 0 console errors for ${slug}!`);
  }
}

const slug = process.argv[2];
if (!slug) {
  console.error('Please specify slug');
  process.exit(1);
}

runQA(slug).catch(err => {
  console.error(err);
  process.exit(1);
});
