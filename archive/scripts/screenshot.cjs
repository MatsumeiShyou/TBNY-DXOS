const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  // click next day button (the > chevron)
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerHTML, btn);
    if (text.includes('lucide-chevron-right')) {
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'C:\\Users\\shiyo\\.gemini\\antigravity\\brain\\a23e56fb-4b14-4e77-94b4-eec88787a70d\\scratch\\screenshot_mon.png' });
  await browser.close();
})();
