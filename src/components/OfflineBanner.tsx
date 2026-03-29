import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export default function OfflineBanner({ isOnline }: OfflineBannerProps) {
  if (isOnline) return null;
  return (
    <div className="sticky top-[57px] z-20 bg-amber-50/95 dark:bg-amber-900/20 border-b border-amber-200/80 dark:border-amber-800/60 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
        <WifiOff size={12} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-none">
          Offline — changes will sync when you reconnect
        </p>
      </div>
    </div>
  );
}
