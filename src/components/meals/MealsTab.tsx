import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { DayMeals, Meal } from '../../types';
import ConfirmModal from '../ConfirmModal';

interface MealsTabProps {
  days: DayMeals[];
  onUpdateMeal: (dayId: string, mealId: string, field: 'description' | 'notes' | 'type', value: string) => void;
  onAddMeal: (dayId: string, type: string) => void;
  onDeleteMeal: (dayId: string, mealId: string) => void;
  onClearDay: (dayId: string) => void;
}

function EditableCell({ value, onSave, placeholder, className = '' }: { value: string; onSave: (v: string) => void; placeholder?: string; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setVal(value); }, [value]);

  const save = () => {
    setEditing(false);
    onSave(val);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setVal(value); setEditing(false); } }}
        autoFocus
        placeholder={placeholder}
        className={`w-full bg-stone-50 dark:bg-slate-700 border border-stone-300 dark:border-slate-600 rounded px-2 py-1 text-sm outline-none focus:border-stone-500 dark:focus:border-slate-400 text-stone-800 dark:text-slate-100 ${className}`}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`w-full text-left text-sm px-2 py-1 rounded hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors ${value ? 'text-stone-700 dark:text-slate-200' : 'text-stone-400 dark:text-slate-500 italic'} ${className}`}
    >
      {value || placeholder || 'Tap to edit…'}
    </button>
  );
}

function MealRow({ meal, onUpdate, onDelete }: { meal: Meal; onUpdate: (field: 'description' | 'notes' | 'type', v: string) => void; onDelete: () => void }) {
  const [showDelete, setShowDelete] = useState(false);
  return (
    <div className="flex gap-2 items-start py-3 border-b border-stone-100 dark:border-slate-700 last:border-0 group">
      <div className="w-20 flex-shrink-0">
        <EditableCell
          value={meal.type}
          onSave={v => onUpdate('type', v)}
          placeholder="Type"
          className="font-semibold text-stone-600 dark:text-slate-300 text-xs"
        />
      </div>
      <div className="flex-1 min-w-0">
        <EditableCell
          value={meal.description}
          onSave={v => onUpdate('description', v)}
          placeholder="What are you eating?"
        />
        <EditableCell
          value={meal.notes}
          onSave={v => onUpdate('notes', v)}
          placeholder="Notes / emoji…"
          className="text-stone-400 dark:text-slate-500 text-xs mt-0.5"
        />
      </div>
      <button
        onClick={() => setShowDelete(true)}
        className="text-stone-200 dark:text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
      <ConfirmModal
        isOpen={showDelete}
        title="Delete meal"
        message="Remove this meal entry?"
        confirmLabel="Delete"
        onConfirm={onDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

function DaySection({ day, onUpdateMeal, onAddMeal, onDeleteMeal, onClearDay }: {
  day: DayMeals;
  onUpdateMeal: (mealId: string, field: 'description' | 'notes' | 'type', value: string) => void;
  onAddMeal: (type: string) => void;
  onDeleteMeal: (mealId: string) => void;
  onClearDay: () => void;
}) {
  const [newType, setNewType] = useState('');
  const [showClear, setShowClear] = useState(false);

  const handleAdd = () => {
    const t = newType.trim() || 'Extra';
    onAddMeal(t);
    setNewType('');
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-slate-200">{day.dayLabel}</h3>
        <button
          onClick={() => setShowClear(true)}
          className="text-xs text-stone-400 dark:text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <X size={12} />
          Clear day
        </button>
      </div>

      <div className="border border-stone-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 px-4">
        {day.meals.length === 0 && (
          <div className="py-4 text-sm text-stone-400 dark:text-slate-500 italic text-center">Nothing here yet — add something +</div>
        )}
        {day.meals.map(meal => (
          <MealRow
            key={meal.id}
            meal={meal}
            onUpdate={(field, v) => onUpdateMeal(meal.id, field, v)}
            onDelete={() => onDeleteMeal(meal.id)}
          />
        ))}
        <div className="flex gap-2 py-3 border-t border-stone-100 dark:border-slate-700">
          <input
            type="text"
            value={newType}
            onChange={e => setNewType(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="Meal type (e.g. Coffee stop)…"
            className="flex-1 text-sm bg-transparent outline-none text-stone-700 dark:text-slate-200 placeholder:text-stone-400 dark:placeholder:text-slate-500"
          />
          <button
            onClick={handleAdd}
            className="text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClear}
        title="Clear day"
        message={`Remove all meals for ${day.dayLabel}?`}
        confirmLabel="Clear"
        onConfirm={() => { onClearDay(); setShowClear(false); }}
        onCancel={() => setShowClear(false)}
      />
    </div>
  );
}

export default function MealsTab({ days, onUpdateMeal, onAddMeal, onDeleteMeal, onClearDay }: MealsTabProps) {
  return (
    <div className="px-4 py-4">
      {days.map(day => (
        <DaySection
          key={day.id}
          day={day}
          onUpdateMeal={(mealId, field, value) => onUpdateMeal(day.id, mealId, field, value)}
          onAddMeal={(type) => onAddMeal(day.id, type)}
          onDeleteMeal={(mealId) => onDeleteMeal(day.id, mealId)}
          onClearDay={() => onClearDay(day.id)}
        />
      ))}
    </div>
  );
}
