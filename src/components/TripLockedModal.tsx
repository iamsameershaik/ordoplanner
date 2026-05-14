import { Lock, PartyPopper } from 'lucide-react';

interface TripLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TripLockedModal({ isOpen, onClose }: TripLockedModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-black/20 max-w-sm w-full p-8 flex flex-col items-center text-center gap-4 animate-[scale-in_0.18s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'tripLockPop 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-stone-900 dark:bg-slate-100 flex items-center justify-center shadow-lg">
            <Lock size={26} className="text-white dark:text-slate-900" />
          </div>
          <div className="absolute -top-1.5 -right-2 text-xl">
            <PartyPopper size={22} className="text-amber-500" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100 mb-1.5">
            The trip is done! 🎉
          </h2>
          <p className="text-sm text-stone-500 dark:text-slate-400 leading-relaxed">
            This app has been <span className="font-semibold text-stone-700 dark:text-slate-200">lovingly frozen in time</span> by your developer, like a photo you never want to edit.
          </p>
        </div>

        <div className="bg-stone-50 dark:bg-slate-700/50 rounded-2xl px-5 py-4 w-full text-left space-y-1.5">
          <p className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Why can't I edit?
          </p>
          <p className="text-sm text-stone-600 dark:text-slate-300 leading-relaxed">
            Because North Wales was <span className="italic">perfect</span>, and some things shouldn't be touched. 🏔️
          </p>
          <p className="text-xs text-stone-400 dark:text-slate-500 mt-1">
            — The Developer (who had to hard-code this)
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-stone-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm rounded-2xl hover:bg-stone-800 dark:hover:bg-white active:scale-[0.98] transition-all"
        >
          Fair enough 👍
        </button>
      </div>

      <style>{`
        @keyframes tripLockPop {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
