export type EventCategory = 'sightseeing' | 'travel' | 'dining' | 'accommodation' | 'activity' | 'other';

export interface ItineraryEvent {
  id: string;
  time: string;
  startTime?: string;
  endTime?: string;
  title: string;
  description: string;
  location?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  notes?: string;
  category?: EventCategory;
  done: boolean;
  ownExpense?: boolean;
}

export interface ItineraryDay {
  id: string;
  date: string;
  dayLabel: string;
  events: ItineraryEvent[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ChecklistGroup {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface Meal {
  id: string;
  type: string;
  description: string;
  notes: string;
}

export interface DayMeals {
  id: string;
  date: string;
  dayLabel: string;
  meals: Meal[];
}

export interface Place {
  id: string;
  emoji: string;
  name: string;
  description: string;
  shotTip: string;
  visited: boolean;
  lat?: number;
  lng?: number;
}

export type TripPinType = 'hotel' | 'coach_dropoff' | 'coach_pickup';

export interface TripPin {
  id: string;
  trip_id: string;
  type: TripPinType;
  name: string | null;
  address: string | null;
  lat: number;
  lng: number;
  created_at: string;
}

export interface SavedLink {
  id: string;
  label: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ParsedAction {
  type: 'add_itinerary' | 'add_place';
  payload: Record<string, unknown>;
}
