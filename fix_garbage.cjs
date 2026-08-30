const fs = require('fs');

let store = fs.readFileSync('src/hooks/useDataStore.ts', 'utf8');

store = store.replace(
  /setJobs\(\(dailyState\.jobs \|\| \[\]\)\.map\(refreshJob\)\);/,
  "setJobs((dailyState.jobs || []).filter(j => customerMap.has(j.originalCustomerId)).map(refreshJob));"
);
store = store.replace(
  /setPendingJobs\(\(dailyState\.pendingJobs \|\| \[\]\)\.map\(refreshJob\)\);/,
  "setPendingJobs((dailyState.pendingJobs || []).filter(j => customerMap.has(j.originalCustomerId)).map(refreshJob));"
);

store = store.replace(
  /setJobs\(prev => prev\.map\(syncJob\)\);/,
  "setJobs(prev => prev.filter(j => customerMap.has(j.originalCustomerId)).map(syncJob));"
);
store = store.replace(
  /let newPending = prev\.map\(syncJob\);/,
  "let newPending = prev.filter(j => customerMap.has(j.originalCustomerId)).map(syncJob);"
);
store = store.replace(
  /spotJobs: \(exp\.spotJobs \|\| \[\]\)\.map\(syncJob\),/,
  "spotJobs: (exp.spotJobs || []).filter(j => customerMap.has(j.originalCustomerId)).map(syncJob),"
);
store = store.replace(
  /reschedules: \(exp\.reschedules \|\| \[\]\)\.map\(syncJob\)/,
  "reschedules: (exp.reschedules || []).filter(j => customerMap.has(j.originalCustomerId)).map(syncJob)"
);

fs.writeFileSync('src/hooks/useDataStore.ts', store);
console.log('Fixed garbage collection');
