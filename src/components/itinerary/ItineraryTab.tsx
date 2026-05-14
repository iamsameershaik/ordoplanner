import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, GripVertical, Pencil, Trash2, Plus, MapPin, ExternalLink } from 'lucide-react';
import TripLockedModal from '../TripLockedModal';
import type { ItineraryDay, ItineraryEvent } from '../../types';

const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
  travel: 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  dining: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  accommodation: 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
  activity: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  other: 'bg-stone-50 text-stone-400 border-stone-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600',
};

const CATEGORY_LABELS: Record<string, string> = {
  sightseeing: '🏛️ Sightseeing',
  travel: '🚌 Travel',
  dining: '🍽️ Dining',
  accommodation: '🏨 Stay',
  activity: '🥾 Activity',
  other: '📌 Other',
};

function buildMapUrl(event: ItineraryEvent): string | null {
  if (event.location?.lat && event.location?.lng) {
    return `https://www.google.com/maps?q=${event.location.lat},${event.location.lng}`;
  }
  if (event.location?.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.address)}`;
  }
  return null;
}

interface SortableEventCardProps {
  event: ItineraryEvent;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableEventCard({ event, onToggle, onEdit, onDelete }: SortableEventCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const displayTime = event.startTime || event.time;
  const mapUrl = buildMapUrl(event);

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 group mb-1">
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 flex items-start pt-3 text-stone-300 dark:text-slate-600 hover:text-stone-400 dark:hover:text-slate-400 transition-colors touch-none cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      <div className="flex flex-col items-center mt-3 mr-1">
        <button
          onClick={onToggle}
          className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${
            event.done ? 'bg-stone-300 border-stone-300 dark:bg-slate-600 dark:border-slate-600' : 'border-stone-400 bg-white dark:bg-slate-800 dark:border-slate-500 hover:border-stone-600'
          }`}
        />
        <div className="w-px flex-1 bg-stone-100 dark:bg-slate-700 mt-1.5" />
      </div>

      <div className={`flex-1 pb-5 min-w-0 transition-opacity ${event.done ? 'opacity-40' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            <span className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wide flex-shrink-0">
              {displayTime}
              {event.endTime && <span className="font-normal"> – {event.endTime}</span>}
            </span>
            {event.ownExpense && (
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200 rounded px-1.5 py-0.5 flex-shrink-0 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                own expense
              </span>
            )}
            {event.category && (
              <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 flex-shrink-0 ${CATEGORY_COLORS[event.category] ?? 'bg-stone-50 text-stone-400 border-stone-200'}`}>
                {CATEGORY_LABELS[event.category] ?? event.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1 text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-200 transition-colors" aria-label="Edit event">
              <Pencil size={13} />
            </button>
            <button onClick={onDelete} className="p-1 text-stone-300 dark:text-slate-600 hover:text-red-400 transition-colors" aria-label="Delete event">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <p className={`text-sm font-semibold text-stone-800 dark:text-slate-100 mt-0.5 ${event.done ? 'line-through' : ''}`}>
          {event.title}
        </p>
        {event.description && (
          <p className="text-sm text-stone-500 dark:text-slate-400 mt-1 leading-relaxed">{event.description}</p>
        )}
        {event.notes && (
          <p className="text-xs text-stone-400 dark:text-slate-500 mt-1 leading-relaxed italic">{event.notes}</p>
        )}
        {(event.location?.address || mapUrl) && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin size={11} className="text-stone-400 dark:text-slate-500 flex-shrink-0" />
            <span className="text-xs text-stone-400 dark:text-slate-500 flex-1 min-w-0 truncate">{event.location?.address}</span>
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs font-medium text-stone-600 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 transition-colors flex-shrink-0"
              >
                <ExternalLink size={11} />
                Map
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface DaySectionProps {
  day: ItineraryDay;
  onAddDay: () => void;
}

function DaySection({ day, onAddDay: _onAddDay }: DaySectionProps) {
  const [open, setOpen] = useState(true);
  const [lockedOpen, setLockedOpen] = useState(false);
  const showLocked = () => setLockedOpen(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const doneCount = day.events.filter((e) => e.done).length;
  const total = day.events.length;
  const progress = total > 0 ? (doneCount / total) * 100 : 0;

  function handleDragEnd(e: DragEndEvent) {
    if (e.active.id !== e.over?.id) showLocked();
  }

  return (
    <div className="mb-1">
      <div className="flex items-center px-4 py-3 bg-stone-50 dark:bg-slate-800/50 sticky top-[57px] z-10 border-b border-stone-100 dark:border-slate-700">
        <button onClick={() => setOpen((o) => !o)} className="mr-2 text-stone-400 dark:text-slate-500">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <button
          className="flex-1 text-left text-sm font-semibold text-stone-700 dark:text-slate-200 flex items-center gap-1.5"
        >
          {day.dayLabel}
        </button>

        <div className="flex items-center gap-3 ml-2 flex-shrink-0">
          <span className="text-xs text-stone-400 dark:text-slate-500 font-medium">{doneCount} / {total}</span>
          <button
            onClick={showLocked}
            className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Add event"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={showLocked}
            className="text-stone-300 dark:text-slate-600 hover:text-red-400 transition-colors"
            aria-label="Delete day"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pt-3">
          <div className="h-1 bg-stone-100 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-stone-400 dark:bg-slate-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {day.events.length === 0 && (
            <p className="text-sm text-stone-400 dark:text-slate-500 italic py-2 pb-4">
              No events — tap + to add the first one
            </p>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={day.events.map((e) => e.id)} strategy={verticalListSortingStrategy}>
              {day.events.map((event) => (
                <SortableEventCard
                  key={event.id}
                  event={event}
                  onToggle={showLocked}
                  onEdit={showLocked}
                  onDelete={showLocked}
                />
              ))}
            </SortableContext>
          </DndContext>

          <button
            onClick={showLocked}
            className="flex items-center gap-2 text-xs font-medium text-stone-400 dark:text-slate-500 hover:text-stone-600 dark:hover:text-slate-300 transition-colors py-2 mb-2"
          >
            <Plus size={14} />
            Add event
          </button>
        </div>
      )}

      <TripLockedModal isOpen={lockedOpen} onClose={() => setLockedOpen(false)} />
    </div>
  );
}

interface ItineraryTabProps {
  days: ItineraryDay[];
  onToggleEvent: () => void;
  onAddEvent: () => void;
  onEditEvent: () => void;
  onDeleteEvent: () => void;
  onReorderEvents: () => void;
  onAddDay: () => void;
  onEditDayLabel: () => void;
  onDeleteDay: () => void;
}

export default function ItineraryTab({ days, onAddDay }: ItineraryTabProps) {
  return (
    <div>
      {days.map((day) => (
        <DaySection
          key={day.id}
          day={day}
          onAddDay={onAddDay}
        />
      ))}
      <div className="px-4 py-4">
        <button
          disabled
          className="flex items-center gap-2 text-sm font-medium text-stone-400 dark:text-slate-500 border border-dashed border-stone-300 dark:border-slate-600 rounded-xl px-4 py-3 w-full justify-center transition-colors opacity-40 cursor-not-allowed"
        >
          <Plus size={15} />
          Add day
        </button>
      </div>
    </div>
  );
}
