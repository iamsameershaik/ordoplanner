import { useState } from 'react';
import type { Tab } from './components/TabBar';
import TabBar from './components/TabBar';
import ItineraryTab from './components/itinerary/ItineraryTab';
import ChecklistTab from './components/checklist/ChecklistTab';
import MealsTab from './components/meals/MealsTab';
import PlacesTab from './components/places/PlacesTab';
import NotesTab from './components/notes/NotesTab';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  initialItinerary,
  initialChecklist,
  initialMeals,
  initialPlaces,
  initialLinks,
} from './data/initialData';
import type { ItineraryDay, ChecklistGroup, DayMeals, Place, SavedLink } from './types';

function genId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const [itinerary, setItinerary] = useLocalStorage<ItineraryDay[]>('nw_itinerary', initialItinerary);
  const [checklist, setChecklist] = useLocalStorage<ChecklistGroup[]>('nw_checklist', initialChecklist);
  const [meals, setMeals] = useLocalStorage<DayMeals[]>('nw_meals', initialMeals);
  const [places, setPlaces] = useLocalStorage<Place[]>('nw_places', initialPlaces);
  const [notes, setNotes] = useLocalStorage<string>('nw_notes', '');
  const [links, setLinks] = useLocalStorage<SavedLink[]>('nw_links', initialLinks);

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

  // Notes handlers
  const handleAddLink = (label: string, url: string) => {
    setLinks(prev => [...prev, { id: genId(), label, url }]);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          <h1 className="text-base font-bold text-slate-800 tracking-tight">North Wales Trip 🏔️</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">29–31 March 2026</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-24">
        {activeTab === 'itinerary' && (
          <ItineraryTab days={itinerary} onToggleEvent={handleToggleEvent} />
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
      </main>

      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
