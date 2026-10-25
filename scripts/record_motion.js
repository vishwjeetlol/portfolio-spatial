const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const projectDir = path.resolve(__dirname, '../site/projects/motion-studies');
const videoDir = path.join(projectDir, 'recordings');
fs.mkdirSync(videoDir, { recursive: true });

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(projectDir, reqPath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end();
      return;
    }
    const ext = path.extname(filePath);
    let ct = 'text/html';
    if (ext === '.js') ct = 'application/javascript';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

async function record() {
  await new Promise(res => server.listen(5199, res));
  console.log('Recording motion study on port 5199...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: videoDir,
      size: { width: 1200, height: 800 }
    }
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5199/');

  // Record Study 1 for 2.5s
  await page.waitForTimeout(2500);

  // Switch to Study 2 for 2.5s
  await page.click('button[data-study="1"]');
  await page.waitForTimeout(2500);

  // Switch to Study 3 for 2.5s
  await page.click('button[data-study="2"]');
  await page.waitForTimeout(2500);

  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();
  server.close();

  if (video) {
    const videoPath = await video.path();
    const finalMp4 = path.join(projectDir, 'motion-study.mp4');

    // Convert to standard MP4 with ffmpeg
    try {
      execSync(`/opt/homebrew/bin/ffmpeg -y -i "${videoPath}" -c:v libx264 -pix_fmt yuv420p "${finalMp4}"`, { stdio: 'inherit' });
      console.log(`Video recorded and converted to MP4: ${finalMp4}`);
      // Clean up raw recording
      fs.unlinkSync(videoPath);
      fs.rmdirSync(videoDir);
    } catch (err) {
      console.warn('ffmpeg conversion warning:', err);
    }
  }
}

record().catch(console.error);
