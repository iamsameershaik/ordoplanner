import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseState<T>(
  key: string,
  initialValue: T
): [T, boolean, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);
  const localWriteRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('trip_state')
      .select('value')
      .eq('key', key)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error(`useSupabaseState fetch error [${key}]:`, error);
          setLoaded(true);
          return;
        }
        if (data) {
          setValue(data.value as T);
        } else {
          supabase
            .from('trip_state')
            .upsert({ key, value: initialValue }, { onConflict: 'key' });
        }
        setLoaded(true);
      });

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
          const incoming = JSON.stringify((payload.new as { value: T }).value);
          if (localWriteRef.current === incoming) return;
          setValue((payload.new as { value: T }).value);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = updater instanceof Function ? updater(prev) : updater;
        const serialised = JSON.stringify(next);
        localWriteRef.current = serialised;
        supabase
          .from('trip_state')
          .upsert({ key, value: next }, { onConflict: 'key' })
          .then(({ error }) => {
            if (error) console.error(`useSupabaseState write error [${key}]:`, error);
          });
        return next;
      });
    },
    [key]
  );

  return [value, loaded, set];
}
