import React, { useEffect, useState } from 'react';
import { useWeighingAuth } from '../../contexts/WeighingAuthContext';
import { useMasterData } from '../../contexts/MasterDataContext';
import { useWeighingSession } from '../../contexts/WeighingSessionContext';
import FullScreenLoader from './FullScreenLoader';

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { checkAuthState, isLoading: authLoading, isAuthenticated } = useWeighingAuth();
  const { fetchMasterData, isLoading: masterDataLoading, lastUpdated, locations, items } = useMasterData();
  const { setIsExpressMode, setMaxSteps } = useWeighingSession();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await checkAuthState();
      // Only set initialized to true after auth state is checked
      setIsInitialized(true);
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If authenticated and master data is not loaded, fetch it
    if (isAuthenticated && !lastUpdated && !masterDataLoading) {
        fetchMasterData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, lastUpdated, masterDataLoading]);

  // This effect checks for express mode condition after master data is loaded.
  useEffect(() => {
    if (lastUpdated) { // This ensures master data is loaded
      if (locations.length === 1 && items.length === 1) {
        setIsExpressMode(true);
        setMaxSteps(3);
      } else {
        setIsExpressMode(false);
        // Set the potential max steps for the normal, longer flow.
        // This will be adjusted down if the user chooses the simple flow.
        setMaxSteps(5);
      }
    }
  }, [locations, items, lastUpdated, setIsExpressMode, setMaxSteps]);

  if (!isInitialized || authLoading) {
    return <FullScreenLoader message="認証情報を確認中..." />;
  }
  
  // If master data is still loading after authentication, show loader
  if (isAuthenticated && (masterDataLoading || !lastUpdated)) {
     return <FullScreenLoader message="マスターデータを準備中..." />;
  }

  return <>{children}</>;
};

export default AppInitializer;
