export interface ItineraryEvent {
  id: string;
  time: string;
  title: string;
  description: string;
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
}

export interface SavedLink {
  id: string;
  label: string;
  url: string;
}
