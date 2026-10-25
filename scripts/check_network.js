const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const distDir = path.resolve(__dirname, '../site/dist');

// Simple static file server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.json') contentType = 'application/json';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.svg') contentType = 'image/svg+xml';
    if (ext === '.glb') contentType = 'model/gltf-binary';
    if (ext === '.pdf') contentType = 'application/pdf';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

async function testNetwork() {
  await new Promise(resolve => server.listen(4173, resolve));
  console.log('Static preview server running on port 4173...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const thirdPartyRequests = [];

  page.on('request', req => {
    const url = req.url();
    if (!url.startsWith('http://localhost:4173')) {
      thirdPartyRequests.push(url);
    }
  });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await browser.close();
  server.close();

  if (thirdPartyRequests.length > 0) {
    console.error('Third party network requests detected:', thirdPartyRequests);
    process.exit(1);
  } else {
    console.log('Network check PASSED: Zero third-party network requests made.');
  }
}

testNetwork().catch(err => {
  console.error('Network check error:', err);
  if (server) server.close();
  process.exit(1);
});
