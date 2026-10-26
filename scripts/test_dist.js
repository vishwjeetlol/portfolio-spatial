const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8089;
const DIST = path.resolve(__dirname, '../site/dist');

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  let filePath = path.join(DIST, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found: ' + reqPath);
    return;
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
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf'
  }[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
});

async function testVercelDist() {
  server.listen(PORT);
  console.log(`Dist server listening at http://localhost:${PORT}`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[Console Error] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    errors.push(`[Page Error] ${err.message}`);
  });

  console.log('Testing Home Page...');
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check how many exhibition portals rendered
  const portalCount = await page.locator('.exhibition-portal').count();
  const labCount = await page.locator('.lab-pill-card').count();
  console.log(`Rendered exhibition portals: ${portalCount}, secondary labs: ${labCount}`);

  // Take screenshot of new homepage
  await page.screenshot({ path: path.join(__dirname, 'homepage_desktop.png'), fullPage: false });
  console.log('Saved homepage_desktop.png');

  // Test each project URL directly in dist
  const projects = [
    'liquid-chrome',
    'physics-playground',
    'particle-swarm',
    'cyber-tunnel',
    'vinyl-turntable',
    'cloth-origami',
    'neural-playground',
    'seismic-globe',
    'digit-atlas',
    'material-lab',
    'brand-concept',
    'glass-ui-lab',
    'motion-studies'
  ];

  for (const slug of projects) {
    console.log(`Testing /projects/${slug}/...`);
    await page.goto(`http://localhost:${PORT}/projects/${slug}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
  }

  await browser.close();
  server.close();

  if (errors.length > 0) {
    console.error('Errors found in dist verification:');
    errors.forEach(e => console.error(e));
    process.exit(1);
  }

  console.log('ALL DIST VERIFICATIONS PASSED WITH 0 CONSOLE ERRORS!');
}

testVercelDist().catch(e => {
  console.error(e);
  process.exit(1);
});
