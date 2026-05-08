/**
 * マスタデータのシリアライズ・正規化ユーティリティ
 */

export const normalizeDays = (days: any) => {
  if (!days) return [];
  if (Array.isArray(days)) return days;
  return String(days).split(',').map(d => d.trim()).filter(Boolean);
};

export const serializeMasterData = (formData: any, fields: any[], _tableName: string) => {
  const result = { ...formData };
  
  fields.forEach(field => {
    const val = result[field.name];
    if (val === undefined) return;

    // 型に応じた変換
    if (field.type === 'select' && (val === 'true' || val === 'false')) {
      result[field.name] = val === 'true';
    } else if (field.type === 'number') {
      result[field.name] = Number(val);
    } else if (field.type === 'days') {
      result[field.name] = normalizeDays(val);
    }
  });

  return result;
};
