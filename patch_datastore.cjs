const fs = require('fs');
let c = fs.readFileSync('temp_datastore.js', 'utf8');

// Patch 1: loadData sync (refreshJob)
c = c.replace(/const refreshJob = \(j: any\) => \{[\s\S]*?return \{\s*\.\.\.j,\s*title: customer\.name,[\s\S]*?\};\s*\};/,
`const refreshJob = (j: any) => {
            if (j.startTime && typeof j.startTime === 'string') {
              j.startTime = j.startTime.replace(/^0/, '');
            }
            const customer = customerMap.get(j.originalCustomerId);
            if (!customer || customer.isDeleted) {
              const cleanTitle = String(j.title || '').replace(/^⚠️(削除済|停止中)\\s*/, '');
              return {
                ...j,
                title: \`⚠️削除済 \${cleanTitle}\`,
                kana: '',
                isDeleted: true,
                isSuspended: false,
                isOrphan: false,
                isError: false,
                duration: j.duration || 30
              };
            }
            if (customer.isInvalid) {
              return {
                ...j,
                title: \`⚠️停止中 \${customer.name}\`,
                kana: customer.kana || '',
                isDeleted: false,
                isSuspended: true,
                isOrphan: false,
                isError: false,
                duration: customer.defaultDuration || j.duration || 30
              };
            }
            return {
              ...j,
              title: customer.name,
              kana: customer.kana || '',
              isDeleted: false,
              isSuspended: false,
              isOrphan: false,
              isError: false,
              duration: customer.defaultDuration || j.duration || 30
            };
          };`);

// Patch 2: saveBulkCustomers sync (syncJob) and removal of filtering
c = c.replace(/const validIds = new Set\(updatedCustomers\.filter\(c => !c\.isInvalid\)\.map\(c => c\.id\)\);\s*const syncJob = \(job: any\) => \{[\s\S]*?holidayCollection: c\.holidayCollection !== undefined \? c\.holidayCollection : job\.holidayCollection\s*\};\s*\};\s*setJobs\(prev => prev\.filter\(j => validIds\.has\(j\.originalCustomerId \|\| ''\)\)\.map\(syncJob\)\);\s*if \(dateStr\) \{\s*setPendingJobs\(prev => \{\s*let newPending = prev\.filter\(j => validIds\.has\(j\.originalCustomerId \|\| ''\)\)\.map\(syncJob\);/,
`const syncJob = (job: any) => {
      const c = customerMap.get(job.originalCustomerId);
      if (!c) return job;
      
      let newTitle = c.name || job.title;
      let isDeleted = false;
      let isSuspended = false;
      
      if (c.isDeleted) {
        newTitle = \`⚠️削除済 \${String(newTitle).replace(/^⚠️(削除済|停止中)\\s*/, '')}\`;
        isDeleted = true;
      } else if (c.isInvalid) {
        newTitle = \`⚠️停止中 \${String(newTitle).replace(/^⚠️(削除済|停止中)\\s*/, '')}\`;
        isSuspended = true;
      } else {
        newTitle = String(newTitle).replace(/^⚠️(削除済|停止中)\\s*/, '');
      }

      return {
        ...job,
        title: newTitle,
        kana: c.kana !== undefined ? c.kana : job.kana,
        area: c.area !== undefined ? c.area : job.area,
        duration: Number(c.defaultDuration) || job.duration || 30,
        preferredTime: c.preferredTime !== undefined ? c.preferredTime : job.preferredTime,
        requiredVehicle: c.requiredVehicle !== undefined ? c.requiredVehicle : job.requiredVehicle,
        items: c.items || job.items || [],
        note: c.note !== undefined ? c.note : job.note,
        holidayCollection: c.holidayCollection !== undefined ? c.holidayCollection : job.holidayCollection,
        isDeleted,
        isSuspended
      };
    };

    setJobs(prev => prev.map(syncJob));
    
    if (dateStr) {
      setPendingJobs(prev => {
        let newPending = prev.map(syncJob);`);

fs.writeFileSync('temp_datastore_patched.js', c);
console.log('patched');
