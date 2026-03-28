import L from 'leaflet';

function makeIcon(color: string, symbol: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <text x="16" y="20" text-anchor="middle" dominant-baseline="middle" font-size="14" font-family="system-ui">${symbol}</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

export const icons = {
  sightseeing: makeIcon('#0284c7', '🏛'),
  travel:      makeIcon('#78716c', '🚌'),
  dining:      makeIcon('#ea580c', '🍽'),
  accommodation: makeIcon('#0d9488', '🏨'),
  activity:    makeIcon('#16a34a', '🥾'),
  other:       makeIcon('#a8a29e', '📌'),
  place:       makeIcon('#7c3aed', '📍'),
  hotel:       makeIcon('#dc2626', '🏨'),
  coach_dropoff: makeIcon('#d97706', '🚌'),
  coach_pickup:  makeIcon('#f59e0b', '🚏'),
  hotspot:     makeIcon('#6366f1', '✨'),
};

export type IconKey = keyof typeof icons;
