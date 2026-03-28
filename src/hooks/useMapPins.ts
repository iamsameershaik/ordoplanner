import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { TripPin, TripPinType } from '../types';

const TRIP_ID = 'nw_trip';

export function useMapPins() {
  const [pins, setPins] = useState<TripPin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('trip_pins')
      .select('*')
      .eq('trip_id', TRIP_ID)
      .then(({ data }) => {
        if (data) setPins(data as TripPin[]);
        setLoading(false);
      });

    const channel = supabase
      .channel('trip_pins_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trip_pins' },
        () => {
          supabase
            .from('trip_pins')
            .select('*')
            .eq('trip_id', TRIP_ID)
            .then(({ data }) => {
              if (data) setPins(data as TripPin[]);
            });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function upsertPin(type: TripPinType, lat: number, lng: number, name?: string, address?: string) {
    const existing = pins.find(p => p.type === type);
    if (existing) {
      const { data } = await supabase
        .from('trip_pins')
        .update({ lat, lng, name: name ?? null, address: address ?? null })
        .eq('id', existing.id)
        .select()
        .maybeSingle();
      if (data) setPins(prev => prev.map(p => p.id === existing.id ? data as TripPin : p));
    } else {
      const { data } = await supabase
        .from('trip_pins')
        .insert({ trip_id: TRIP_ID, type, lat, lng, name: name ?? null, address: address ?? null })
        .select()
        .maybeSingle();
      if (data) setPins(prev => [...prev, data as TripPin]);
    }
  }

  async function deletePin(type: TripPinType) {
    await supabase.from('trip_pins').delete().eq('trip_id', TRIP_ID).eq('type', type);
    setPins(prev => prev.filter(p => p.type !== type));
  }

  return { pins, loading, upsertPin, deletePin };
}
