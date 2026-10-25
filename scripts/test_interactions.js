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

async function runInteractiveTests() {
  server.listen(PORT);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[Console Error] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    errors.push(`[Page Error] ${err.message}`);
  });

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. Click Audio Toggle
  console.log('Testing Audio Toggle...');
  await page.click('#sound-toggle-btn');
  await page.waitForTimeout(300);

  // 2. Click Horn Button
  console.log('Testing Tata Horn Button...');
  await page.click('#play-horn-btn');
  await page.waitForTimeout(300);

  // 3. Click Throttle Rev Button
  console.log('Testing Diesel Rev Button...');
  await page.click('#play-rev-btn');
  await page.waitForTimeout(300);

  // 4. Test Mode Switcher: 3D Gyroscope
  console.log('Testing Mode Switch: 3D Gyroscope...');
  await page.click('button[data-mode="gyro"]');
  await page.waitForTimeout(600);

  // 5. Test Mode Switcher: Manifesto
  console.log('Testing Mode Switch: Manifesto...');
  await page.click('button[data-mode="manifesto"]');
  await page.waitForTimeout(600);

  // 6. Test Mode Switcher: Panorama World
  console.log('Testing Mode Switch: Panorama World...');
  await page.click('button[data-mode="panorama"]');
  await page.waitForTimeout(600);

  // 7. Click station jump pills
  console.log('Testing Station Jump Pills...');
  await page.click('.station-jump-btn >> text=Nepo Baby');
  await page.waitForTimeout(300);
  await page.click('.station-jump-btn >> text=Neural Playground');
  await page.waitForTimeout(300);

  // 8. Test Search Filter
  console.log('Testing Search Filter...');
  await page.fill('#project-search', 'neural');
  await page.waitForTimeout(300);
  const filteredCount = await page.locator('.project-card').count();
  console.log(`Filtered card count for 'neural': ${filteredCount}`);

  await page.fill('#project-search', '');
  await page.waitForTimeout(300);

  // 9. Take rich screenshot of homepage
  await page.screenshot({ path: path.join(__dirname, '../public/homepage_studio_v2.png'), fullPage: false });
  console.log('Saved studio screenshot to public/homepage_studio_v2.png');

  await browser.close();
  server.close();

  if (errors.length > 0) {
    console.error('Interaction Errors:');
    errors.forEach(e => console.error(e));
    process.exit(1);
  }

  console.log('ALL INTERACTION TESTS PASSED WITH ZERO CONSOLE ERRORS!');
}

runInteractiveTests().catch(e => {
  console.error(e);
  process.exit(1);
});
