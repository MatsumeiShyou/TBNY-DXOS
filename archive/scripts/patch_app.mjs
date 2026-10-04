import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const hashEffectCode = `
  // URLハッシュによるルーティング管理
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#customers') {
        setIsCustomerModalOpen(true);
      } else {
        setIsCustomerModalOpen(false);
      }
    };
    
    // 初期ロード時にも判定
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
`;

code = code.replace(
  'const [isItemModalOpen, setIsItemModalOpen] = useState(false);',
  'const [isItemModalOpen, setIsItemModalOpen] = useState(false);\n' + hashEffectCode
);

code = code.replace(
  'onOpenCustomerManagement={() => setIsCustomerModalOpen(true)}',
  'onOpenCustomerManagement={() => { window.location.hash = "customers"; }}'
);

code = code.replace(
  /\{isCustomerModalOpen && \([\s\S]*?<CustomerManagementModal[\s\S]*?\/>\s*\)\}/,
  ''
);

const pageComponentCode = `
  if (isCustomerModalOpen) {
    return (
      <CustomerManagementModal 
        customers={masterCustomers}
        masterVehicles={masterVehicles}
        masterItems={masterItems}
        initialData={customerModalInitialData}
        onSave={handleSaveCustomer}
        onDelete={handleDeleteCustomer}
        onClose={() => {
          setCustomerModalInitialData(null);
          window.location.hash = ''; // 戻る
        }}
        onOpenGridMode={() => {
          setCustomerModalInitialData(null);
          window.location.hash = ''; 
          setIsCustomerGridModalOpen(true);
        }}
      />
    );
  }
`;

code = code.replace(
  'return (\n    <div className={`flex flex-col h-screen',
  pageComponentCode + '\n  return (\n    <div className={`flex flex-col h-screen'
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log('App.tsx updated');
