const fs = require('fs');
let c = fs.readFileSync('src/components/TemplateModal.tsx', 'utf8');

c = c.replace(
  /customerStatusMap\.set\(c\.id, \{ isSuspended: !!c\.isInvalid \}\);/,
  "customerStatusMap.set(c.id, { isSuspended: !!c.isInvalid, isDeleted: !!c.isDeleted });"
);

c = c.replace(
  /if \(customerStatus\) \{\s*if \(customerStatus\.isSuspended\) \{/,
  \if (customerStatus && !customerStatus.isDeleted) {
            if (customerStatus.isSuspended) {\
);

fs.writeFileSync('src/components/TemplateModal.tsx', c);
console.log('patched TemplateModal');
