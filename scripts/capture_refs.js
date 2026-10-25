const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const refsDir = path.resolve(__dirname, '../content/refs');
fs.mkdirSync(refsDir, { recursive: true });

const sites = [
  { name: 'linear', url: 'https://linear.app' },
  { name: 'resend', url: 'https://resend.com' },
  { name: 'rauno', url: 'https://rauno.me' },
  { name: 'paco', url: 'https://paco.me' },
  { name: 'emil', url: 'https://emilkowal.ski' },
  { name: 'geist', url: 'https://vercel.com/geist' },
  { name: 'stripe-press', url: 'https://stripe.com/newsroom' },
  { name: 'chronicle', url: 'https://chroniclehq.com' }
];

async function captureRefs() {
  console.log('Capturing 8 reference screenshots with Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const s of sites) {
    try {
      console.log(`Capturing ${s.name} (${s.url})...`);
      await page.goto(s.url, { timeout: 15000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      const outPath = path.join(refsDir, `${s.name}.png`);
      await page.screenshot({ path: outPath });
      console.log(`Saved: ${outPath}`);
    } catch (err) {
      console.warn(`Could not capture ${s.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Done capturing references.');
}

captureRefs().catch(console.error);
