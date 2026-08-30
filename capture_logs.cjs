const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR] ${err.toString()}`);
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Login
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log('Typing email...');
      await emailInput.type('admin@example.com');
    }
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      console.log('Typing password...');
      await passwordInput.type('admin');
      const loginButton = await page.$('button[type="submit"]');
      if (loginButton) {
        console.log('Clicking login...');
        await loginButton.click();
      }
    }
    
    console.log('Waiting 5s for React to render...');
    await new Promise(r => setTimeout(r, 5000));
  } catch (e) {
    console.error('Error loading page:', e);
  } finally {
    await browser.close();
  }
})();
