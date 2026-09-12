import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4173/docs/animations';
const out = process.argv[3] || 'qa-screenshots/animations-wall-final.png';
const fullPage = (process.argv[4] || 'true') === 'true';
const viewportH = parseInt(process.argv[5] || '3200', 10);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 }, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
// give the animations a moment to settle into a representative frame
await page.waitForTimeout(900);
await page.setViewportSize({ width: 1280, height: viewportH });
await page.waitForTimeout(300);
await page.screenshot({ path: out, fullPage });
await browser.close();
console.log('saved', out);
