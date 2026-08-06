import { test, expect } from "@playwright/test";

// Target viewports from the requirements
const VIEWPORTS = [
  { name: "320px", width: 320, height: 700 },
  { name: "360px", width: 360, height: 700 },
  { name: "375px", width: 375, height: 700 },
  { name: "390px", width: 390, height: 780 },
  { name: "412px", width: 412, height: 800 },
  { name: "414px", width: 414, height: 800 },
  { name: "430px", width: 430, height: 800 },
  { name: "480px", width: 480, height: 800 },
  { name: "768px", width: 768, height: 900 },
  { name: "1024px", width: 1024, height: 900 },
  { name: "1280px", width: 1280, height: 900 },
  { name: "1440px", width: 1440, height: 900 },
  { name: "1920px", width: 1920, height: 1000 },
];

const PAGES = [
  { path: "/", name: "Home" },
  { path: "/Products", name: "Products" },
  { path: "/Consult", name: "Consult" },
  { path: "/Labtest", name: "Labtest" },
  { path: "/Contact", name: "Contact" },
  { path: "/Login", name: "Login" },
  { path: "/Cart", name: "Cart" },
  { path: "/Profile", name: "Profile" },
];

async function checkHorizontalOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      hasOverflow: doc.scrollWidth > doc.clientWidth + 1,
    };
  });
}

async function findOverflowSources(page) {
  return page.evaluate(() => {
    const results = [];
    const vw = document.documentElement.clientWidth;
    const all = document.querySelectorAll("*");
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (!rect) continue;
      if (rect.right > vw + 2 && rect.left < vw) {
        const style = window.getComputedStyle(el);
        if (style.position === "fixed") continue;
        results.push({
          tag: el.tagName,
          cls: (el.className && el.className.toString().slice(0, 80)) || "",
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
        if (results.length > 8) break;
      }
    }
    return results;
  });
}

for (const vp of VIEWPORTS) {
  test.describe(`Viewport ${vp.name}`, () => {
    for (const pageDef of PAGES) {
      test(`${pageDef.name} - no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(pageDef.path, { waitUntil: "domcontentloaded" }).catch(() => {});
        await page.waitForTimeout(1800);

        const overflow = await checkHorizontalOverflow(page);
        if (overflow.hasOverflow) {
          const sources = await findOverflowSources(page);
          console.log(`\n[OVERFLOW] ${pageDef.name}@${vp.name} scrollW=${overflow.scrollWidth} clientW=${overflow.clientWidth}`);
          console.log("  sources:", JSON.stringify(sources, null, 2));
        }
        expect(overflow.hasOverflow, `No overflow on ${pageDef.name}@${vp.name}`).toBe(false);
      });
    }
  });
}
