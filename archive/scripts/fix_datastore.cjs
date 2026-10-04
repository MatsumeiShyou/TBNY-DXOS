const fs = require('fs');
let c = fs.readFileSync('src/hooks/useDataStore.ts', 'utf8');

c = c.replace(
  /storageService\.saveDailyState\(dateStr, \{ drivers, jobs, pendingJobs, splits \}\);/,
  \const validJobs = jobs.filter(j => !j.isDeleted && !j.isSuspended);
      const validPending = pendingJobs.filter(j => !j.isDeleted && !j.isSuspended);
      storageService.saveDailyState(dateStr, { drivers, jobs: validJobs, pendingJobs: validPending, splits });\
);

fs.writeFileSync('src/hooks/useDataStore.ts', c);
console.log('useDataStore.ts updated');
