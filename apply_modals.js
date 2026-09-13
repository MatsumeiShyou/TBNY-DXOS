const fs = require('fs');

function processModal(filePath, itemName, itemsProp, itemType) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('selectedIds')) return; // Already processed

  // 1. Add state for selectedIds
  content = content.replace(
    /const \[isAdding, setIsAdding\] = useState\(false\);\s*(?:(?:\/\/[^\n]*\n)*\s*const \[[^\]]+\] = useState[^;]+;\s*)*/,
    match => match + '\n  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());\n'
  );

  // 2. Add handlers
  const handlers = 
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(\「\」を削除しますか？\\n（過去の配車実績がある場合は論理削除として扱われます）\)) {
      onDelete(id);
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(\選択した \ 件の\を削除しますか？\)) {
      Array.from(selectedIds).forEach(id => {
        onDelete(id);
      });
      setSelectedIds(new Set());
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(.map(w => w.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };\n\n;

  content = content.replace(
    /const isFormOpen = [^;]+;/,
    match => handlers + match
  );

  // 3. Header title with checkbox and bulk delete button
  // 登録済み
  const headerRegex = new RegExp(\<h3 className="text-sm font-bold text-gray-700">登録済み[^\(]+\\\({\\\$\\{?\\.length\\}?\}件?\\\)</h3>\);
  content = content.replace(headerRegex, 
    \<h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={.length > 0 && selectedIds.size === .length}
                onChange={toggleSelectAll}
                className="w-4 h-4 cursor-pointer"
                title="全選択/解除"
              />
              登録済み ({.length}件)
            </h3>\
  );

  // Add bulk delete button before "New Add" button
  content = content.replace(
    /{!isFormOpen && \\(\\s*<button\\s*onClick={startAdd}/,
    \{selectedIds.size > 0 && !isFormOpen && (
                <button
                  onClick={handleBulkDelete}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded flex items-center gap-1 mr-2"
                >
                  <Trash2 size={14} /> 選択を削除 ({selectedIds.size})
                </button>
              )}
              {!isFormOpen && (
                <button 
                  onClick={startAdd}\
  );

  // 4. List items checkbox
  content = content.replace(
    /(<div[^>]*?key={[^>]+>\s*<div className="flex [^"]+">)/,
    (match) => match + \\n                <input 
                  type="checkbox"
                  checked={selectedIds.has(w.id)}
                  onChange={(e) => toggleSelect(w.id, e.target.checked)}
                  className="w-4 h-4 cursor-pointer mr-2"
                />\
  );
  
  // Also we need to fix the map param, mostly it is 'v' or 'i' or 'c', let's find out what the map var is
  let mapVarMatch = content.match(new RegExp(\${itemsProp}\\.map\\\\(\\\\s*([^ =]+)\\\\s*=>\));
  let mapVar = mapVarMatch ? mapVarMatch[1] : 'w';

  // Fix the checkbox added above with correct var
  content = content.replace(/selectedIds\.has\(w\.id\)/g, \selectedIds.has(\.id)\);
  content = content.replace(/toggleSelect\(w\.id/g, \	oggleSelect(\.id\);

  // 5. Replace single delete button
  const confirmRegex = new RegExp(\onClick={\\\\(\\\\) => {\\\\s*if \\\\(window\\.confirm\\\\(\\\\\「\\\\$\\\\{.+\\\\}\\\\」を削除しますか？\\\\\)\\\\) onDelete\\\\(.+\\\\id\\\\);\\\\s*}\\\\}\);
  content = content.replace(confirmRegex, \onClick={() => handleDelete(\.id, \.name || \.item_name || '名前なし')}\);

  fs.writeFileSync(filePath, content);
}

processModal('src/components/VehicleManagementModal.tsx', '車両', 'vehicles', 'MasterVehicle');
processModal('src/components/ItemManagementModal.tsx', '品目', 'items', 'MasterItem');
processModal('src/components/CustomerManagementModal.tsx', '顧客', 'customers', 'Customer');
