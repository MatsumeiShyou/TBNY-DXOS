import fs from 'fs';
let code = fs.readFileSync('src/components/CustomerScheduleGridModal.tsx', 'utf8');

// Props の修正
code = code.replace(
  /interface CustomerScheduleGridModalProps \{([\s\S]*?)\}/,
  `interface CustomerScheduleGridModalProps {\n$1\n  masterVehicles?: any[];\n}`
);
code = code.replace(
  /export default function CustomerScheduleGridModal\(\{ customers, onSave, onClose \}: CustomerScheduleGridModalProps\) \{/,
  `export default function CustomerScheduleGridModal({ customers, masterVehicles = [], onSave, onClose }: CustomerScheduleGridModalProps) {\n  const [activeTab, setActiveTab] = useState<'schedule' | 'basic'>('schedule');`
);

// Tab UI の挿入
const tabUI = `
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('schedule')}
            className={\`py-2 px-4 text-sm font-bold border-b-2 transition-colors \${activeTab === 'schedule' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
          >
            スケジュール設定
          </button>
          <button
            onClick={() => setActiveTab('basic')}
            className={\`py-2 px-4 text-sm font-bold border-b-2 transition-colors \${activeTab === 'basic' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
          >
            基本情報設定
          </button>
        </div>
`;

code = code.replace(
  /\{\/\* Toolbar \/ Filters \*\/\}/,
  tabUI + '\n        {/* Toolbar / Filters */}'
);

fs.writeFileSync('src/components/CustomerScheduleGridModal.tsx', code, 'utf8');
