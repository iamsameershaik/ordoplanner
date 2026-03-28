import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { broadcastOfflineFlush } from './useRemoteUpdates';

const CACHE_PREFIX = 'ordo_cache_';
const QUEUE_KEY = 'ordo_write_queue';

interface QueueEntry {
  key: string;
  value: unknown;
}

function readCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    return item ? (JSON.parse(item) as T) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: unknown): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {}
}

function getQueue(): QueueEntry[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as QueueEntry[];
  } catch {
    return [];
  }
}

function enqueue(key: string, value: unknown): void {
  const queue = getQueue().filter((q) => q.key !== key);
  queue.push({ key, value });
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

function dequeue(key: string): void {
  const queue = getQueue().filter((q) => q.key !== key);
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

let broadcastTimer: ReturnType<typeof setTimeout> | null = null;

async function flushQueueEntry(key: string, value: unknown): Promise<void> {
  const { error } = await supabase
    .from('trip_state')
    .upsert({ key, value }, { onConflict: 'key' });
  if (!error) {
    dequeue(key);
    if (broadcastTimer) clearTimeout(broadcastTimer);
    broadcastTimer = setTimeout(() => {
      broadcastOfflineFlush();
      broadcastTimer = null;
    }, 300);
  }
}

export function useSupabaseState<T>(
  key: string,
  initialValue: T
): [T, boolean, (value: T | ((prev: T) => T)) => void] {
  const cached = readCache<T>(key);
  const [value, setValue] = useState<T>(cached ?? initialValue);
  const [loaded, setLoaded] = useState(false);
  const localWriteRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (navigator.onLine) {
      supabase
        .from('trip_state')
        .select('value')
        .eq('key', key)
        .maybeSingle()
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error) {
            console.error(`useSupabaseState fetch [${key}]:`, error);
            setLoaded(true);
            return;
          }
          if (data) {
            setValue(data.value as T);
            writeCache(key, data.value);
          } else {
            const toSeed = readCache<T>(key) ?? initialValue;
            supabase
              .from('trip_state')
              .upsert({ key, value: toSeed }, { onConflict: 'key' });
          }
          setLoaded(true);
        });
    } else {
      setLoaded(true);
    }

    const channel = supabase
      .channel(`trip_state:${key}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_state',
          filter: `key=eq.${key}`,
        },
        (payload) => {
          if (!payload.new || !('value' in payload.new)) return;
          const incoming = JSON.stringify(
            (payload.new as { value: T }).value
          );
          if (localWriteRef.current === incoming) return;
          const v = (payload.new as { value: T }).value;
          setValue(v);
          writeCache(key, v);
        }
      )
      .subscribe();

    const handleOnline = () => {
      const queue = getQueue();
      const entry = queue.find((q) => q.key === key);
      if (entry) {
        flushQueueEntry(entry.key, entry.value);
      }
    };
    window.addEventListener('online', handleOnline);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      window.removeEventListener('online', handleOnline);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = updater instanceof Function ? updater(prev) : updater;
        const serialised = JSON.stringify(next);
        localWriteRef.current = serialised;
        writeCache(key, next);
        if (navigator.onLine) {
          supabase
            .from('trip_state')
            .upsert({ key, value: next }, { onConflict: 'key' })
            .then(({ error }) => {
              if (error) {
                enqueue(key, next);
              } else {
                dequeue(key);
              }
            });
        } else {
          enqueue(key, next);
        }
        return next;
      });
    },
    [key]
  );

  return [value, loaded, set];
}
