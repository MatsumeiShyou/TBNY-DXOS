import { useMasterDataContext } from '../../MasterDataAdapterPort';

/**
 * useMasterData (Adapter Hook for F-SSOT)
 * 個別の useState + useEffect を廃止し、MasterDataProvider からの
 * 派生値を直接返すようにリファクタリング。
 */
const EMPTY_ARRAY: any[] = [];
const NOOP = async () => {};

export const useMasterData = () => {
    if (typeof useMasterDataContext !== 'function') {
        console.warn('[WARNING] useMasterDataContext is not available. Using fallback dummy data.');
        return {
            customers: EMPTY_ARRAY,
            vehicles: EMPTY_ARRAY,
            items: EMPTY_ARRAY,
            points: EMPTY_ARRAY,
            drivers: EMPTY_ARRAY,
            isLoading: false,
            refresh: NOOP
        };
    }
    return useMasterDataContext();
};

export function invalidateMasterCache() {
    // Context化により、リフレッシュは Context の refresh メソッド等で行う。
    // 必要に応じて here で refresh を呼び出すように誘導する。
}
