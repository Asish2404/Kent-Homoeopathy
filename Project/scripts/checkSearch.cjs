const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');
  const info = await page.evaluate(() => {
    const el = document.querySelector('input[type="search"]');
    if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return {
      found: true,
      outerHTML: el.outerHTML.slice(0,200),
      width: r.width,
      height: r.height,
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      clientWidth: el.clientWidth,
      offsetParent: !!el.offsetParent
    };
  });
  console.log(info);
  await browser.close();
})();