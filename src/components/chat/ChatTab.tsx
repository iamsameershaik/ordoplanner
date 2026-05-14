import { useState, useRef, useEffect } from 'react';
import { Send, Plus, MapPin, Bot, User, Trash2, Lock } from 'lucide-react';
import type { ChatMessage, ItineraryDay, Place, ParsedAction, ItineraryEvent } from '../../types';
import TripLockedModal from '../TripLockedModal';

interface ChatTabProps {
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
    .replace(/`(.+?)`/g, '<code class="bg-stone-100 text-stone-700 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/^### (.+)$/gm, '<p class="text-sm font-bold text-stone-800 mt-3 mb-1">$1</p>')
    .replace(/^## (.+)$/gm, '<p class="text-base font-bold text-stone-800 mt-3 mb-1">$1</p>')
    .replace(/^# (.+)$/gm, '<p class="text-base font-bold text-stone-800 mt-3 mb-1">$1</p>')
    .replace(/^[-•] (.+)$/gm, '<li class="ml-4 list-disc text-stone-700">$1</li>')
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
            <div key={idx} className="flex items-center gap-2 text-xs text-stone-400 font-medium">
              <div className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0" />
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
              className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl px-3 py-2 transition-colors text-left"
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
              className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl px-3 py-2 transition-colors text-left"
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

export default function ChatTab({
  messages,
  itinerary,
  onAddToItinerary,
  onAddToPlaces,
}: ChatTabProps) {
  const [lockedOpen, setLockedOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const SUGGESTIONS = [
    'What should I pack for hiking in North Wales in March?',
    'Recommend a good restaurant in Conwy',
    'Best photography spots near Snowdon?',
    'What\'s the weather usually like in late March?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-57px-64px)]">
      {messages.length > 0 && (
        <div className="flex justify-end px-4 pt-3 pb-1">
          <button
            onClick={() => setLockedOpen(true)}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
            Clear chat
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 py-8">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center">
              <Bot size={22} className="text-stone-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-stone-700 mb-1">Ordo AI</p>
              <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                Ask me anything about your North Wales trip — packing, restaurants, photo spots, or add events to your itinerary.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setLockedOpen(true)}
                  className="text-left text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 hover:bg-stone-100 transition-colors leading-relaxed"
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
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isUser ? 'bg-stone-700' : 'bg-stone-100'
              }`}>
                {isUser
                  ? <User size={13} className="text-white" />
                  : <Bot size={14} className="text-stone-500" />
                }
              </div>
              <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-stone-800 text-white rounded-tr-sm'
                    : 'bg-stone-50 border border-stone-200 text-stone-700 rounded-tl-sm'
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

      <div className="border-t border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3">
        <button
          onClick={() => setLockedOpen(true)}
          className="w-full flex items-center gap-3 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-left transition-colors hover:border-stone-300 dark:hover:border-slate-600"
        >
          <Lock size={13} className="text-stone-400 dark:text-slate-500 flex-shrink-0" />
          <span className="flex-1 text-sm text-stone-400 dark:text-slate-500">This trip is now read-only…</span>
          <Send size={13} className="text-stone-300 dark:text-slate-600 flex-shrink-0" />
        </button>
      </div>

      <TripLockedModal isOpen={lockedOpen} onClose={() => setLockedOpen(false)} />
    </div>
  );
}
