const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'CustomerManagementModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "import React, { useState, useEffect, useRef } from 'react';",
  `import React, { useState, useEffect, useRef } from 'react';\nimport { Customer, MasterVehicle } from '../types';\nimport { Item } from './ItemManagementModal';`
);

const propsInterface = `
interface CustomerManagementModalProps {
  customers: Customer[];
  masterVehicles: MasterVehicle[];
  masterItems?: Item[];
  onSave: (customer: any) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onOpenGridMode?: () => void;
  initialData?: any;
}
`;

content = content.replace(
  "export default function CustomerManagementModal({ customers, masterVehicles, masterItems = [], onSave, onDelete, onClose, onOpenGridMode, initialData }) {",
  propsInterface + "\nexport default function CustomerManagementModal({ customers, masterVehicles, masterItems = [], onSave, onDelete, onClose, onOpenGridMode, initialData }: CustomerManagementModalProps) {"
);

content = content.replace(
  "const [selectedCustomerId, setSelectedCustomerId] = useState(null);",
  "const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);"
);

content = content.replace(
  "const compositionBuffer = useRef('');",
  "const compositionBuffer = useRef<string>('');"
);

content = content.replace(
  "const handleCompositionUpdate = (e) => {",
  "const handleCompositionUpdate = (e: any) => {"
);

content = content.replace(
  "const handleCompositionEnd = (e) => {",
  "const handleCompositionEnd = (e: any) => {"
);

content = content.replace(
  "const handleSelectCustomer = (customer) => {",
  "const handleSelectCustomer = (customer: Customer) => {"
);

content = content.replace(
  "const handleChange = (e) => {",
  "const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {"
);

content = content.replace(
  "const handlePrefTypeChange = (e) => {",
  "const handlePrefTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {"
);

content = content.replace(
  "const handlePrefTimeChange = (field, val) => {",
  "const handlePrefTimeChange = (field: string, val: string) => {"
);

content = content.replace(
  "const handleScheduleChange = (day, freq) => {",
  "const handleScheduleChange = (day: string, freq: string) => {"
);

content = content.replace(
  "const handleSubmit = (e, shouldClose = false) => {",
  "const handleSubmit = (e?: React.FormEvent | React.MouseEvent, shouldClose = false) => {"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('CustomerManagementModal updated');
