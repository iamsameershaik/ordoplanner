import { useState } from 'react';
import { Search, Hotel, Bus, MapPin, Trash2, Loader2 } from 'lucide-react';
import type { TripPin, TripPinType } from '../../types';

interface CustomPinPanelProps {
  pins: TripPin[];
  onUpsert: (type: TripPinType, lat: number, lng: number, name?: string, address?: string) => Promise<void>;
  onDelete: (type: TripPinType) => Promise<void>;
}

const PIN_TYPES: { type: TripPinType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'hotel', label: 'Hotel', icon: <Hotel size={14} />, color: 'text-red-500' },
  { type: 'coach_dropoff', label: 'Drop-off', icon: <Bus size={14} />, color: 'text-amber-600' },
  { type: 'coach_pickup', label: 'Pick-up', icon: <MapPin size={14} />, color: 'text-yellow-500' },
];

export default function CustomPinPanel({ pins, onUpsert, onDelete }: CustomPinPanelProps) {
  const [activeType, setActiveType] = useState<TripPinType | null>(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [saving, setSaving] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      setResults(data);
    } catch {
    } finally {
      setSearching(false);
    }
  }

  async function assign(result: { display_name: string; lat: string; lon: string }) {
    if (!activeType) return;
    setSaving(true);
    const short = result.display_name.split(',').slice(0, 2).join(',').trim();
    await onUpsert(activeType, parseFloat(result.lat), parseFloat(result.lon), short, result.display_name);
    setSaving(false);
    setActiveType(null);
    setQuery('');
    setResults([]);
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Custom Pins</p>

      <div className="flex gap-1.5">
        {PIN_TYPES.map(({ type, label, icon, color }) => {
          const pinExists = pins.find(p => p.type === type);
          return (
            <button
              key={type}
              onClick={() => setActiveType(activeType === type ? null : type)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                activeType === type
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white border-stone-200 hover:border-stone-400'
              }`}
            >
              <span className={activeType === type ? 'text-white' : color}>{icon}</span>
              <span className="leading-none">{label}</span>
              {pinExists && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" />}
            </button>
          );
        })}
      </div>

      {activeType && (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Search for an address…"
              className="flex-1 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-stone-400"
            />
            <button
              onClick={search}
              disabled={searching}
              className="px-2.5 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-medium hover:bg-stone-900 disabled:opacity-50"
            >
              {searching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
            </button>
          </div>

          {results.length > 0 && (
            <div className="border border-stone-100 rounded-lg overflow-hidden">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => assign(r)}
                  disabled={saving}
                  className="w-full text-left px-2.5 py-2 text-xs text-stone-700 hover:bg-stone-50 border-b border-stone-100 last:border-0 leading-snug"
                >
                  {r.display_name.split(',').slice(0, 3).join(', ')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {pins.length > 0 && (
        <div className="space-y-1 pt-1">
          {pins.map(pin => {
            const def = PIN_TYPES.find(p => p.type === pin.type);
            return (
              <div key={pin.id} className="flex items-center gap-2 text-xs">
                <span className={def?.color}>{def?.icon}</span>
                <span className="flex-1 text-stone-600 truncate">{pin.name || pin.address || `${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`}</span>
                <button
                  onClick={() => onDelete(pin.type)}
                  className="text-stone-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
