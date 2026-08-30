const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Go to next day (Monday)
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerHTML, btn);
    if (text.includes('lucide-chevron-right')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('On Monday...');

  // Find the first job card in pending list
  const pendingJobs = await page.$$('.cursor-grab');
  if (pendingJobs.length > 0) {
    const job = pendingJobs[0];
    const jobBox = await job.boundingBox();
    console.log('Job found at', jobBox);
    
    // Mouse down on job
    await page.mouse.move(jobBox.x + 10, jobBox.y + 10);
    await page.mouse.down();
    
    // Drag to Column A (approx x: 100, y: 300)
    await page.mouse.move(200, 300, { steps: 10 });
    await page.mouse.up();
    console.log('Dropped job onto calendar');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'C:\\Users\\shiyo\\.gemini\\antigravity\\brain\\a23e56fb-4b14-4e77-94b4-eec88787a70d\\scratch\\screenshot_dnd1.png' });
    
    // Find the job on the calendar
    const calJobs = await page.$$('.cursor-grab');
    // It should now be in the calendar area
    for (const cj of calJobs) {
      const box = await cj.boundingBox();
      if (box.x < 1000) { // Calendar is on the left
        console.log('Dragging job inside calendar...');
        await page.mouse.move(box.x + 10, box.y + 10);
        await page.mouse.down();
        // Move to Column B
        await page.mouse.move(box.x + 200, box.y + 100, { steps: 10 });
        await page.mouse.up();
        console.log('Dropped job within calendar');
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'C:\\Users\\shiyo\\.gemini\\antigravity\\brain\\a23e56fb-4b14-4e77-94b4-eec88787a70d\\scratch\\screenshot_dnd2.png' });
    
  } else {
    console.log('No pending jobs found');
  }

  await browser.close();
})();
