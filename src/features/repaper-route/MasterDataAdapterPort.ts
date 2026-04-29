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

export const MasterDataProvider = ({ children }: { children: any }) => children;
export const useMasterPoints = () => ({ points: [], isLoading: false });
export const useMasterDrivers = () => ({ drivers: [], isLoading: false });
export const useMasterVehicles = () => ({ vehicles: [], isLoading: false });
