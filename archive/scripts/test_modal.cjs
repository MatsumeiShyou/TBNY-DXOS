const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // URL to the app
  await page.goto('http://localhost:5174/');
  
  // Wait for the modal or anything to load. Actually we need to open the modal first.
  // Wait for "顧客マスタ" button or similar. Let's see if we can find it.
  
  // For now let's just log if there are console errors on load.
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await new Promise(r => setTimeout(r, 3000));
  
  await browser.close();
})();
