import { type LucideIcon, Map, CheckSquare, UtensilsCrossed, MapPin, FileText, MessageSquare } from 'lucide-react';

export type Tab = 'itinerary' | 'checklist' | 'meals' | 'places' | 'notes' | 'chat';

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'itinerary', label: 'Itinerary', Icon: Map },
  { id: 'checklist', label: 'Checklist', Icon: CheckSquare },
  { id: 'meals', label: 'Meals', Icon: UtensilsCrossed },
  { id: 'places', label: 'Places', Icon: MapPin },
  { id: 'notes', label: 'Notes', Icon: FileText },
  { id: 'chat', label: 'AI Chat', Icon: MessageSquare },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative"
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-stone-700" />
              )}
              <Icon
                size={18}
                strokeWidth={isActive ? 2.2 : 1.5}
                className={isActive ? 'text-stone-700' : 'text-stone-400'}
              />
              <span className={`text-[9px] font-medium tracking-wide ${isActive ? 'text-stone-700' : 'text-stone-400'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
