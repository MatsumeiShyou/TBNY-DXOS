/**
 * Master Schema Configuration — staffs テーブル
 * 
 * T-07: プレースホルダーから実在テーブル(staffs)に接続。
 * カラム構成は Supabase スキーマに基づいて調整済み。
 */

export interface MasterField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select';
    required?: boolean;
    placeholder?: string;
    className?: string;
    options?: string[];
    optionsSource?: string;
    defaultValue?: string | ((items: unknown[]) => string);
    transformIn?: (val: any) => any;
    transformOut?: (val: any) => any;
}

export interface MasterColumn {
    key: string;
    label: string;
    className?: string;
    type?: 'badge';
    color?: string;
}

export interface MasterSchema {
    viewName: string;
    rpcTableName: string;
    title: string;
    description: string;
    audit_hint?: string;
    searchFields: string[];
    initialSort: { column: string; ascending: boolean };
    columns: MasterColumn[];
    fields: MasterField[];
}

export const masterSchemas: Record<string, MasterSchema> = {
    staffs: {
        viewName: 'staffs',
        rpcTableName: 'staffs',
        title: 'スタッフ管理',
        description: 'スタッフの登録・編集・アーカイブを管理します。',
        audit_hint: 'スタッフ情報の変更理由を入力してください',
        searchFields: ['name', 'role'],
        initialSort: { column: 'name', ascending: true },
        columns: [
            { key: 'name', label: '名前', className: 'font-bold' },
            { key: 'role', label: '役割' },
            { key: 'is_active', label: '状態', type: 'badge', color: 'blue' }
        ],
        fields: [
            { name: 'name', label: '名前', type: 'text', required: true, placeholder: 'スタッフ名を入力' },
            { name: 'role', label: '役割', type: 'select', options: ['管理者', 'ドライバー', '事務'], required: true },
        ]
    },
    payers: {
        viewName: 'payers',
        rpcTableName: 'payers',
        title: '支払先マスタ',
        description: '請求および支払の主体となる取引先を管理します。',
        audit_hint: '支払先情報の変更理由（新規取引、情報更新等）を入力してください',
        searchFields: ['name', 'code'],
        initialSort: { column: 'name', ascending: true },
        columns: [
            { key: 'code', label: 'コード', className: 'font-mono' },
            { key: 'name', label: '名称', className: 'font-bold' },
            { key: 'closing_date', label: '締日' }
        ],
        fields: [
            { name: 'code', label: '支払先コード', type: 'text', required: true, placeholder: '例: P001' },
            { name: 'name', label: '支払先名称', type: 'text', required: true, placeholder: '会社名を入力' },
            { name: 'closing_date', label: '締日', type: 'number', placeholder: '例: 20 (末日の場合は31)' },
        ]
    },
    suppliers: {
        viewName: 'suppliers',
        rpcTableName: 'suppliers',
        title: '仕入先マスタ',
        description: '契約の主体となる仕入先（協力会社等）を管理します。',
        audit_hint: '仕入先情報の変更理由を入力してください',
        searchFields: ['name', 'code'],
        initialSort: { column: 'name', ascending: true },
        columns: [
            { key: 'code', label: 'コード', className: 'font-mono' },
            { key: 'name', label: '名称', className: 'font-bold' }
        ],
        fields: [
            { name: 'code', label: '仕入先コード', type: 'text', required: true, placeholder: '例: S001' },
            { name: 'name', label: '仕入先名称', type: 'text', required: true, placeholder: '協力会社名を入力' },
        ]
    },
    locations: {
        viewName: 'locations',
        rpcTableName: 'locations',
        title: '回収先マスタ',
        description: '物流の現場（物理的な回収・納品地点）を管理します。',
        audit_hint: '現場情報の変更理由を入力してください',
        searchFields: ['name', 'address'],
        initialSort: { column: 'name', ascending: true },
        columns: [
            { key: 'name', label: '現場名', className: 'font-bold' },
            { key: 'address', label: '住所' },
            { key: 'weighing_allowed', label: '計量許可', type: 'badge' }
        ],
        fields: [
            { name: 'name', label: '現場名', type: 'text', required: true, placeholder: '現場名称を入力' },
            { name: 'address', label: '住所', type: 'text', placeholder: '詳細住所を入力' },
            { 
                name: 'weighing_allowed', 
                label: '計量許可', 
                type: 'select', 
                options: ['true', 'false'], 
                defaultValue: 'false'
            },
        ]
    },
    drivers: {
        viewName: 'drivers',
        rpcTableName: 'drivers',
        title: '運転手マスタ',
        description: '配送を担当する運転手の情報を管理します。',
        searchFields: ['driver_name'],
        initialSort: { column: 'driver_name', ascending: true },
        columns: [
            { key: 'driver_name', label: '氏名', className: 'font-bold' },
            { key: 'vehicle_number', label: '担当車両' }
        ],
        fields: [
            { name: 'driver_name', label: '氏名', type: 'text', required: true },
            { name: 'vehicle_number', label: '担当車両', type: 'text' }
        ]
    },
    vehicles: {
        viewName: 'master_vehicles',
        rpcTableName: 'master_vehicles',
        title: '車両マスタ',
        description: '使用する車両の情報を管理します。',
        searchFields: ['number', 'callsign'],
        initialSort: { column: 'number', ascending: true },
        columns: [
            { key: 'number', label: '車両番号', className: 'font-bold' },
            { key: 'callsign', label: 'コールサイン' }
        ],
        fields: [
            { name: 'number', label: '車両番号', type: 'text', required: true },
            { name: 'callsign', label: 'コールサイン', type: 'text' }
        ]
    },
    items: {
        viewName: 'master_items',
        rpcTableName: 'master_items',
        title: '品目マスタ',
        description: '回収する品目の情報を管理します。',
        searchFields: ['name'],
        initialSort: { column: 'name', ascending: true },
        columns: [
            { key: 'name', label: '品目名', className: 'font-bold' },
            { key: 'unit', label: '単位' }
        ],
        fields: [
            { name: 'name', label: '品目名', type: 'text', required: true },
            { name: 'unit', label: '単位', type: 'text', required: true }
        ]
    }
};

// 後方互換性のためのエイリアス
export const masterSchema = masterSchemas.staffs;

