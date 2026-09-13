import fs from 'fs';
const path = 'src/components/WorkerManagementModal.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(
  /onDelete: \\(id: string\\) => void;/,
  "onDelete: (id: string) => Promise<'hard' | 'soft' | 'error'> | void;"
);

content = content.replace(
  /const handleDelete = \\(id: string, name: string\\) => {[\\s\\S]*?};/,
  "const handleDelete = async (id: string, name: string) => {\\n    if (window.confirm(「\」を削除しますか？\\n（過去の配車実績がある場合は論理削除として扱われます）)) {\\n      const result = await onDelete(id);\\n      if (result === 'hard') window.alert('完全に削除しました。');\\n      else if (result === 'soft') window.alert('過去の実績があるため、論理削除（休止扱い）にしました。');\\n      setSelectedIds(prev => {\\n        const next = new Set(prev);\\n        next.delete(id);\\n        return next;\\n      });\\n    }\\n  };"
);

content = content.replace(
  /const handleBulkDelete = \\(\\) => {[\\s\\S]*?};/,
  "const handleBulkDelete = async () => {\\n    if (selectedIds.size === 0) return;\\n    if (window.confirm(選択した \ 件の作業員を削除しますか？)) {\\n      let hardCount = 0;\\n      let softCount = 0;\\n      for (const id of Array.from(selectedIds)) {\\n        const result = await onDelete(id);\\n        if (result === 'hard') hardCount++;\\n        else if (result === 'soft') softCount++;\\n      }\\n      window.alert(完全削除: \件\\n論理削除（休止扱い）: \件);\\n      setSelectedIds(new Set());\\n    }\\n  };"
);

fs.writeFileSync(path, content);
