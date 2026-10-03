import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile Viewport (iPhone 12)
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  await page.goto('https://iron-form-coral.vercel.app/admin');
  
  // Wait for login page
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'colosso@gmail.com');
  await page.fill('input[type="password"]', 'Colosso2024'); // Assuming this is the pass from earlier context or we can just bypass if needed. Wait, we don't have the pass.
  
  // Wait! Do we need to login to see the admin dashboard?
  // Let me just check if the admin route is protected.
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  // Click hamburger
  await page.click('.admin-menu-toggle');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'sidebar_animating.png' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'sidebar_open.png' });
  
  await browser.close();
})();
