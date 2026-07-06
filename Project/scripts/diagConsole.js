import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  try {
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    const body = await page.content();
    console.log('---CONSOLE-ERRORS---');
    console.log(errors.join('\n') || '(no console errors)');
    console.log('---BODY-SNIPPET---');
    console.log(body.slice(0,2000));
    const overlay = await page.$('vite-error-overlay');
    if (overlay) {
      const txt = await overlay.evaluate((n) => n.innerText).catch(() => '');
      console.log('---VITE-OVERLAY---');
      console.log(txt.slice(0,2000));
    }
  } catch (e) {
    console.error('NAV ERROR:', e.message);
  } finally {
    await browser.close();
  }
})();
