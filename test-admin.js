import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Listen to console and network
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log("Navigating to admin...");
  await page.goto('http://localhost:5173/admin/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.fill('#pw-input', 'brownbunny');
  console.log("Evaluating doLogin() explicitly...");
  await page.evaluate(() => doLogin());

  // Wait for the admin shell to be visible
  try {
    console.log("Waiting for #admin-shell...");
    await page.waitForSelector('#admin-shell', { state: 'visible', timeout: 5000 });
    console.log("Admin shell loaded!");
  } catch (e) {
    console.error("FAILED TO LOAD ADMIN SHELL");
    await browser.close();
    process.exit(1);
  }

  // Wait, so tabs can fetch config
  await page.waitForTimeout(1000);

  // Click settings
  console.log("Clicking settings...");
  await page.click('button[data-section="settings"]');
  await page.waitForTimeout(500);

  // Change Site name
  console.log("Changing site name...");
  await page.fill('#settings-sitename', 'Josie Tait is the awesomest');
  await page.click('button:has-text("Save Global Settings ✨")');
  await page.waitForTimeout(1000);

  console.log("Navigating to frontend React app...");
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const headerContent = await page.innerText('header a.font-display');
  console.log("React Site Header Extracted: ", headerContent);

  if (headerContent.includes("Josie Tait is the awesomest")) {
    console.log("✅ SUCCESS: Dynamic Config Pipeline works end to end!");
  } else {
    console.error("❌ FAILED: Header did not reflect new Settings state.");
  }

  await browser.close();
  process.exit(0);
})();
