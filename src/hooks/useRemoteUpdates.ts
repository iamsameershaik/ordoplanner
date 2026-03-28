import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

let sessionId: string;
try {
  sessionId = sessionStorage.getItem('ordo_session_id') || '';
  if (!sessionId) {
    sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('ordo_session_id', sessionId);
  }
} catch {
  sessionId = Math.random().toString(36).slice(2);
}

export { sessionId };

export function broadcastOfflineFlush(): void {
  const channel = supabase.channel('ordo:updates');
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      channel.send({
        type: 'broadcast',
        event: 'offline-flush',
        payload: { from: sessionId },
      });
      setTimeout(() => supabase.removeChannel(channel), 2000);
    }
  });
}

export function useRemoteUpdates(): void {
  useEffect(() => {
    const channel = supabase
      .channel('ordo:updates')
      .on('broadcast', { event: 'offline-flush' }, (payload) => {
        if (payload.payload?.from !== sessionId) {
          window.dispatchEvent(new CustomEvent('ordo:remote-update'));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
