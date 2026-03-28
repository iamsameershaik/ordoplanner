import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ItineraryDay, ItineraryEvent } from '../../types';

interface ItineraryTabProps {
  days: ItineraryDay[];
  onToggleEvent: (dayId: string, eventId: string) => void;
}

function EventCard({ event, onToggle }: { event: ItineraryEvent; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full text-left flex gap-3 group"
    >
      <div className="flex flex-col items-center mt-1">
        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${
          event.done ? 'bg-slate-300 border-slate-300' : 'border-slate-400 bg-white group-hover:border-slate-600'
        }`} />
        <div className="w-px flex-1 bg-slate-100 mt-1" />
      </div>
      <div className={`flex-1 pb-5 transition-opacity ${event.done ? 'opacity-40' : ''}`}>
        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-0.5 flex-shrink-0">{event.time}</span>
          {event.ownExpense && (
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200 rounded px-1.5 py-0.5 flex-shrink-0">
              own expense
            </span>
          )}
        </div>
        <p className={`text-sm font-semibold text-slate-800 mt-0.5 ${event.done ? 'line-through' : ''}`}>
          {event.title}
        </p>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{event.description}</p>
      </div>
    </button>
  );
}

function DaySection({ day, onToggleEvent }: { day: ItineraryDay; onToggleEvent: (eventId: string) => void }) {
  const [open, setOpen] = useState(true);
  const doneCount = day.events.filter(e => e.done).length;
  const total = day.events.length;
  const progress = total > 0 ? (doneCount / total) * 100 : 0;

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 px-4 bg-white sticky top-[57px] z-10 border-b border-slate-100"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
          <span className="text-sm font-semibold text-slate-700">{day.dayLabel}</span>
        </div>
        <span className="text-xs text-slate-400 font-medium">{doneCount} / {total}</span>
      </button>
      {open && (
        <div className="px-4 pt-3">
          <div className="h-1 bg-slate-100 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-slate-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {day.events.map((event, index) => (
            <div key={event.id} className={index === day.events.length - 1 ? 'last-event' : ''}>
              <EventCard event={event} onToggle={() => onToggleEvent(event.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ItineraryTab({ days, onToggleEvent }: ItineraryTabProps) {
  return (
    <div>
      {days.map(day => (
        <DaySection
          key={day.id}
          day={day}
          onToggleEvent={(eventId) => onToggleEvent(day.id, eventId)}
        />
      ))}
    </div>
  );
}
