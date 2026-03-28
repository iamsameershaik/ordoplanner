import { Popup } from 'react-leaflet';
import { ExternalLink, Plus } from 'lucide-react';

interface MapPopupProps {
  title: string;
  subtitle?: string;
  lat: number;
  lng: number;
  onAddToPlaces?: () => void;
}

function gmapsDirections(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&origin=current&destination=${lat},${lng}`;
}

export default function MapPopup({ title, subtitle, lat, lng, onAddToPlaces }: MapPopupProps) {
  return (
    <Popup>
      <div className="min-w-[160px]">
        <p className="font-semibold text-stone-800 text-sm leading-snug">{title}</p>
        {subtitle && <p className="text-xs text-stone-500 mt-0.5 leading-snug">{subtitle}</p>}
        <div className="flex flex-col gap-1 mt-2">
          <a
            href={gmapsDirections(lat, lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-800"
          >
            <ExternalLink size={11} />
            Open in Google Maps
          </a>
          {onAddToPlaces && (
            <button
              onClick={onAddToPlaces}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-800 text-left"
            >
              <Plus size={11} />
              Add to Places
            </button>
          )}
        </div>
      </div>
    </Popup>
  );
}
