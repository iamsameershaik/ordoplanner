import { useState } from 'react';
import { Search, Loader2, Navigation, Plus } from 'lucide-react';

export interface HotspotResult {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
}

interface HotspotSearchProps {
  onResults: (results: HotspotResult[]) => void;
  onAddToPlaces: (result: HotspotResult) => void;
  results: HotspotResult[];
}

const CATEGORY_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  cafe: '☕',
  bar: '🍺',
  attraction: '🏛️',
  viewpoint: '📸',
  park: '🌿',
  museum: '🏛️',
  artwork: '🎨',
  hotel: '🏨',
  hostel: '🛏️',
  information: 'ℹ️',
  picnic_site: '🧺',
  default: '📍',
};

function buildOverpassQuery(lat: number, lng: number, radius = 500) {
  return `[out:json][timeout:10];
(
  node["amenity"~"restaurant|cafe|bar|fast_food|pub"](around:${radius},${lat},${lng});
  node["tourism"~"attraction|viewpoint|museum|artwork|hotel|hostel|picnic_site|information"](around:${radius},${lat},${lng});
  node["leisure"~"park|garden|nature_reserve"](around:${radius},${lat},${lng});
  way["tourism"~"attraction|viewpoint|museum"](around:${radius},${lat},${lng});
);
out center;`;
}

function getEmoji(tags: Record<string, string>) {
  const amenity = tags.amenity;
  const tourism = tags.tourism;
  const leisure = tags.leisure;
  const key = amenity || tourism || leisure || 'default';
  return CATEGORY_EMOJI[key] ?? CATEGORY_EMOJI['default'];
}

function getCategory(tags: Record<string, string>) {
  return tags.amenity || tags.tourism || tags.leisure || 'place';
}

export default function HotspotSearch({ onResults, onAddToPlaces, results }: HotspotSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchByQuery() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const nomData = await nomRes.json();
      if (!nomData.length) throw new Error('Location not found');
      await fetchHotspots(parseFloat(nomData[0].lat), parseFloat(nomData[0].lon));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
      setLoading(false);
    }
  }

  async function searchByGPS() {
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await fetchHotspots(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setError('Location permission denied');
        setLoading(false);
      }
    );
  }

  async function fetchHotspots(lat: number, lng: number) {
    try {
      const overpassQuery = buildOverpassQuery(lat, lng);
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const data = await res.json();
      const items: HotspotResult[] = (data.elements ?? [])
        .filter((el: { tags?: Record<string, string>; lat?: number; lon?: number; center?: { lat: number; lon: number } }) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          return elLat && elLon && el.tags?.name;
        })
        .map((el: { id: number; tags: Record<string, string>; lat?: number; lon?: number; center?: { lat: number; lon: number } }) => ({
          id: el.id,
          name: el.tags.name,
          category: getCategory(el.tags),
          emoji: getEmoji(el.tags),
          lat: el.lat ?? el.center!.lat,
          lng: el.lon ?? el.center!.lon,
        }))
        .slice(0, 20);
      onResults(items);
    } catch {
      setError('Failed to fetch nearby places');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Nearby Hotspots</p>

      <div className="flex gap-1.5">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchByQuery()}
          placeholder="Search location…"
          className="flex-1 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-stone-400"
        />
        <button
          onClick={searchByQuery}
          disabled={loading}
          className="px-2.5 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-medium hover:bg-stone-900 disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
        </button>
        <button
          onClick={searchByGPS}
          disabled={loading}
          title="Use my location"
          className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-stone-600 hover:border-stone-400 disabled:opacity-50"
        >
          <Navigation size={12} />
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {results.length > 0 && (
        <div className="max-h-40 overflow-y-auto space-y-1">
          {results.map(r => (
            <div key={r.id} className="flex items-center gap-2 text-xs py-1 border-b border-stone-50 last:border-0">
              <span className="text-base leading-none">{(r as HotspotResult & { emoji?: string }).emoji ?? '📍'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-stone-700 font-medium truncate">{r.name}</p>
                <p className="text-stone-400 truncate capitalize">{r.category}</p>
              </div>
              <button
                onClick={() => onAddToPlaces(r)}
                className="flex-shrink-0 flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium"
              >
                <Plus size={11} />
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
