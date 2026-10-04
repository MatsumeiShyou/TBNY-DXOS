const { chromium } = require('playwright');
(async () => {
    const b = await chromium.launch({headless: true});
    const p = await b.newPage();
    p.on('console', msg => {
        if(msg.text().includes('DEBUG-') || msg.text().includes('ERROR')) console.log('LOG:', msg.text());
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
        // Find a cell in the 12:00 range (e.g. 24 cells down = index 24)
        const cells = Array.from(document.querySelectorAll('.h-8.relative'));
        if(cells.length === 0) return null;
        const el = cells[Math.min(24, cells.length - 1)]; 
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
        const els = Array.from(document.querySelectorAll('div')).filter(e => {
            const className = e.className || '';
            return typeof className === 'string' && className.includes('group/card');
        });
        if (els.length === 0) return null;
        const el = els[0];
        const b = el.getBoundingClientRect();
        return { x: b.x + 10, y: b.y + 10 };
    });
    console.log('Board Job:', cardRect);
    
    if (cardRect) {
        await p.mouse.move(cardRect.x, cardRect.y);
        await p.mouse.down();
        await p.mouse.move(cardRect.x, cardRect.y + 100, {steps: 10});
        await p.waitForTimeout(500);
        await p.mouse.up();
    }
    
    await p.waitForTimeout(1000);
    await b.close();
})();
