import { useState, useEffect, useRef } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function RemoteUpdateToast() {
  const [visible, setVisible] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleRemoteUpdate = () => {
      setVisible(true);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      dismissTimer.current = setTimeout(() => setVisible(false), 12000);
    };

    window.addEventListener('ordo:remote-update', handleRemoteUpdate);
    return () => {
      window.removeEventListener('ordo:remote-update', handleRemoteUpdate);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="ordo-update-banner sticky top-[57px] z-40 w-full">
      <div className="bg-stone-800 text-white">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0 animate-pulse" />
            <p className="text-xs font-medium text-stone-200 leading-snug truncate">
              Trip updated by another device
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 active:text-sky-200 transition-colors px-2 py-1 rounded-lg hover:bg-stone-700"
          >
            <RefreshCw size={11} strokeWidth={2.5} />
            Refresh
          </button>
          <button
            onClick={() => setVisible(false)}
            className="flex-shrink-0 text-stone-500 hover:text-stone-300 transition-colors p-1 rounded-lg hover:bg-stone-700"
            aria-label="Dismiss"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
