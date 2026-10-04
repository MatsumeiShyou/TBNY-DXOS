const fs = require('fs');

// 1. TemplateModal.tsx
let tmpl = fs.readFileSync('src/components/TemplateModal.tsx', 'utf8');
// Remove title string mutation
tmpl = tmpl.replace(
  /const cleanTitle = String\(job\.title \|\| ''\)\.replace\(\/\^??\(íœÏ\|’â~’†\)\\s\*\/\, ''\);\s*const displayName = customerStatus\.name \|\| cleanTitle;\s*acc\.push\(\{ \.\.\.job, title: \??’â~’† \$\{displayName\}\, isSuspended: true, isDeleted: false \}\);/g,
  \const cleanTitle = String(job.title || '').replace(/^??(íœÏ|’â~’†)\\s*/, '');
            const displayName = customerStatus.name || cleanTitle;
            acc.push({ ...job, title: displayName, isSuspended: true, isDeleted: false });\
);
tmpl = tmpl.replace(
  /const cleanTitle = String\(job\.title \|\| ''\)\.replace\(\/\^??\(íœÏ\|’â~’†\)\\s\*\/\, ''\);\s*acc\.push\(\{ \.\.\.job, title: \??íœÏ \$\{customerStatus\.name\}\, isDeleted: true, isSuspended: false \}\);/g,
  \const cleanTitle = String(job.title || '').replace(/^??(íœÏ|’â~’†)\\s*/, '');
          acc.push({ ...job, title: customerStatus.name, isDeleted: true, isSuspended: false });\
);
fs.writeFileSync('src/components/TemplateModal.tsx', tmpl);

// 2. useDataStore.ts
let store = fs.readFileSync('src/hooks/useDataStore.ts', 'utf8');
store = store.replace(
  /const cleanTitle = String\(j\.title \|\| ''\)\.replace\(\/\^??\(íœÏ\|’â~’†\)\\s\*\/\, ''\);\s*const displayName = customer \? customer\.name : cleanTitle;\s*return \{\s*\.\.\.j,\s*title: \??íœÏ \$\{displayName\}\,/g,
  \const cleanTitle = String(j.title || '').replace(/^??(íœÏ|’â~’†)\\s*/, '');
              const displayName = customer ? customer.name : cleanTitle;
              return {
                ...j,
                title: displayName,\
);
store = store.replace(
  /return \{\s*\.\.\.j,\s*title: \??’â~’† \$\{customer\.name\}\,/g,
  \eturn {
                  ...j,
                  title: customer.name,\
);
store = store.replace(
  /newTitle = \??íœÏ \$\{String\(newTitle\)\.replace\(\/\^??\(íœÏ\|’â~’†\)\\s\*\/\, ''\)\}\;/g,
  \
ewTitle = String(newTitle).replace(/^??(íœÏ|’â~’†)\\s*/, '');\
);
store = store.replace(
  /newTitle = \??’â~’† \$\{String\(newTitle\)\.replace\(\/\^??\(íœÏ\|’â~’†\)\\s\*\/\, ''\)\}\;/g,
  \
ewTitle = String(newTitle).replace(/^??(íœÏ|’â~’†)\\s*/, '');\
);
fs.writeFileSync('src/hooks/useDataStore.ts', store);
console.log('Fixed titles');
