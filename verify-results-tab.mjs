import { chromium } from 'playwright';

const url = 'http://127.0.0.1:5173/';

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(String(err)));

await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('text=Results Calendar', { timeout: 30000 });
await page.screenshot({ path: 'verify-1-dashboard.png', fullPage: false });

await page.click('text=Results Calendar');
await page.waitForSelector('text=Results Calendar', { timeout: 10000 });
await page.waitForTimeout(500);
await page.screenshot({ path: 'verify-2-results-tab-loading.png', fullPage: true });

// wait for either data, empty state, or error to settle
await page.waitForFunction(
  () => !document.body.innerText.includes('Loading results calendar'),
  { timeout: 60000 },
);
await page.screenshot({ path: 'verify-3-results-tab-upcoming.png', fullPage: true });

// toggle to "Recently Announced"
await page.click('text=Recently Announced');
await page.waitForFunction(
  () => !document.body.innerText.includes('Loading results calendar'),
  { timeout: 60000 },
);
await page.screenshot({ path: 'verify-4-results-tab-announced.png', fullPage: true });

console.log('CONSOLE_ERRORS:', JSON.stringify(consoleErrors));

await browser.close();
