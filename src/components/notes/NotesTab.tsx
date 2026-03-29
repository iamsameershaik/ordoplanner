import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import type { SavedLink } from '../../types';
import ConfirmModal from '../ConfirmModal';

interface NotesTabProps {
  notes: string;
  onNotesChange: (v: string) => void;
  links: SavedLink[];
  onAddLink: (label: string, url: string) => void;
  onDeleteLink: (id: string) => void;
}

export default function NotesTab({ notes, onNotesChange, links, onAddLink, onDeleteLink }: NotesTabProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null);
  const [showClear, setShowClear] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleNotesChange = (v: string) => {
    onNotesChange(v);
    setLastSaved(new Date());
    setSecondsAgo(0);
  };

  useEffect(() => {
    if (lastSaved === null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      setSecondsAgo(diff);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lastSaved]);

  const handleAddLink = () => {
    const label = newLabel.trim();
    const url = newUrl.trim();
    if (!label || !url) return;
    onAddLink(label, url);
    setNewLabel('');
    setNewUrl('');
  };

  const savedText = lastSaved === null
    ? 'Auto-saves as you type'
    : secondsAgo === 0
    ? 'Saved just now'
    : `Saved ${secondsAgo}s ago`;

  return (
    <div className="px-4 py-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-slate-200">Notes</h3>
          <button
            onClick={() => setShowClear(true)}
            className="text-xs text-stone-400 dark:text-slate-500 hover:text-red-400 transition-colors"
          >
            Clear notes
          </button>
        </div>
        <textarea
          value={notes}
          onChange={e => handleNotesChange(e.target.value)}
          placeholder="Jot down anything — plans, ideas, reminders…"
          rows={10}
          className="w-full border border-stone-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-stone-700 dark:text-slate-200 placeholder:text-stone-400 dark:placeholder:text-slate-500 outline-none focus:border-stone-400 dark:focus:border-slate-500 resize-none leading-relaxed bg-white dark:bg-slate-800"
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-stone-400 dark:text-slate-500">{savedText}</span>
          <span className="text-xs text-stone-300 dark:text-slate-600">{notes.length} chars</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-stone-700 dark:text-slate-200 mb-3">Links</h3>

        {links.length === 0 && (
          <p className="text-sm text-stone-400 dark:text-slate-500 italic mb-4">Nothing here yet — add something +</p>
        )}

        <div className="flex flex-col gap-2 mb-4">
          {links.map(link => (
            <div
              key={link.id}
              className="flex items-center gap-3 border border-stone-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 group"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 flex items-center gap-2"
              >
                <ExternalLink size={14} className="text-stone-400 dark:text-slate-500 flex-shrink-0" />
                <span className="text-sm font-medium text-stone-700 dark:text-slate-200 hover:text-stone-900 dark:hover:text-slate-50 truncate transition-colors">
                  {link.label}
                </span>
              </a>
              <button
                onClick={() => setDeleteLinkId(link.id)}
                className="text-stone-200 dark:text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="border border-stone-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Label (e.g. Conwy Castle tickets)"
            className="w-full px-4 py-3 text-sm outline-none border-b border-stone-100 dark:border-slate-700 text-stone-700 dark:text-slate-200 placeholder:text-stone-400 dark:placeholder:text-slate-500 bg-transparent"
          />
          <input
            type="url"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddLink(); }}
            placeholder="URL (https://…)"
            className="w-full px-4 py-3 text-sm outline-none text-stone-700 dark:text-slate-200 placeholder:text-stone-400 dark:placeholder:text-slate-500 bg-transparent"
          />
          <div className="px-4 py-2.5 bg-stone-50 dark:bg-slate-800/50 border-t border-stone-100 dark:border-slate-700">
            <button
              onClick={handleAddLink}
              className="flex items-center gap-1.5 text-sm font-medium text-stone-600 dark:text-slate-300 hover:text-stone-800 dark:hover:text-slate-100 transition-colors"
            >
              <Plus size={15} />
              Add link
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClear}
        title="Clear notes"
        message="This will permanently delete all your notes."
        confirmLabel="Clear"
        onConfirm={() => { onNotesChange(''); setLastSaved(new Date()); setShowClear(false); }}
        onCancel={() => setShowClear(false)}
      />
      <ConfirmModal
        isOpen={deleteLinkId !== null}
        title="Delete link"
        message="Remove this saved link?"
        confirmLabel="Delete"
        onConfirm={() => { if (deleteLinkId) { onDeleteLink(deleteLinkId); setDeleteLinkId(null); } }}
        onCancel={() => setDeleteLinkId(null)}
      />
    </div>
  );
}
