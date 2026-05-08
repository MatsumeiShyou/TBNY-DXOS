export interface MasterColumn {
    key: string;
    label: string;
    type?: 'text' | 'status' | 'badge' | 'multi-row' | 'tags' | 'days' | 'select';
    sortable?: boolean;
    sortKey?: string;
    className?: string;
    subLabelKey?: string;
    thirdLabelKey?: string;
    optionLabels?: Record<string, string>;
    styleRules?: Record<string, string>;
    sortOptions?: { key: string; label: string }[];
}

export interface MasterField {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    updatable?: boolean;
    options?: string[];
    optionLabels?: Record<string, string>;
    lookup?: { table: string; labelField: string; valueField: string };
    className?: string;
    auditLevel?: 'low' | 'high';
    validate?: (value: any) => string | true;
}

export interface MasterSchema {
    title: string;
    description: string;
    rpcTableName: string;
    viewName?: string;
    primaryKey: string;
    searchFields: string[];
    columns: MasterColumn[];
    fields: MasterField[];
}

export const MASTER_SCHEMAS: Record<string, MasterSchema> = {
    drivers: {
        title: '運転手マスタ',
        description: '配送を担当する運転手の情報を管理します。',
        viewName: 'drivers',
        rpcTableName: 'drivers',
        primaryKey: 'id',
        searchFields: ['driver_name', 'furigana'],
        columns: [
            { key: 'driver_name', label: '氏名', type: 'text', sortable: true },
            { key: 'furigana', label: 'フリガナ', type: 'text', sortable: true },
            { key: 'vehicle_number', label: '担当車両', type: 'text' },
            { key: 'is_active', label: '状態', type: 'status', styleRules: { true: 'active', false: 'inactive' } }
        ],
        fields: [
            { name: 'driver_name', label: '氏名', type: 'text', required: true },
            { name: 'furigana', label: 'フリガナ', type: 'text' },
            { name: 'vehicle_number', label: '担当車両', type: 'text' },
            { name: 'note', label: '備考', type: 'text' },
            { name: 'is_active', label: '有効', type: 'select', options: ['true', 'false'], optionLabels: { true: '有効', false: '無効' }, auditLevel: 'high' }
        ]
    },
    vehicles: {
        title: '車両マスタ',
        description: '使用する車両の情報を管理します。',
        viewName: 'master_vehicles',
        rpcTableName: 'master_vehicles',
        primaryKey: 'id',
        searchFields: ['number', 'callsign'],
        columns: [
            { key: 'number', label: '車両番号', type: 'text', sortable: true },
            { key: 'callsign', label: 'コールサイン', type: 'text' },
            { key: 'is_active', label: '状態', type: 'status' }
        ],
        fields: [
            { name: 'number', label: '車両番号', type: 'text', required: true, auditLevel: 'high' },
            { name: 'callsign', label: 'コールサイン', type: 'text' },
            { name: 'note', label: '備考', type: 'text' },
            { name: 'is_active', label: '有効', type: 'select', options: ['true', 'false'], auditLevel: 'high' }
        ]
    },
    items: {
        title: '品目マスタ',
        description: '回収する品目の情報を管理します。',
        viewName: 'master_items',
        rpcTableName: 'master_items',
        primaryKey: 'id',
        searchFields: ['name'],
        columns: [
            { key: 'name', label: '品目名', type: 'text', sortable: true },
            { key: 'unit', label: '単位', type: 'badge' },
            { key: 'is_active', label: '状態', type: 'status' }
        ],
        fields: [
            { name: 'name', label: '品目名', type: 'text', required: true },
            { name: 'furigana', label: 'フリガナ', type: 'text' },
            { name: 'unit', label: '単位', type: 'text', required: true },
            { name: 'is_active', label: '有効', type: 'select', options: ['true', 'false'], auditLevel: 'high' }
        ]
    },
    points: {
        title: '回収地点マスタ',
        description: '定期回収を行う地点の情報を管理します。',
        viewName: 'master_collection_points',
        rpcTableName: 'master_collection_points',
        primaryKey: 'location_id',
        searchFields: ['display_name', 'name'],
        columns: [
            { key: 'display_name', label: '表示名', type: 'text', sortable: true },
            { key: 'address', label: '住所', type: 'text' },
            { key: 'area', label: 'エリア', type: 'badge' },
            { key: 'is_active', label: '状態', type: 'status' }
        ],
        fields: [
            { name: 'display_name', label: '表示名', type: 'text', required: true },
            { name: 'name', label: '正式名称', type: 'text', required: true },
            { name: 'furigana', label: 'フリガナ', type: 'text' },
            { name: 'address', label: '住所', type: 'text' },
            { name: 'area', label: 'エリア', type: 'text' },
            { name: 'is_active', label: '有効', type: 'select', options: ['true', 'false'], auditLevel: 'high' }
        ]
    },
    staffs: {
        title: 'ユーザー管理',
        description: 'システムを利用するスタッフの権限とアカウントを管理します。',
        rpcTableName: 'staffs',
        primaryKey: 'id',
        searchFields: ['name', 'role'],
        columns: [
            { key: 'name', label: 'スタッフ名', type: 'text', sortable: true },
            { key: 'role', label: 'ロール', type: 'badge', styleRules: { 'admin': 'bg-rose-100 text-rose-700', 'staff': 'bg-blue-100 text-blue-700' } },
            { key: 'can_edit_board', label: '配車編集', type: 'status' }
        ],
        fields: [
            { name: 'name', label: 'スタッフ名', type: 'text', required: true },
            { name: 'role', label: 'ロール', type: 'select', options: ['admin', 'staff', 'viewer'], required: true, auditLevel: 'high' },
            { name: 'can_edit_board', label: '配車盤の編集許可', type: 'select', options: ['true', 'false'], auditLevel: 'high' }
        ]
    }
};

export const masterSchemas = MASTER_SCHEMAS;
