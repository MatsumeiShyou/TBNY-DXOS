/**
 * Physical Constraints Validation Engine
 * 
 * 坪野谷紙業厚木事業所の業務OSにおける、物理的な整合性制約を定義します。
 * 詳細設計書 Section 6 (10kg制約) に基づく。
 */

/**
 * 10kg単位制約の検証
 * 入力値が 10 の倍数でない場合にエラーを返します。
 * @param value 検証する数値
 * @returns 検証結果（成功時は null, 失敗時はエラーメッセージ）
 */
export function validate10kgStep(value: number | string | null | undefined): string | null {
    if (value === null || value === undefined || value === '') return null;
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return '数値を入力してください。';
    
    if (numValue % 10 !== 0) {
        return `入力値（${numValue}kg）が正しくありません。10kg単位で入力してください。`;
    }
    
    return null;
}

/**
 * 総重量整合性の検証
 * @param total 総重量
 * @param empty 空車重量
 * @param items 品目合計重量
 * @returns 誤差がある場合は警告メッセージ
 */
export function validateWeightConsistency(total: number, empty: number, items: number): string | null {
    const diff = total - empty - items;
    if (diff !== 0) {
        return `重量不一致を検出しました（誤差: ${diff}kg）。理由（SDR）を入力してください。`;
    }
    return null;
}
