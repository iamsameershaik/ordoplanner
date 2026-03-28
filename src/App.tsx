import { useState, lazy, Suspense } from 'react';
import type { Tab } from './components/TabBar';
import TabBar from './components/TabBar';
import ItineraryTab from './components/itinerary/ItineraryTab';
import ChecklistTab from './components/checklist/ChecklistTab';
import MealsTab from './components/meals/MealsTab';
import PlacesTab from './components/places/PlacesTab';
import NotesTab from './components/notes/NotesTab';
import ChatTab from './components/chat/ChatTab';
const MapTab = lazy(() => import('./components/map/MapTab'));
import OfflineBanner from './components/OfflineBanner';
import { useSupabaseState } from './hooks/useSupabaseState';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  initialItinerary,
  initialChecklist,
  initialMeals,
  initialPlaces,
  initialLinks,
} from './data/initialData';
import type {
  ItineraryDay,
  ItineraryEvent,
  ChecklistGroup,
  DayMeals,
  Place,
  SavedLink,
  ChatMessage,
} from './types';

function genId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const isOnline = useOnlineStatus();

  const [itinerary, itineraryLoaded, setItinerary] = useSupabaseState<ItineraryDay[]>('nw_itinerary', initialItinerary);
  const [checklist, checklistLoaded, setChecklist] = useSupabaseState<ChecklistGroup[]>('nw_checklist', initialChecklist);
  const [meals, mealsLoaded, setMeals] = useSupabaseState<DayMeals[]>('nw_meals', initialMeals);
  const [places, placesLoaded, setPlaces] = useSupabaseState<Place[]>('nw_places', initialPlaces);
  const [notes, notesLoaded, setNotes] = useSupabaseState<string>('nw_notes', '');
  const [links, linksLoaded, setLinks] = useSupabaseState<SavedLink[]>('nw_links', initialLinks);
  const [chatMessages, chatLoaded, setChatMessages] = useSupabaseState<ChatMessage[]>('nw_chat', []);

  const allLoaded = itineraryLoaded && checklistLoaded && mealsLoaded && placesLoaded && notesLoaded && linksLoaded && chatLoaded;

  // Itinerary handlers
  const handleToggleEvent = (dayId: string, eventId: string) => {
    setItinerary(prev => prev.map(day =>
      day.id !== dayId ? day : {
        ...day,
        events: day.events.map(ev =>
          ev.id !== eventId ? ev : { ...ev, done: !ev.done }
        ),
      }
    ));
  };

  const handleAddEvent = (dayId: string, data: Omit<ItineraryEvent, 'id' | 'done'>) => {
    setItinerary(prev => prev.map(day =>
      day.id !== dayId ? day : {
        ...day,
        events: [...day.events, { ...data, id: genId(), done: false }],
      }
    ));
  };

  const handleEditEvent = (dayId: string, eventId: string, data: Omit<ItineraryEvent, 'id' | 'done'>) => {
    setItinerary(prev => prev.map(day =>
      day.id !== dayId ? day : {
        ...day,
        events: day.events.map(ev =>
          ev.id !== eventId ? ev : { ...data, id: ev.id, done: ev.done }
        ),
      }
    ));
  };

  const handleDeleteEvent = (dayId: string, eventId: string) => {
    setItinerary(prev => prev.map(day =>
      day.id !== dayId ? day : {
        ...day,
        events: day.events.filter(ev => ev.id !== eventId),
      }
    ));
  };

  const handleReorderEvents = (dayId: string, eventIds: string[]) => {
    setItinerary(prev => prev.map(day => {
      if (day.id !== dayId) return day;
      const map = new Map(day.events.map(ev => [ev.id, ev]));
      return { ...day, events: eventIds.map(id => map.get(id)!).filter(Boolean) };
    }));
  };

  const handleAddDay = () => {
    const dayNum = itinerary.length + 1;
    setItinerary(prev => [
      ...prev,
      { id: genId(), date: '', dayLabel: `Day ${dayNum}`, events: [] },
    ]);
  };

  const handleEditDayLabel = (dayId: string, label: string) => {
    setItinerary(prev => prev.map(day =>
      day.id !== dayId ? day : { ...day, dayLabel: label }
    ));
  };

  const handleDeleteDay = (dayId: string) => {
    setItinerary(prev => prev.filter(day => day.id !== dayId));
  };

  // AI handlers
  const handleAIAddToItinerary = (dayId: string, data: Omit<ItineraryEvent, 'id' | 'done'>) => {
    const targetId = itinerary.find(d => d.id === dayId)?.id ?? itinerary[0]?.id;
    if (targetId) handleAddEvent(targetId, data);
  };

  const handleAddPlace = (place: Omit<Place, 'id' | 'visited'>) => {
    setPlaces(prev => [...prev, { ...place, id: genId(), visited: false }]);
  };

  // Checklist handlers
  const handleToggleItem = (groupId: string, itemId: string) => {
    setChecklist(prev => prev.map(g =>
      g.id !== groupId ? g : {
        ...g,
        items: g.items.map(i => i.id !== itemId ? i : { ...i, checked: !i.checked }),
      }
    ));
  };

  const handleAddItem = (groupId: string, label: string) => {
    setChecklist(prev => prev.map(g =>
      g.id !== groupId ? g : {
        ...g,
        items: [...g.items, { id: genId(), label, checked: false }],
      }
    ));
  };

  const handleDeleteItem = (groupId: string, itemId: string) => {
    setChecklist(prev => prev.map(g =>
      g.id !== groupId ? g : {
        ...g,
        items: g.items.filter(i => i.id !== itemId),
      }
    ));
  };

  const handleAddGroup = (name: string) => {
    setChecklist(prev => [...prev, { id: genId(), name, items: [] }]);
  };

  const handleRenameGroup = (groupId: string, name: string) => {
    setChecklist(prev => prev.map(g => g.id !== groupId ? g : { ...g, name }));
  };

  const handleDeleteGroup = (groupId: string) => {
    setChecklist(prev => prev.filter(g => g.id !== groupId));
  };

  const handleResetAll = () => {
    setChecklist(prev => prev.map(g => ({
      ...g,
      items: g.items.map(i => ({ ...i, checked: false })),
    })));
  };

  // Meals handlers
  const handleUpdateMeal = (dayId: string, mealId: string, field: 'description' | 'notes' | 'type', value: string) => {
    setMeals(prev => prev.map(d =>
      d.id !== dayId ? d : {
        ...d,
        meals: d.meals.map(m => m.id !== mealId ? m : { ...m, [field]: value }),
      }
    ));
  };

  const handleAddMeal = (dayId: string, type: string) => {
    setMeals(prev => prev.map(d =>
      d.id !== dayId ? d : {
        ...d,
        meals: [...d.meals, { id: genId(), type, description: '', notes: '' }],
      }
    ));
  };

  const handleDeleteMeal = (dayId: string, mealId: string) => {
    setMeals(prev => prev.map(d =>
      d.id !== dayId ? d : {
        ...d,
        meals: d.meals.filter(m => m.id !== mealId),
      }
    ));
  };

  const handleClearDay = (dayId: string) => {
    setMeals(prev => prev.map(d =>
      d.id !== dayId ? d : { ...d, meals: [] }
    ));
  };

  // Places handlers
  const handleToggleVisited = (id: string) => {
    setPlaces(prev => prev.map(p => p.id !== id ? p : { ...p, visited: !p.visited }));
  };

  // Links handlers
  const handleAddLink = (label: string, url: string) => {
    setLinks(prev => [...prev, { id: genId(), label, url }]);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  if (!allLoaded) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
        <p className="text-sm text-stone-400 font-medium">Loading Ordo…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          <h1 className="text-base font-bold text-stone-800 tracking-tight">Ordo</h1>
          <p className="text-xs text-stone-400 font-medium mt-0.5">North Wales · 29–31 March 2026</p>
        </div>
      </header>

      <OfflineBanner isOnline={isOnline} />

      {activeTab === 'map' && (
        <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-57px-64px)]"><div className="w-5 h-5 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" /></div>}>
          <MapTab
            itinerary={itinerary}
            places={places}
            onAddPlace={handleAddPlace}
          />
        </Suspense>
      )}

      <main className={`max-w-2xl mx-auto pb-24 ${activeTab === 'map' ? 'hidden' : ''}`}>
        {activeTab === 'itinerary' && (
          <ItineraryTab
            days={itinerary}
            onToggleEvent={handleToggleEvent}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onReorderEvents={handleReorderEvents}
            onAddDay={handleAddDay}
            onEditDayLabel={handleEditDayLabel}
            onDeleteDay={handleDeleteDay}
          />
        )}
        {activeTab === 'checklist' && (
          <ChecklistTab
            groups={checklist}
            onToggleItem={handleToggleItem}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onAddGroup={handleAddGroup}
            onRenameGroup={handleRenameGroup}
            onDeleteGroup={handleDeleteGroup}
            onResetAll={handleResetAll}
          />
        )}
        {activeTab === 'meals' && (
          <MealsTab
            days={meals}
            onUpdateMeal={handleUpdateMeal}
            onAddMeal={handleAddMeal}
            onDeleteMeal={handleDeleteMeal}
            onClearDay={handleClearDay}
          />
        )}
        {activeTab === 'places' && (
          <PlacesTab places={places} onToggleVisited={handleToggleVisited} />
        )}
        {activeTab === 'notes' && (
          <NotesTab
            notes={notes}
            onNotesChange={setNotes}
            links={links}
            onAddLink={handleAddLink}
            onDeleteLink={handleDeleteLink}
          />
        )}
        {activeTab === 'chat' && (
          <ChatTab
            messages={chatMessages}
            onUpdateMessages={setChatMessages}
            itinerary={itinerary}
            places={places}
            onAddToItinerary={handleAIAddToItinerary}
            onAddToPlaces={handleAddPlace}
          />
        )}
      </main>

      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
