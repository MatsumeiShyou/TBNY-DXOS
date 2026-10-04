import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

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
  /return \(\s*<div className=\{`flex flex-col h-screen/,
  pageComponentCode + '\n  return (\n    <div className={`flex flex-col h-screen'
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log('App.tsx updated');
