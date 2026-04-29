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

export const masterSchema: MasterSchema = {
    // DB Configuration — staffs テーブル (実在確認済み)
    viewName: 'staffs',
    rpcTableName: 'staffs',

    // UI Metadata
    title: 'スタッフ管理',
    description: 'スタッフの登録・編集・アーカイブを管理します。',
    audit_hint: 'この変更が行われる背景・理由を入力してください',

    // Functionality
    searchFields: ['name', 'role'],
    initialSort: { column: 'name', ascending: true },

    // List Columns
    columns: [
        { key: 'name', label: '名前', className: 'font-bold' },
        { key: 'role', label: '役割' },
        { key: 'is_active', label: '状態', type: 'badge', color: 'blue' }
    ],

    // Form Fields
    fields: [
        { name: 'name', label: '名前', type: 'text', required: true, placeholder: 'スタッフ名を入力', className: 'col-span-1' },
        { name: 'role', label: '役割', type: 'select', options: ['管理者', 'ドライバー', '事務'], required: true, className: 'col-span-1' },
    ]
};
