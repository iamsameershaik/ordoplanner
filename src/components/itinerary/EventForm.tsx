import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import type { ItineraryEvent, EventCategory } from '../../types';

interface EventFormProps {
  initial?: Partial<ItineraryEvent>;
  onSave: (event: Omit<ItineraryEvent, 'id' | 'done'>) => void;
  onClose: () => void;
}

const CATEGORIES: { value: EventCategory; label: string; emoji: string }[] = [
  { value: 'sightseeing', label: 'Sightseeing', emoji: '🏛️' },
  { value: 'travel', label: 'Travel', emoji: '🚌' },
  { value: 'dining', label: 'Dining', emoji: '🍽️' },
  { value: 'accommodation', label: 'Stay', emoji: '🏨' },
  { value: 'activity', label: 'Activity', emoji: '🥾' },
  { value: 'other', label: 'Other', emoji: '📌' },
];

export default function EventForm({ initial, onSave, onClose }: EventFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [startTime, setStartTime] = useState(initial?.startTime ?? initial?.time ?? '');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [address, setAddress] = useState(initial?.location?.address ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [category, setCategory] = useState<EventCategory>(initial?.category ?? 'sightseeing');
  const [ownExpense, setOwnExpense] = useState(initial?.ownExpense ?? false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      time: startTime || 'TBD',
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      title: title.trim(),
      description: description.trim(),
      location: address.trim() ? { address: address.trim() } : undefined,
      notes: notes.trim() || undefined,
      category,
      ownExpense,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl border border-stone-200 shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-800">
            {initial?.title ? 'Edit event' : 'New event'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Conwy Castle visit"
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 bg-stone-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Start time
              </label>
              <input
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 10:00am"
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 bg-stone-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                End time
              </label>
              <input
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="e.g. 12:00pm"
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 bg-stone-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    category === cat.value
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's happening at this stop?"
              rows={2}
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 resize-none bg-stone-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1"><MapPin size={11} />Location</span>
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Conwy Castle, LL32 8AY"
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 bg-stone-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes, tips, reminders…"
              rows={2}
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 resize-none bg-stone-50"
            />
          </div>

          <button
            onClick={() => setOwnExpense((v) => !v)}
            className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              ownExpense
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-stone-300'
            }`}
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              ownExpense ? 'bg-amber-500 border-amber-500' : 'border-stone-300'
            }`}>
              {ownExpense && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
            </div>
            Own expense
          </button>
        </div>

        <div className="px-5 py-4 border-t border-stone-100 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-stone-800 rounded-xl hover:bg-stone-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {initial?.title ? 'Save changes' : 'Add event'}
          </button>
        </div>
      </div>
    </div>
  );
}
