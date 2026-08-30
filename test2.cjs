const { chromium } = require('playwright');
(async () => {
    const b = await chromium.launch({headless: true});
    const p = await b.newPage();
    p.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await p.goto('http://localhost:5173/');
    await p.waitForTimeout(2000);
    await p.click('text=前日へ');
    await p.waitForTimeout(1000);
    
    // 1. Find a pending job
    const rect = await p.evaluate(() => {
        const el = document.querySelector('#pending-jobs-dock > div > div:first-child');
        if(!el) return null;
        const box = el.getBoundingClientRect();
        return { x: box.x + box.width/2, y: box.y + box.height/2 };
    });
    console.log('Pending Job:', rect);
    
    if(rect) {
        // Drag it to the board (e.g. at 500, 300)
        await p.mouse.move(rect.x, rect.y);
        await p.mouse.down();
        await p.mouse.move(500, 300, {steps: 10});
        await p.waitForTimeout(500);
        await p.mouse.up();
    }
    
    await p.waitForTimeout(1000);
    
    // 2. Find it on the board
    const cardRect = await p.evaluate(() => {
        const el = Array.from(document.querySelectorAll('.group\\\\/card')).find(e => e.textContent.includes('E.F.C') || e.textContent.includes('三井') || e.textContent.includes('不二家') || e.textContent.includes('シルバー') || e.textContent.includes('英海') || e.textContent.includes('ジェーシー'));
        if (!el) return null;
        const b = el.getBoundingClientRect();
        // Drag handle is on the left
        return { x: b.x + 10, y: b.y + 10 };
    });
    console.log('Board Job:', cardRect);
    
    if (cardRect) {
        // Drag it down
        await p.mouse.move(cardRect.x, cardRect.y);
        await p.mouse.down();
        await p.mouse.move(cardRect.x, cardRect.y + 100, {steps: 10});
        await p.waitForTimeout(500);
        await p.mouse.up();
    }
    
    await p.waitForTimeout(1000);
    await b.close();
})();
