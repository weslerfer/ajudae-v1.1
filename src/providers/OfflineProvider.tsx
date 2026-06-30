import React, { createContext, useContext, useEffect, useState } from 'react';

type NetworkStatus = 'online' | 'reconnecting' | 'offline' | 'slow';

interface OfflineContextProps {
  status: NetworkStatus;
  isOnline: boolean;
}

const OfflineContext = createContext<OfflineContextProps>({
  status: 'online',
  isOnline: true,
});

export const useOffline = () => useContext(OfflineContext);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<NetworkStatus>(navigator.onLine ? 'online' : 'offline');

  useEffect(() => {
    const handleOnline = () => setStatus('online');
    const handleOffline = () => setStatus('offline');
    
    // Simulate slow network detection if connection API is available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const updateConnectionStatus = () => {
      if (connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')) {
        setStatus('slow');
      }
    };

    if (connection) {
      connection.addEventListener('change', updateConnectionStatus);
      updateConnectionStatus(); // initial check
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateConnectionStatus);
      }
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ status, isOnline: status === 'online' || status === 'slow' }}>
      {children}
    </OfflineContext.Provider>
  );
};
