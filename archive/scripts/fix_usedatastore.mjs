import fs from 'fs';
const path = 'src/hooks/useDataStore.ts';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(
  /const deleteWorker = async \\(id: string\\) => {[\\s\\S]*?};/,
  "const deleteWorker = async (id: string): Promise<'hard' | 'soft' | 'error'> => {\\n    const res = await storageService.deleteWorker(id);\\n    if (res.success) {\\n      setMasterWorkers(prev => prev.filter(w => w.id !== id));\\n      return (res as any).deleted || 'soft';\\n    } else {\\n      console.error('Failed to delete worker:', res.error);\\n      return 'error';\\n    }\\n  };"
);

content = content.replace(
  /const deleteVehicle = async \\(id: string\\) => {[\\s\\S]*?};/,
  "const deleteVehicle = async (id: string): Promise<'hard' | 'soft' | 'error'> => {\\n    const res = await storageService.deleteVehicle(id);\\n    if (res.success) {\\n      setMasterVehicles(prev => prev.filter(v => v.id !== id));\\n      return (res as any).deleted || 'soft';\\n    } else {\\n      console.error('Failed to delete vehicle:', res.error);\\n      return 'error';\\n    }\\n  };"
);

content = content.replace(
  /const deleteItem = async \\(id: string\\) => {[\\s\\S]*?};/,
  "const deleteItem = async (id: string): Promise<'hard' | 'soft' | 'error'> => {\\n    const res = await storageService.deleteItem(id);\\n    if (res.success) {\\n      setMasterItems(prev => prev.filter(i => i.id !== id));\\n      return (res as any).deleted || 'soft';\\n    } else {\\n      console.error('Failed to delete item:', res.error);\\n      return 'error';\\n    }\\n  };"
);

fs.writeFileSync(path, content);
