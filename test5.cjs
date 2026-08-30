const { chromium } = require('playwright');
(async () => {
    const b = await chromium.launch({headless: true});
    const p = await b.newPage();
    p.on('console', msg => {
        if(msg.text().includes('DEBUG-')) console.log('LOG:', msg.text());
    });
    await p.goto('http://localhost:5173/');
    await p.waitForTimeout(2000);
    
    // 1. Find a pending job
    const rect = await p.evaluate(() => {
        const el = document.querySelector('#pending-jobs-dock > div > div:first-child');
        if(!el) return null;
        const box = el.getBoundingClientRect();
        return { x: box.x + box.width/2, y: box.y + box.height/2 };
    });
    console.log('Pending Job:', rect);
    
    const targetCell = await p.evaluate(() => {
        const el = document.querySelector('.w-\\\\[180px\\\\] > div.h-8');
        if(!el) return null;
        const b = el.getBoundingClientRect();
        return { x: b.x + b.width/2, y: b.y + b.height/2 };
    });
    console.log('Target Cell:', targetCell);
    
    if(rect && targetCell) {
        await p.mouse.move(rect.x, rect.y);
        await p.mouse.down();
        await p.mouse.move(targetCell.x, targetCell.y, {steps: 10});
        await p.waitForTimeout(500);
        await p.mouse.up();
    }
    
    await p.waitForTimeout(1000);
    
    // 2. Find it on the board
    const cardRect = await p.evaluate(() => {
        const el = Array.from(document.querySelectorAll('.group\\\\/card')).find(e => e.textContent.includes('E.F.C') || e.textContent.includes('三井') || e.textContent.includes('不二家') || e.textContent.includes('シルバー') || e.textContent.includes('英海') || e.textContent.includes('ジェーシー') || e.textContent.includes('ﾀｷﾛﾝｼｰｱｲ'));
        if (!el) return null;
        const b = el.getBoundingClientRect();
        // Drag handle is on the left
        return { x: b.x + 5, y: b.y + 5 };
    });
    console.log('Board Job:', cardRect);
    
    if (cardRect) {
        // Drag it down
        await p.mouse.move(cardRect.x, cardRect.y);
        await p.mouse.down();
        await p.mouse.move(cardRect.x, cardRect.y + 200, {steps: 10});
        await p.waitForTimeout(500);
        await p.mouse.up();
    }
    
    await p.waitForTimeout(1000);
    await b.close();
})();
