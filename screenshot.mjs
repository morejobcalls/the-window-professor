import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const dir = './temporary screenshots';

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let n = 1;
while (fs.existsSync(path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`))) n++;
const filename = path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`);

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
// Force all fade/reveal animations visible for full-page screenshots
await page.evaluate(() => {
  document.querySelectorAll('.fade-up').forEach(el => { el.classList.add('in'); el.classList.add('visible'); });
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
});
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: filename, fullPage: true });
await browser.close();
console.log(`Saved: ${filename}`);
