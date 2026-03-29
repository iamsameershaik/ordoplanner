import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { ItineraryDay, Place } from '../../types';
import { useMapPins } from '../../hooks/useMapPins';
import { icons } from './mapIcons';
import MapPopup from './MapPopup';
import CustomPinPanel from './CustomPinPanel';
import HotspotSearch from './HotspotSearch';
import type { HotspotResult } from './HotspotSearch';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NORTH_WALES_CENTER: [number, number] = [53.12, -3.79];
const NORTH_WALES_ZOOM = 10;
const HOTEL_ZOOM = 15;

interface MapTabProps {
  itinerary: ItineraryDay[];
  places: Place[];
  onAddPlace: (place: Omit<Place, 'id' | 'visited'>) => void;
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      try { map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 }); } catch {}
    }
  }, [bounds, map]);
  return null;
}

function SetView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const didSet = useRef(false);
  useEffect(() => {
    if (!didSet.current) {
      map.setView(center, zoom);
      didSet.current = true;
    }
  }, [center, zoom, map]);
  return null;
}

function gmapsDirectionsDay(events: { lat: number; lng: number }[]) {
  if (events.length < 2) return null;
  const origin = `${events[0].lat},${events[0].lng}`;
  const dest = `${events[events.length - 1].lat},${events[events.length - 1].lng}`;
  const waypoints = events.slice(1, -1).map(e => `${e.lat},${e.lng}`).join('|');
  const base = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
  return waypoints ? `${base}&waypoints=${waypoints}` : base;
}

export default function MapTab({ itinerary, places, onAddPlace }: MapTabProps) {
  const { pins, upsertPin, deletePin } = useMapPins();
  const [selectedDayId, setSelectedDayId] = useState<string>('');
  const [hotspotResults, setHotspotResults] = useState<HotspotResult[]>([]);
  const [showControls, setShowControls] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  const hotelPin = pins.find(p => p.type === 'hotel');
  const hotelLat = hotelPin?.lat;
  const hotelLng = hotelPin?.lng;

  const initialCenter: [number, number] = hotelLat !== undefined && hotelLng !== undefined
    ? [hotelLat, hotelLng]
    : NORTH_WALES_CENTER;
  const initialZoom = hotelLat !== undefined ? HOTEL_ZOOM : NORTH_WALES_ZOOM;

  const allItineraryEvents = itinerary.flatMap(d =>
    d.events
      .filter(ev => ev.location?.lat && ev.location?.lng)
      .map(ev => ({ ...ev, dayId: d.id, dayLabel: d.dayLabel, lat: ev.location!.lat!, lng: ev.location!.lng! }))
  );

  const selectedDay = itinerary.find(d => d.id === selectedDayId);
  const routeEvents = selectedDay
    ? selectedDay.events
        .filter(ev => ev.location?.lat && ev.location?.lng)
        .sort((a, b) => (a.startTime ?? a.time).localeCompare(b.startTime ?? b.time))
        .map(ev => ({ lat: ev.location!.lat!, lng: ev.location!.lng!, title: ev.title, startTime: ev.startTime ?? ev.time }))
    : [];
  const routePositions: [number, number][] = routeEvents.map(e => [e.lat, e.lng]);

  const placesWithCoords = places.filter(p => p.lat && p.lng) as (Place & { lat: number; lng: number })[];

  function handleAddToPlaces(result: HotspotResult) {
    const emoji = (result as HotspotResult & { emoji?: string }).emoji ?? '📍';
    onAddPlace({
      emoji,
      name: result.name,
      description: `${result.category} near search area`,
      shotTip: 'Explore and find your perfect shot!',
      lat: result.lat,
      lng: result.lng,
    });
    setHotspotResults(prev => prev.filter(r => r.id !== result.id));
  }

  const PIN_ICON_MAP: Record<string, keyof typeof icons> = {
    hotel: 'hotel',
    coach_dropoff: 'coach_dropoff',
    coach_pickup: 'coach_pickup',
  };

  const PIN_LABELS: Record<string, string> = {
    hotel: 'Hotel',
    coach_dropoff: 'Coach Drop-off',
    coach_pickup: 'Coach Pick-up',
  };

  const CATEGORY_ICON_MAP: Record<string, keyof typeof icons> = {
    sightseeing: 'sightseeing',
    travel: 'travel',
    dining: 'dining',
    accommodation: 'accommodation',
    activity: 'activity',
    other: 'other',
  };

  return (
    <div className="flex flex-col h-[calc(100vh-57px-64px)] relative">
      <div className="flex-1 relative">
        <MapContainer
          center={NORTH_WALES_CENTER}
          zoom={NORTH_WALES_ZOOM}
          className="w-full h-full"
          ref={mapRef}
          zoomControl={true}
        >
          <SetView center={initialCenter} zoom={initialZoom} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {routePositions.length >= 2 && (
            <>
              <Polyline
                positions={routePositions}
                pathOptions={{ color: '#1d4ed8', weight: 3, opacity: 0.75, dashArray: '6 4' }}
              />
              <FitBounds bounds={routePositions} />
            </>
          )}

          {allItineraryEvents.map(ev => (
            <Marker
              key={ev.id}
              position={[ev.lat, ev.lng]}
              icon={icons[CATEGORY_ICON_MAP[ev.category ?? 'other'] ?? 'other']}
            >
              <MapPopup
                title={ev.title}
                subtitle={`${ev.startTime ?? ev.time} · ${ev.dayLabel}`}
                lat={ev.lat}
                lng={ev.lng}
                hotelLat={hotelLat}
                hotelLng={hotelLng}
              />
            </Marker>
          ))}

          {placesWithCoords.map(place => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={icons.place}
            >
              <MapPopup
                title={`${place.emoji} ${place.name}`}
                subtitle={place.description}
                lat={place.lat}
                lng={place.lng}
                hotelLat={hotelLat}
                hotelLng={hotelLng}
              />
            </Marker>
          ))}

          {pins.map(pin => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={icons[PIN_ICON_MAP[pin.type] ?? 'other']}
            >
              <MapPopup
                title={`${PIN_LABELS[pin.type]}: ${pin.name ?? ''}`}
                subtitle={pin.address ?? undefined}
                lat={pin.lat}
                lng={pin.lng}
              />
            </Marker>
          ))}

          {hotspotResults.map(result => (
            <Marker
              key={result.id}
              position={[result.lat, result.lng]}
              icon={icons.hotspot}
            >
              <MapPopup
                title={result.name}
                subtitle={result.category}
                lat={result.lat}
                lng={result.lng}
                hotelLat={hotelLat}
                hotelLng={hotelLng}
                onAddToPlaces={() => handleAddToPlaces(result)}
              />
            </Marker>
          ))}
        </MapContainer>

        <button
          onClick={() => setShowControls(v => !v)}
          className="absolute top-3 right-3 z-[1000] bg-white border border-stone-200 rounded-lg p-2 shadow-md text-stone-600 hover:text-stone-800 transition-colors"
          title={showControls ? 'Hide controls' : 'Show controls'}
        >
          <ChevronDown size={16} className={`transition-transform ${showControls ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {showControls && (
        <div className="bg-stone-50 border-t border-stone-200 p-3 space-y-3 overflow-y-auto max-h-[45vh]">
          <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Route Preview</p>
            <div className="flex gap-2 items-center">
              <select
                value={selectedDayId}
                onChange={e => setSelectedDayId(e.target.value)}
                className="flex-1 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-stone-400 bg-white text-stone-700"
              >
                <option value="">Select a day…</option>
                {itinerary.map(day => (
                  <option key={day.id} value={day.id}>{day.dayLabel}</option>
                ))}
              </select>
              {routeEvents.length < 2 && selectedDayId && (
                <p className="text-xs text-stone-400 italic">No mapped events</p>
              )}
            </div>

            {routeEvents.length >= 2 && (
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1">
                  {routeEvents.map((ev, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                      {i + 1}. {ev.title}
                    </span>
                  ))}
                </div>
                <a
                  href={gmapsDirectionsDay(routeEvents) ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-800 mt-1"
                >
                  <ExternalLink size={11} />
                  Get directions for this day
                </a>
              </div>
            )}
          </div>

          <HotspotSearch
            onResults={setHotspotResults}
            onAddToPlaces={handleAddToPlaces}
            results={hotspotResults}
          />

          <CustomPinPanel
            pins={pins}
            onUpsert={upsertPin}
            onDelete={deletePin}
          />
        </div>
      )}
    </div>
  );
}
