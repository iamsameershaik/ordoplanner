import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export default function OfflineBanner({ isOnline }: OfflineBannerProps) {
  if (isOnline) return null;
  return (
    <div className="sticky top-[57px] z-20 bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
        <WifiOff size={13} className="text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700 font-medium">
          Offline — changes will sync when you're back online
        </p>
      </div>
    </div>
  );
}
