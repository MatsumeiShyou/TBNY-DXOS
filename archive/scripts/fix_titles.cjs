const fs = require('fs');

// 1. Fix TemplateModal.tsx
let tmpl = fs.readFileSync('src/components/TemplateModal.tsx', 'utf8');
tmpl = tmpl.replace(
  /customerStatusMap\.set\(c\.id, \{ isSuspended: !!c\.isInvalid, isDeleted: !!c\.isDeleted \}\);/,
  "customerStatusMap.set(c.id, { isSuspended: !!c.isInvalid, isDeleted: !!c.isDeleted, name: c.name });"
);
tmpl = tmpl.replace(
  /const cleanTitle = String\(job\.title \|\| ''\)\.replace\(\/\^??\(íœÏ\|’â~’†\)\\s\*\/\, ''\);\s*acc\.push\(\{ \.\.\.job, title: \??íœÏ \$\{cleanTitle\}\, isDeleted: true, isSuspended: false \}\);/,
  \const cleanTitle = String(job.title || '').replace(/^??(íœÏ|’â~’†)\\s*/, '');
            const displayName = customerStatus && customerStatus.name ? customerStatus.name : cleanTitle;
            acc.push({ ...job, title: \\\??íœÏ \\\\, isDeleted: true, isSuspended: false });\
);
tmpl = tmpl.replace(
  /const cleanTitle = String\(job\.title \|\| ''\)\.replace\(\/\^??\(íœÏ\|’â~’†\)\\s\*\/\, ''\);\s*acc\.push\(\{ \.\.\.job, title: \??’â~’† \$\{cleanTitle\}\, isSuspended: true, isDeleted: false \}\);/,
  \const cleanTitle = String(job.title || '').replace(/^??(íœÏ|’â~’†)\\s*/, '');
            const displayName = customerStatus && customerStatus.name ? customerStatus.name : cleanTitle;
            acc.push({ ...job, title: \\\??’â~’† \\\\, isSuspended: true, isDeleted: false });\
);
fs.writeFileSync('src/components/TemplateModal.tsx', tmpl);

// 2. Fix useDataStore.ts (refreshJob)
let store = fs.readFileSync('src/hooks/useDataStore.ts', 'utf8');
store = store.replace(
  /const cleanTitle = String\(j\.title \|\| ''\)\.replace\(\/\^??\(íœÏ\|’â~’†\)\\s\*\/\, ''\);\s*return \{\s*\.\.\.j,\s*title: \??íœÏ \$\{cleanTitle\}\,/,
  \const cleanTitle = String(j.title || '').replace(/^??(íœÏ|’â~’†)\\s*/, '');
              const displayName = customer ? customer.name : cleanTitle;
              return {
                ...j,
                title: \\\??íœÏ \\\\,\
);
fs.writeFileSync('src/hooks/useDataStore.ts', store);
console.log('Fixed titles');
