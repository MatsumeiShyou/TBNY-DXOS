/**
 * 汎用ソートユーティリティ
 */

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export const universalSort = (a: any, b: any, key: string, direction: 'asc' | 'desc' = 'asc') => {
  const valA = a[key];
  const valB = b[key];

  if (valA === valB) return 0;
  if (valA === null || valA === undefined) return 1;
  if (valB === null || valB === undefined) return -1;

  let comparison = 0;
  if (typeof valA === 'string' && typeof valB === 'string') {
    comparison = valA.localeCompare(valB, 'ja');
  } else {
    comparison = valA < valB ? -1 : 1;
  }

  return direction === 'asc' ? comparison : -comparison;
};
