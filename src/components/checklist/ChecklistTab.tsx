import { useState, useRef } from 'react';
import { Plus, Trash2, Check, RotateCcw } from 'lucide-react';
import type { ChecklistGroup } from '../../types';
import ConfirmModal from '../ConfirmModal';

interface ChecklistTabProps {
  groups: ChecklistGroup[];
  onToggleItem: (groupId: string, itemId: string) => void;
  onAddItem: (groupId: string, label: string) => void;
  onDeleteItem: (groupId: string, itemId: string) => void;
  onAddGroup: (name: string) => void;
  onRenameGroup: (groupId: string, name: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onResetAll: () => void;
}

interface GroupSectionProps {
  group: ChecklistGroup;
  onToggleItem: (itemId: string) => void;
  onAddItem: (label: string) => void;
  onDeleteItem: (itemId: string) => void;
  onRenameGroup: (name: string) => void;
  onDeleteGroup: () => void;
}

function GroupSection({ group, onToggleItem, onAddItem, onDeleteItem, onRenameGroup, onDeleteGroup }: GroupSectionProps) {
  const [newItem, setNewItem] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(group.name);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [showDeleteGroup, setShowDeleteGroup] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const checkedCount = group.items.filter(i => i.checked).length;

  const handleAddItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onAddItem(trimmed);
    setNewItem('');
  };

  const handleNameSave = () => {
    const trimmed = nameValue.trim();
    if (trimmed) onRenameGroup(trimmed);
    else setNameValue(group.name);
    setEditingName(false);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        {editingName ? (
          <input
            ref={nameInputRef}
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') { setNameValue(group.name); setEditingName(false); } }}
            className="text-sm font-semibold text-stone-700 bg-transparent border-b border-stone-400 outline-none flex-1 py-0.5"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setEditingName(true); setTimeout(() => nameInputRef.current?.focus(), 0); }}
            className="text-sm font-semibold text-stone-700 hover:text-stone-900 transition-colors text-left"
          >
            {group.name}
          </button>
        )}
        <div className="flex items-center gap-3 ml-2">
          <span className="text-xs text-stone-400 font-medium whitespace-nowrap">{checkedCount} / {group.items.length} packed</span>
          <button
            onClick={() => setShowDeleteGroup(true)}
            className="text-stone-300 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="border border-stone-200 rounded-xl overflow-hidden">
        {group.items.length === 0 && (
          <div className="px-4 py-3 text-sm text-stone-400 italic">Nothing here yet — add something below</div>
        )}
        {group.items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3 ${idx < group.items.length - 1 ? 'border-b border-stone-100' : ''}`}
          >
            <button
              onClick={() => onToggleItem(item.id)}
              className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                item.checked ? 'bg-stone-700 border-stone-700' : 'border-stone-300 bg-white hover:border-stone-500'
              }`}
            >
              {item.checked && <Check size={12} strokeWidth={3} className="text-white" />}
            </button>
            <span className={`flex-1 text-sm ${item.checked ? 'line-through text-stone-400' : 'text-stone-700'}`}>
              {item.label}
            </span>
            <button
              onClick={() => setDeleteItemId(item.id)}
              className="text-stone-200 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <div className="flex gap-2 px-4 py-3 border-t border-stone-100 bg-stone-50">
          <input
            type="text"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddItem(); }}
            placeholder="Add item…"
            className="flex-1 text-sm bg-transparent outline-none text-stone-700 placeholder:text-stone-400"
          />
          <button
            onClick={handleAddItem}
            className="text-stone-500 hover:text-stone-700 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteItemId !== null}
        title="Delete item"
        message="Remove this item from the list?"
        confirmLabel="Delete"
        onConfirm={() => { if (deleteItemId) { onDeleteItem(deleteItemId); setDeleteItemId(null); } }}
        onCancel={() => setDeleteItemId(null)}
      />
      <ConfirmModal
        isOpen={showDeleteGroup}
        title="Delete group"
        message={`Delete the "${group.name}" group and all its items?`}
        confirmLabel="Delete"
        onConfirm={() => { onDeleteGroup(); setShowDeleteGroup(false); }}
        onCancel={() => setShowDeleteGroup(false)}
      />
    </div>
  );
}

export default function ChecklistTab({ groups, onToggleItem, onAddItem, onDeleteItem, onAddGroup, onRenameGroup, onDeleteGroup, onResetAll }: ChecklistTabProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [showReset, setShowReset] = useState(false);

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
  const totalChecked = groups.reduce((sum, g) => sum + g.items.filter(i => i.checked).length, 0);
  const globalProgress = totalItems > 0 ? (totalChecked / totalItems) * 100 : 0;

  const handleAddGroup = () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    onAddGroup(trimmed);
    setNewGroupName('');
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Overall progress</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">{totalChecked} / {totalItems}</span>
            <button
              onClick={() => setShowReset(true)}
              className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-stone-600 rounded-full transition-all duration-300"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
      </div>

      {groups.map(group => (
        <GroupSection
          key={group.id}
          group={group}
          onToggleItem={(itemId) => onToggleItem(group.id, itemId)}
          onAddItem={(label) => onAddItem(group.id, label)}
          onDeleteItem={(itemId) => onDeleteItem(group.id, itemId)}
          onRenameGroup={(name) => onRenameGroup(group.id, name)}
          onDeleteGroup={() => onDeleteGroup(group.id)}
        />
      ))}

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newGroupName}
          onChange={e => setNewGroupName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddGroup(); }}
          placeholder="New group name…"
          className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-stone-400 text-stone-700 placeholder:text-stone-400 bg-white"
        />
        <button
          onClick={handleAddGroup}
          className="px-4 py-2.5 text-sm font-medium bg-stone-700 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-1.5"
        >
          <Plus size={15} />
          New group
        </button>
      </div>

      <ConfirmModal
        isOpen={showReset}
        title="Reset all ticks"
        message="This will untick all items. Your items won't be deleted."
        confirmLabel="Reset"
        onConfirm={() => { onResetAll(); setShowReset(false); }}
        onCancel={() => setShowReset(false)}
      />
    </div>
  );
}
