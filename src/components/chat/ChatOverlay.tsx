import { useState, useRef, useEffect } from 'react';
import { Send, Plus, MapPin, User, Trash2, ArrowLeft, Sparkles, Lock } from 'lucide-react';
import type { ChatMessage, ItineraryDay, Place, ParsedAction, ItineraryEvent } from '../../types';
import TripLockedModal from '../TripLockedModal';

interface ChatOverlayProps {
  messages: ChatMessage[];
  onUpdateMessages: (msgs: ChatMessage[]) => void;
  itinerary: ItineraryDay[];
  places: Place[];
  onAddToItinerary: (dayId: string, event: Omit<ItineraryEvent, 'id' | 'done'>) => void;
  onAddToPlaces: (place: Omit<Place, 'id' | 'visited'>) => void;
}

function parseActions(content: string): ParsedAction[] {
  const actions: ParsedAction[] = [];
  const regex = /<action type="([^"]+)">([\s\S]*?)<\/action>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      const payload = JSON.parse(match[2]) as Record<string, unknown>;
      actions.push({ type: match[1] as ParsedAction['type'], payload });
    } catch {}
  }
  return actions;
}

function stripActions(content: string): string {
  return content.replace(/<action type="[^"]+">[\s\S]*?<\/action>/g, '').trim();
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-stone-100 dark:bg-slate-700 text-stone-700 dark:text-slate-200 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/^### (.+)$/gm, '<p class="text-sm font-bold text-stone-800 dark:text-slate-100 mt-3 mb-1">$1</p>')
    .replace(/^## (.+)$/gm, '<p class="text-base font-bold text-stone-800 dark:text-slate-100 mt-3 mb-1">$1</p>')
    .replace(/^# (.+)$/gm, '<p class="text-base font-bold text-stone-800 dark:text-slate-100 mt-3 mb-1">$1</p>')
    .replace(/^[-•] (.+)$/gm, '<li class="ml-4 list-disc text-stone-700 dark:text-slate-300">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

interface ActionButtonsProps {
  actions: ParsedAction[];
  itinerary: ItineraryDay[];
  onAddToItinerary: (dayId: string, event: Omit<ItineraryEvent, 'id' | 'done'>) => void;
  onAddToPlaces: (place: Omit<Place, 'id' | 'visited'>) => void;
}

function ActionButtons({ actions, itinerary, onAddToItinerary, onAddToPlaces }: ActionButtonsProps) {
  const [done, setDone] = useState<Set<number>>(new Set());
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-3">
      {actions.map((action, idx) => {
        if (done.has(idx)) {
          return (
            <div key={idx} className="flex items-center gap-2 text-xs text-stone-400 dark:text-slate-500 font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
              Added successfully
            </div>
          );
        }
        if (action.type === 'add_itinerary') {
          const payload = action.payload as { dayId?: string; event?: Partial<ItineraryEvent> };
          const dayId = payload.dayId ?? itinerary[0]?.id ?? '';
          const ev = payload.event ?? {};
          const day = itinerary.find((d) => d.id === dayId) ?? itinerary[0];
          return (
            <button
              key={idx}
              onClick={() => {
                onAddToItinerary(dayId, {
                  time: (ev.startTime as string) || (ev.time as string) || 'TBD',
                  startTime: ev.startTime as string | undefined,
                  title: (ev.title as string) || 'New Event',
                  description: (ev.description as string) || '',
                  category: ev.category as ItineraryEvent['category'],
                  ownExpense: false,
                });
                setDone((prev) => new Set(prev).add(idx));
              }}
              className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-slate-200 bg-stone-100 dark:bg-slate-700 active:bg-stone-200 dark:active:bg-slate-600 border border-stone-200 dark:border-slate-600 rounded-xl px-3 py-2.5 transition-colors text-left"
            >
              <Plus size={13} />
              Add to Itinerary — {day?.dayLabel ?? 'Day 1'}
            </button>
          );
        }
        if (action.type === 'add_place') {
          const payload = action.payload as Partial<Place>;
          return (
            <button
              key={idx}
              onClick={() => {
                onAddToPlaces({
                  emoji: payload.emoji ?? '📍',
                  name: (payload.name as string) || 'New Place',
                  description: (payload.description as string) || '',
                  shotTip: (payload.shotTip as string) || '',
                });
                setDone((prev) => new Set(prev).add(idx));
              }}
              className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-slate-200 bg-stone-100 dark:bg-slate-700 active:bg-stone-200 dark:active:bg-slate-600 border border-stone-200 dark:border-slate-600 rounded-xl px-3 py-2.5 transition-colors text-left"
            >
              <MapPin size={13} />
              Add to Places — {payload.name as string || 'New Place'}
            </button>
          );
        }
        return null;
      })}
    </div>
  );
}

const SUGGESTIONS = [
  'What should I pack for hiking in North Wales?',
  'Recommend a restaurant in Conwy',
  'Best photography spots near Snowdon?',
  "What's the weather like in late March?",
];

export default function ChatOverlay({
  messages,
  itinerary,
  onAddToItinerary,
  onAddToPlaces,
}: ChatOverlayProps) {
  const [open, setOpen] = useState(false);
  const [lockedOpen, setLockedOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const hasMessages = messages.length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[76px] right-4 z-50 w-14 h-14 rounded-2xl bg-stone-900 text-white shadow-lg shadow-stone-900/25 flex items-center justify-center transition-all duration-200 active:scale-95 hover:bg-stone-800"
        aria-label="Open AI assistant"
      >
        <Sparkles size={22} strokeWidth={1.8} />
        {hasMessages && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sky-500 rounded-full border-2 border-white dark:border-slate-900" />
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-stone-50 dark:bg-slate-900 chat-overlay-enter">
          <header className="flex-shrink-0 bg-white dark:bg-slate-900/95 border-b border-stone-200/80 dark:border-slate-700/80 sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-100 hover:bg-stone-100 dark:hover:bg-slate-800 transition-all active:scale-95 -ml-1"
                aria-label="Back"
              >
                <ArrowLeft size={18} strokeWidth={2} />
              </button>
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-stone-900 dark:bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} strokeWidth={1.8} className="text-white dark:text-slate-900" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-stone-800 dark:text-slate-100 leading-tight">Ordo AI</h2>
                  <p className="text-[10px] text-stone-400 dark:text-slate-500 leading-tight">North Wales trip assistant</p>
                </div>
              </div>
              {hasMessages && (
                <button
                  onClick={() => setLockedOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 dark:text-slate-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                  aria-label="Clear chat"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
              {!hasMessages && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 py-8">
                  <div className="w-16 h-16 rounded-3xl bg-stone-900 dark:bg-slate-100 flex items-center justify-center shadow-lg shadow-stone-900/20">
                    <Sparkles size={28} strokeWidth={1.6} className="text-white dark:text-slate-900" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-base font-semibold text-stone-800 dark:text-slate-100 mb-1.5">How can I help?</p>
                    <p className="text-sm text-stone-400 dark:text-slate-500 max-w-xs leading-relaxed">
                      Ask me anything about your North Wales trip — packing, restaurants, photo spots, or add events directly to your itinerary.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5 w-full max-w-xs">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setLockedOpen(true)}
                        className="text-left text-sm text-stone-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl px-4 py-3 active:bg-stone-50 dark:active:bg-slate-700 transition-colors leading-snug shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const stripped = stripActions(msg.content);
                const actions = parseActions(msg.content);

                return (
                  <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                      isUser ? 'bg-stone-800' : 'bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700'
                    }`}>
                      {isUser
                        ? <User size={13} className="text-white" />
                        : <Sparkles size={13} className="text-stone-500 dark:text-slate-400" />
                      }
                    </div>
                    <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-stone-800 text-white rounded-tr-sm'
                          : 'bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 rounded-tl-sm'
                      }`}>
                        {isUser ? (
                          <p>{stripped}</p>
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(stripped) }}
                            className="prose-sm"
                          />
                        )}
                      </div>
                      {!isUser && actions.length > 0 && (
                        <ActionButtons
                          actions={actions}
                          itinerary={itinerary}
                          onAddToItinerary={onAddToItinerary}
                          onAddToPlaces={onAddToPlaces}
                        />
                      )}
                    </div>
                  </div>
                );
              })}


              <div ref={bottomRef} />
            </div>
          </div>

          <div className="flex-shrink-0 bg-white dark:bg-slate-900/95 border-t border-stone-200/80 dark:border-slate-700/80 px-4 py-3 pb-safe">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => setLockedOpen(true)}
                className="w-full flex items-center gap-3 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-left group transition-colors hover:border-stone-300 dark:hover:border-slate-600"
              >
                <Lock size={14} className="text-stone-400 dark:text-slate-500 flex-shrink-0" />
                <span className="flex-1 text-sm text-stone-400 dark:text-slate-500">This trip is now read-only…</span>
                <Send size={14} className="text-stone-300 dark:text-slate-600 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

      <TripLockedModal isOpen={lockedOpen} onClose={() => setLockedOpen(false)} />
    </>
  );
}
