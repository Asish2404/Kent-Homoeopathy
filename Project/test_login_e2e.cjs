const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  let loginUrl = null;
  let loginStatus = null;
  let loginBody = null;
  let adminRequests = [];
  const errors = [];

  page.on('request', req => {
    const url = req.url();
    if (url.includes('/auth/login')) {
      loginUrl = url;
      console.log('REQ:', req.method(), url);
      console.log('POST BODY:', req.postData());
    }
    if (url.includes('/dashboard') || url.includes('/admin')) {
      adminRequests.push({ url, method: req.method() });
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/auth/login')) {
      loginStatus = res.status();
      loginBody = await res.text();
      console.log('RES:', res.status(), url);
      console.log('RES BODY:', loginBody);
    }
  });

  page.on('pageerror', e => errors.push('PAGE: ' + e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text());
  });

  console.log('1. Navigate to /login');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 15000 });
  console.log('   Title:', await page.title());
  await page.waitForTimeout(1000);

  console.log('2. Fill credentials');
  await page.locator('input[placeholder="Email Address"]').waitFor({ timeout: 5000 });
  await page.locator('input[placeholder="Email Address"]').fill('admin@drkent.com');
  await page.locator('input[placeholder="Password"]').fill('Admin@123');

  console.log('3. Click Login');
  await page.locator('button:has-text("Login")').click();
  await page.waitForTimeout(5000);

  console.log('\n=== RESULTS ===');
  console.log('Login Request URL:', loginUrl);
  console.log('Login Response Status:', loginStatus);
  console.log('Login Response Body:', loginBody);

  const currentUrl = page.url();
  console.log('Final URL:', currentUrl);

  const ls = await page.evaluate(() => ({
    authToken: localStorage.getItem('authToken') ? 'SET (' + localStorage.getItem('authToken').substring(0,30) + '...)' : 'NOT SET',
    role: localStorage.getItem('role'),
    isLoggedIn: localStorage.getItem('isLoggedIn'),
    userName: localStorage.getItem('userName'),
    user: localStorage.getItem('user') ? 'SET' : 'NOT SET'
  }));
  console.log('localStorage:', JSON.stringify(ls, null, 2));

  console.log('Admin requests:', adminRequests.length ? adminRequests : 'None');
  console.log('Errors:', errors.length ? errors : 'None');

  if (currentUrl.includes('/admin')) {
    const content = await page.content();
    console.log('Dashboard contains Healthcare Insights:', content.includes('Healthcare Insights'));
    console.log('Dashboard contains KPI cards:', (content.match(/KpiCard/g) || []).length > 0);
  }

  await browser.close();
  console.log('\nTEST COMPLETE');
})().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
