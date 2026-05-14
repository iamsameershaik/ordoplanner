import { useState, lazy, Suspense } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from './hooks/useDarkMode';
import type { Tab } from './components/TabBar';
import TabBar from './components/TabBar';
import ItineraryTab from './components/itinerary/ItineraryTab';
import ChecklistTab from './components/checklist/ChecklistTab';
import MealsTab from './components/meals/MealsTab';
import PlacesTab from './components/places/PlacesTab';
import NotesTab from './components/notes/NotesTab';
import ChatOverlay from './components/chat/ChatOverlay';
const MapTab = lazy(() => import('./components/map/MapTab'));
import OfflineBanner from './components/OfflineBanner';
import RemoteUpdateToast from './components/RemoteUpdateToast';
import TripLockedModal from './components/TripLockedModal';
import { useSupabaseState } from './hooks/useSupabaseState';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useRemoteUpdates } from './hooks/useRemoteUpdates';
import {
  initialItinerary,
  initialChecklist,
  initialMeals,
  initialPlaces,
  initialLinks,
} from './data/initialData';
import type {
  ItineraryDay,
  ChecklistGroup,
  DayMeals,
  Place,
  SavedLink,
  ChatMessage,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const [dark, setDark] = useDarkMode();
  const isOnline = useOnlineStatus();
  useRemoteUpdates();
  const [lockedModalOpen, setLockedModalOpen] = useState(false);

  const [itinerary, itineraryLoaded] = useSupabaseState<ItineraryDay[]>('nw_itinerary', initialItinerary);
  const [checklist, checklistLoaded] = useSupabaseState<ChecklistGroup[]>('nw_checklist', initialChecklist);
  const [meals, mealsLoaded] = useSupabaseState<DayMeals[]>('nw_meals', initialMeals);
  const [places, placesLoaded] = useSupabaseState<Place[]>('nw_places', initialPlaces);
  const [notes, notesLoaded] = useSupabaseState<string>('nw_notes', '');
  const [links, linksLoaded] = useSupabaseState<SavedLink[]>('nw_links', initialLinks);
  const [chatMessages, chatLoaded] = useSupabaseState<ChatMessage[]>('nw_chat', []);

  const allLoaded = itineraryLoaded && checklistLoaded && mealsLoaded && placesLoaded && notesLoaded && linksLoaded && chatLoaded;

  const showLocked = () => setLockedModalOpen(true);

  const handleToggleEvent = showLocked;
  const handleAddEvent = showLocked;
  const handleEditEvent = showLocked;
  const handleDeleteEvent = showLocked;
  const handleReorderEvents = showLocked;
  const handleAddDay = showLocked;
  const handleEditDayLabel = showLocked;
  const handleDeleteDay = showLocked;
  const handleAIAddToItinerary = showLocked;
  const handleAddPlace = showLocked;
  const handleToggleItem = showLocked;
  const handleAddItem = showLocked;
  const handleDeleteItem = showLocked;
  const handleAddGroup = showLocked;
  const handleRenameGroup = showLocked;
  const handleDeleteGroup = showLocked;
  const handleResetAll = showLocked;
  const handleUpdateMeal = showLocked;
  const handleAddMeal = showLocked;
  const handleDeleteMeal = showLocked;
  const handleClearDay = showLocked;
  const handleToggleVisited = showLocked;
  const handleAddLink = showLocked;
  const handleDeleteLink = showLocked;

  if (!allLoaded) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-stone-200 dark:border-slate-700 border-t-stone-700 dark:border-t-slate-300 rounded-full animate-spin" />
        <p className="text-sm text-stone-400 dark:text-slate-400 font-medium tracking-wide">Loading Ordo</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-900">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-slate-700/80">
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-2 flex-1">
              <h1 className="text-base font-bold text-stone-900 dark:text-slate-100 tracking-tight">Ordo</h1>
              <span className="text-stone-300 dark:text-slate-600 text-xs">·</span>
              <p className="text-xs text-stone-400 dark:text-slate-400 font-medium">North Wales · 29–31 March 2026</p>
            </div>
            <button
              onClick={() => setDark(d => !d)}
              className="p-1.5 rounded-lg text-stone-400 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      <OfflineBanner isOnline={isOnline} />
      <RemoteUpdateToast />

      {activeTab === 'map' && (
        <Suspense fallback={
          <div className="flex items-center justify-center h-[calc(100vh-57px-64px)] bg-stone-50 dark:bg-slate-900">
            <div className="w-5 h-5 border-2 border-stone-200 dark:border-slate-700 border-t-stone-600 dark:border-t-slate-300 rounded-full animate-spin" />
          </div>
        }>
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
            onNotesChange={showLocked}
            links={links}
            onAddLink={handleAddLink}
            onDeleteLink={handleDeleteLink}
          />
        )}
      </main>

      <TabBar active={activeTab} onChange={setActiveTab} />

      <ChatOverlay
        messages={chatMessages}
        onUpdateMessages={showLocked}
        itinerary={itinerary}
        places={places}
        onAddToItinerary={handleAIAddToItinerary}
        onAddToPlaces={handleAddPlace}
      />

      <TripLockedModal isOpen={lockedModalOpen} onClose={() => setLockedModalOpen(false)} />
    </div>
  );
}
