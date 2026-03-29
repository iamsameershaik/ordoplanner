import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { Place } from '../../types';

interface PlacesTabProps {
  places: Place[];
  onToggleVisited: (id: string) => void;
}

function PlaceCard({ place, onToggleVisited }: { place: Place; onToggleVisited: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${
        place.visited
          ? 'border-stone-200 bg-stone-50 dark:border-slate-700 dark:bg-slate-800/50'
          : 'border-stone-200 bg-white dark:border-slate-700 dark:bg-slate-800'
      }`}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <span className="text-2xl flex-shrink-0 leading-tight">{place.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${place.visited ? 'text-stone-400 dark:text-slate-500' : 'text-stone-800 dark:text-slate-100'}`}>
            {place.name}
          </p>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{place.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
          {expanded ? <ChevronUp size={16} className="text-stone-400 dark:text-slate-500" /> : <ChevronDown size={16} className="text-stone-400 dark:text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-stone-100 dark:border-slate-700 pt-3">
          <p className="text-sm text-stone-600 dark:text-slate-300 leading-relaxed mb-3">{place.description}</p>
          <p className="text-xs italic text-stone-500 dark:text-slate-400 leading-relaxed">
            <span className="not-italic font-semibold text-stone-400 dark:text-slate-500 mr-1">📸</span>
            {place.shotTip}
          </p>
          <button
            onClick={onToggleVisited}
            className={`mt-4 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
              place.visited
                ? 'bg-stone-700 dark:bg-slate-200 text-white dark:text-slate-900 border-stone-700 dark:border-slate-200'
                : 'bg-white dark:bg-slate-700 text-stone-600 dark:text-slate-300 border-stone-300 dark:border-slate-600 hover:border-stone-500 dark:hover:border-slate-400'
            }`}
          >
            <Check size={13} strokeWidth={2.5} />
            {place.visited ? 'Visited' : 'Mark as visited'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlacesTab({ places, onToggleVisited }: PlacesTabProps) {
  const visitedCount = places.filter(p => p.visited).length;

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-stone-400 dark:text-slate-500 font-medium">{visitedCount} / {places.length} visited</p>
        <div className="w-32 h-1.5 bg-stone-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-stone-500 dark:bg-slate-400 rounded-full transition-all duration-300"
            style={{ width: `${places.length > 0 ? (visitedCount / places.length) * 100 : 0}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {places.map(place => (
          <PlaceCard
            key={place.id}
            place={place}
            onToggleVisited={() => onToggleVisited(place.id)}
          />
        ))}
      </div>
    </div>
  );
}
