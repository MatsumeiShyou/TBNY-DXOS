import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);
  
  // 開く
  await page.click('text=顧客マスタ管理');
  await page.waitForTimeout(1000);
  
  // スクリーンショット
  await page.screenshot({ path: 'C:/Users/shiyo/.gemini/antigravity/brain/891d11df-7a99-40e7-8147-0e90142d5e7f/scratch/step1_modal.png' });
  
  // リストの最初の顧客をクリック
  const firstCustomer = await page.locator('.flex-1.overflow-y-auto > div').first();
  if (firstCustomer) {
    await firstCustomer.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/shiyo/.gemini/antigravity/brain/891d11df-7a99-40e7-8147-0e90142d5e7f/scratch/step2_clicked.png' });
  } else {
    console.log("No customer found");
  }
  
  await browser.close();
})();
