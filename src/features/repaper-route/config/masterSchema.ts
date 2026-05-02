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
        rpcTableName: 'master_drivers',
        primaryKey: 'id',
        searchFields: ['name', 'furigana'],
        columns: [],
        fields: []
    },
    vehicles: {
        title: '車両マスタ',
        description: '使用する車両の情報を管理します。',
        rpcTableName: 'master_vehicles',
        primaryKey: 'id',
        searchFields: ['vehicle_number'],
        columns: [],
        fields: []
    },
    items: {
        title: '品目マスタ',
        description: '回収する品目の情報を管理します。',
        rpcTableName: 'master_items',
        primaryKey: 'id',
        searchFields: ['name'],
        columns: [],
        fields: []
    },
    customers: {
        title: '顧客マスタ',
        description: '排出事業者・顧客の情報を管理します。',
        rpcTableName: 'master_customers',
        primaryKey: 'id',
        searchFields: ['name'],
        columns: [],
        fields: []
    },
    points: {
        title: '回収地点マスタ',
        description: '定期回収を行う地点の情報を管理します。',
        rpcTableName: 'master_collection_points',
        primaryKey: 'id',
        searchFields: ['display_name'],
        columns: [],
        fields: []
    }
};

export const masterSchemas = MASTER_SCHEMAS;
