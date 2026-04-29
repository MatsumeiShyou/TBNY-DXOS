/**
 * Physical Constraints — 物理層・業務ドメインにおける不変の制約定義
 * 
 * TBNY DXOS 全体で共有され、マスタ入力、配車計画、計量実績の
 * すべてのバリデーションの SSOT (Single Source of Truth) となる。
 */

export const PHYSICAL_CONSTRAINTS = {
  WEIGHING: {
    MIN_UNIT_KG: 10, // 計量器の最小単位 (10kg)
    MAX_WEIGHT_KG: 50000, // システムで許容する最大重量 (50t)
  },
  VEHICLE: {
    MAX_CAPACITY_KG: 20000, // 一般的な大型車両の最大積載量 (20t)
    LICENSE_PLATE_PATTERN: /^[0-9A-Za-z- ]+$/, // ナンバープレートの基本文字制約
  },
} as const;

/**
 * 重量が物理的な計量単位（10kg）に従っているか検証する
 */
export const isValidWeighingUnit = (weightKg: number): boolean => {
  return weightKg % PHYSICAL_CONSTRAINTS.WEIGHING.MIN_UNIT_KG === 0;
};

/**
 * 10kg単位に切り捨てる（正規化）
 */
export const normalizeToWeighingUnit = (weightKg: number): number => {
  return Math.floor(weightKg / PHYSICAL_CONSTRAINTS.WEIGHING.MIN_UNIT_KG) * PHYSICAL_CONSTRAINTS.WEIGHING.MIN_UNIT_KG;
};

/**
 * 車両積載量の妥当性検証
 */
export const isWithinCapacity = (payload: number, capacity: number): boolean => {
  return payload <= capacity;
};
