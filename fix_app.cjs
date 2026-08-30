const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const handleDoubleClickJob = \(job, cellInfo\) => \{\s*if \(job\.isUnregistered\) \{[\s\S]*?return;\s*\}/;
const replacement = `const handleDoubleClickJob = (job, cellInfo) => {
    if (job.isDeleted) {
      const titleWithoutWarning = job.title ? job.title.replace(/^⚠️削除済\\s*/, '') : '';
      setCustomerModalInitialData({
        name: titleWithoutWarning,
        defaultDuration: job.duration,
        requiredVehicle: job.requiredVehicle || '',
        id: ''
      });
      setIsCustomerModalOpen(true);
      return;
    }
    if (job.isSuspended) {
      const titleWithoutWarning = job.title ? job.title.replace(/^⚠️停止中\\s*/, '') : '';
      alert(\`\${titleWithoutWarning} は現在マスタで「一時停止」に設定されています。顧客管理画面から解除してください。\`);
      return;
    }`;

c = c.replace(regex, replacement);

c = c.replace(
  /ghostJob\.isUnregistered \? 'bg-orange-50 text-orange-900 border-2 border-dashed border-orange-500' : /g,
  "ghostJob.isDeleted ? 'bg-orange-50 text-orange-900 border-2 border-dashed border-orange-500' : ghostJob.isSuspended ? 'bg-yellow-100 text-yellow-900 border-2 border-dotted border-yellow-500' : "
);

fs.writeFileSync('src/App.tsx', c);
console.log('App.tsx updated');
