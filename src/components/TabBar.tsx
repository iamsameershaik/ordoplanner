import { type LucideIcon, CalendarDays, CheckSquare, UtensilsCrossed, MapPin, FileText, Map } from 'lucide-react';

export type Tab = 'itinerary' | 'checklist' | 'meals' | 'places' | 'notes' | 'map';

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'itinerary', label: 'Plan', Icon: CalendarDays },
  { id: 'checklist', label: 'Pack', Icon: CheckSquare },
  { id: 'meals', label: 'Meals', Icon: UtensilsCrossed },
  { id: 'places', label: 'Places', Icon: MapPin },
  { id: 'map', label: 'Map', Icon: Map },
  { id: 'notes', label: 'Notes', Icon: FileText },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center justify-center pt-2.5 pb-3.5 gap-1 relative transition-all duration-150 active:scale-95 ${
                isActive ? 'text-stone-800' : 'text-stone-400'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-stone-800 rounded-full" />
              )}
              <Icon
                size={19}
                strokeWidth={isActive ? 2.2 : 1.6}
              />
              <span className={`text-[9.5px] font-medium tracking-wide leading-none ${
                isActive ? 'text-stone-800' : 'text-stone-400'
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
