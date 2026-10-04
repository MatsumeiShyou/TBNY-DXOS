const fs = require('fs');
let c = fs.readFileSync('src/hooks/useDataStore.ts', 'utf8');

c = c.replace(
  /setPendingJobs\(prev => prev\.filter\(j => validIds\.has\(j\.originalCustomerId \|\| ''\)\)\.map\(syncJob\)\);/,
  "setPendingJobs(prev => prev.map(syncJob));"
);

c = c.replace(
  /spotJobs: \(exp\.spotJobs \|\| \[\]\)\.filter\(j => validIds\.has\(j\.originalCustomerId \|\| ''\)\)\.map\(syncJob\),/,
  "spotJobs: (exp.spotJobs || []).map(syncJob),"
);

c = c.replace(
  /cancellations: \(exp\.cancellations \|\| \[\]\)\.filter\(id => validIds\.has\(id\)\),/,
  "cancellations: (exp.cancellations || []),"
);

c = c.replace(
  /reschedules: \(exp\.reschedules \|\| \[\]\)\.filter\(j => validIds\.has\(j\.originalCustomerId \|\| ''\)\)\.map\(syncJob\)/,
  "reschedules: (exp.reschedules || []).map(syncJob)"
);

fs.writeFileSync('src/hooks/useDataStore.ts', c);
console.log('patched validIds');
