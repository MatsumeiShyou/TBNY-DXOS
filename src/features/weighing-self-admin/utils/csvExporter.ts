import type { WeighingRecord } from '../types';

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

export const convertToCsv = (records: WeighingRecord[]): string => {
    const headers = [
        '記録ID',
        '日時',
        'ドライバー',
        '協力会社',
        '総重量(kg)',
        '空車重量(kg)',
        '差引重量(kg)',
        '誤差(kg)',
        'ステータス',
        '品目詳細(JSON)'
    ];

    const rows = records.map(record => {
        const itemsTotal = record.items.reduce((sum, item) => sum + item.weight, 0);
        const errorWeight = record.netWeight - itemsTotal;
        return [
            `"${record.recordId}"`,
            `"${formatDateTime(record.weighedAt)}"`,
            `"${record.driverName}"`,
            `"${record.companyName || '個人'}"`,
            record.grossWeight,
            record.tareWeight,
            record.netWeight,
            errorWeight,
            `"${record.status}"`,
            `"${JSON.stringify(record.items).replace(/"/g, '""')}"`
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\r\n');

    return '\uFEFF' + csvContent;
};
