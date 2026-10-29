import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-[#141B2B] border border-[#FFB454]/40 px-4 py-2 text-xs font-medium text-[#FFB454] shadow-2xl backdrop-blur-md">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB454] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFB454]" />
      </span>
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Changes will sync to Firestore when connection resumes</span>
    </div>
  );
};
