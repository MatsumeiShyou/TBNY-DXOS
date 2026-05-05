/**
 * RePaper Route 向け Master Data Adapter
 * 
 * 現在はダミーですが、必要に応じてポータル側のマスタ取得ロジックへ接続します。
 */
export const useMasterData = () => {
    return {
        customers: [],
        vehicles: [],
        items: [],
        isLoading: false
    };
};

const EMPTY_ARRAY: any[] = [];
const NOOP = async () => {};

export const useMasterDataContext = () => {
    return {
        customers: EMPTY_ARRAY,
        vehicles: EMPTY_ARRAY,
        items: EMPTY_ARRAY,
        points: EMPTY_ARRAY,
        drivers: EMPTY_ARRAY,
        isLoading: false,
        refresh: NOOP
    };
};

export const MasterDataProvider = ({ children }: { children: any }) => children;

export const useMasterPoints = () => ({ points: [], isLoading: false });
export const useMasterDrivers = () => ({ drivers: [], isLoading: false });
export const useMasterVehicles = () => ({ vehicles: [], isLoading: false });
