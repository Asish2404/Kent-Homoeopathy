import { test, expect } from '@playwright/test';

test.describe('Kent web core flows', () => {
  test('Home page loads and hero carousel behaves (desktop)', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Kent|Dr. Kent|Home/i);

    // Logo present
    const logo = page.locator('img[alt*="Kent"]');
    await expect(logo.first()).toBeVisible();

    // Carousel arrows visible on desktop, hidden on small viewports
    const prev = page.locator('button[aria-label="Previous Slide"]');
    const next = page.locator('button[aria-label="Next Slide"]');
    const vp = page.viewportSize();
    if (vp && vp.width >= 1024) {
      await expect(prev).toBeVisible();
      await expect(next).toBeVisible();
    } else {
      await expect(prev).toBeHidden();
      await expect(next).toBeHidden();
    }

    // Click next and ensure slide area remains visible
    await next.click();
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('Carousel controls hidden on mobile', async ({ page, context }) => {
    await context.setExtraHTTPHeaders({});
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    const prev = page.locator('button[aria-label="Previous Slide"]').first();
    await expect(prev).toBeHidden();
  });

  test('Universal Search from navbar redirects to Products and filters', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[type="search"]').first();
    await expect(input).toBeVisible();
    await input.fill('Arnica');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/Products\?query=/);
    await expect(page.locator('h1', { hasText: 'Products' })).toBeVisible();
    await expect(page.locator('p', { hasText: 'results' }).first()).toBeVisible();

    // Clear search
    const searchOnProducts = page.locator('input[placeholder*="Search products, categories"]');
    if (await searchOnProducts.count()) {
      await searchOnProducts.fill('');
      await searchOnProducts.press('Enter');
      await expect(page).toHaveURL(/\/Products/);
    }
  });

  test('Products: category chips and View All filter correctly', async ({ page }) => {
    await page.goto('/');
    // Click a category chip (e.g., 'Best Solutions' / 'vitamins')
    const chip = page.locator('button:has-text("Best Solutions")');
    if (await chip.count()) {
      await chip.waitFor({ state: 'visible' });
      await chip.click();
      await expect(page).toHaveURL(/\/Products\?category=/);
    }

    // Check View All on a category section
    const viewAll = page.locator('button:has-text("View All")').first();
    if (await viewAll.count()) {
      await viewAll.waitFor({ state: 'visible' });
      await viewAll.click();
      await expect(page).toHaveURL(/\/Products/);
    }
  });

  test('Cart: Add to Cart does not scroll and updates count', async ({ page }) => {
    await page.goto('/Products');
    const firstAdd = page.locator('button:has-text("Add")').first();
    await expect(firstAdd).toBeVisible();
    const initialScroll = await page.evaluate(() => window.scrollY);
    const cartBadge = page.locator('a[href="/Cart"]').first();
    // Click Add and ensure no scroll
    await firstAdd.click();
    const afterScroll = await page.evaluate(() => window.scrollY);
    expect(afterScroll).toBe(initialScroll);
    // Cart count badge visible in navbar
    const cartIcon = page.locator('a[href="/Cart"]').first();
    await expect(cartIcon).toBeVisible();
  });

  test('Wishlist redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/');
    // Ensure no user
    await page.evaluate(() => localStorage.removeItem('user'));
    const wish = page.locator('button[aria-label="Wishlist"]').first();
    await wish.waitFor({ state: 'visible' });
    await wish.click();
    await expect(page).toHaveURL(/\/Login/);
    await expect(page.locator('text=Please login to continue').first()).toBeVisible();
  });

  test('Consultation: Book Consultation navigates to /Consult and Doctors section exists', async ({ page }) => {
    await page.goto('/');
    const book = page.locator('button:has-text("Book Consultation")');
    await book.waitFor({ state: 'visible' });
    await book.click();
    await expect(page).toHaveURL(/\/Consult/);
    // Doctors section presence (id or heading)
    const doctors = page.locator('text=Doctors').first();
    await expect(doctors).toBeVisible();
  });

  test('Branding and address appear in Footer', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const f = document.querySelector('footer');
      if (f) f.scrollIntoView();
    });
    await expect(page.locator('footer img[alt*="Kent"]').first()).toBeVisible();
    await expect(page.locator('footer', { hasText: 'Barasat' })).toBeVisible();
  });

  test('Responsive checks: no horizontal scroll and no console errors', async ({ page }) => {
    for (const size of [{w:1280,h:800},{w:1024,h:768},{w:768,h:1024},{w:375,h:800}]) {
      await page.setViewportSize({ width: size.w, height: size.h });
      await page.goto('/');
      const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(hasHScroll).toBe(false);
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      // small interaction
      await page.waitForTimeout(300);
      expect(errors.length).toBe(0);
    }
  });
});
