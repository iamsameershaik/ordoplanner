# 🗺️ Ordo — Real-Time Collaborative Trip Planner

> *Plan trips together. Stay in sync. Even offline.*

Ordo is a **production-quality, full-stack collaborative travel planning application** built with React 18, TypeScript, Supabase, and the Anthropic Claude API. It enables multiple travellers to plan, manage, and navigate a trip entirely in real-time — from itinerary scheduling and packing lists to AI-powered recommendations and interactive maps — all without requiring an account.

---

## ✨ Feature Overview

| Feature | Description |
|---|---|
| 📅 **Smart Itinerary** | Day-by-day event scheduling with drag-to-reorder, categorisation, time ranges, and progress tracking |
| ✅ **Packing Checklist** | Multi-group packing lists with completion percentages and group-level reset |
| 🍽️ **Meals Planner** | Per-day meal tracking with inline editing, types, and notes |
| 📍 **Places to Visit** | Curated location cards with photography tips, visit status, and deep-link to maps |
| 📝 **Shared Notes** | Freeform collaborative notes with auto-save feedback and a saved links manager |
| 🗺️ **Interactive Map** | Leaflet-powered map with event pins, route previews, nearby hotspot search, and custom markers |
| 🤖 **AI Trip Assistant** | Claude-powered chat with full trip context, markdown responses, and one-tap event/place creation |
| 🔄 **Real-Time Sync** | Supabase Realtime keeps all devices in sync instantly — no refresh required |
| 📶 **Offline Support** | Fully usable offline; changes queue locally and flush automatically on reconnection |
| 🌙 **Dark Mode** | System-independent dark mode toggle with persistent preference |

---

## 🏗️ Architecture

Ordo is built as a **single-page application** with a React frontend, Supabase as the backend (PostgreSQL + Realtime + Edge Functions), and the Anthropic Claude API accessed securely through a Deno edge function.

```
┌─────────────────────────────────────────────────────────────┐
│                     React SPA (Vite)                        │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐    │
│  │Itinerary │  │ Checklist │  │  Meals   │  │  Places  │    │
│  └──────────┘  └───────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────────┐  │
│  │  Notes   │  │    Map    │  │      AI Chat Overlay     │  │
│  └──────────┘  └───────────┘  └──────────────────────────┘  │
│                        ↕ Hooks                              │
│  useSupabaseState  ·  useMapPins  ·  useRemoteUpdates       │
└─────────────────────────────────────────────────────────────┘
                          ↕ Supabase JS SDK
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                             │
│  ┌────────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │  PostgreSQL DB │  │   Realtime    │  │ Edge Function │   │
│  │  trip_state    │  │  (Broadcast)  │  │  claude-chat  │   │
│  │  trip_pins     │  │               │  │  (Deno)       │   │
│  └────────────────┘  └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                                ↕
                                     Anthropic Claude API
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework with concurrent rendering |
| **TypeScript** | End-to-end type safety |
| **Vite** | Sub-second HMR, optimised production builds |
| **Tailwind CSS** | Utility-first styling with dark mode class strategy |
| **React Leaflet** | Interactive maps (OpenStreetMap tiles) |
| **dnd-kit** | Accessible drag-and-drop for itinerary reordering |
| **Lucide React** | Consistent, lightweight icon system |

### Backend & Infrastructure
| Technology | Purpose |
|---|---|
| **Supabase PostgreSQL** | Persistent JSONB key-value store for all trip state |
| **Supabase Realtime** | Broadcast channels for sub-second multi-device sync |
| **Supabase Edge Functions** | Deno runtime; secure Claude API proxy |
| **Anthropic Claude API** | AI trip assistant (claude-sonnet-4-5) |

### External APIs
| API | Purpose |
|---|---|
| **Nominatim** | Text-to-coordinate geocoding for location search |
| **Overpass API** | OpenStreetMap POI discovery for nearby hotspot search |
| **Google Maps** | Deep-link walking directions from hotel to hotspot |
| **Browser Geolocation API** | GPS-based "Near Me" search origin |

---

## 📂 Project Structure

```
src/
├── App.tsx                     # Root: state orchestration, all handlers
├── types/index.ts              # All TypeScript interfaces & types
├── lib/supabase.ts             # Supabase client singleton
├── data/initialData.ts         # Pre-seeded trip data (first-run defaults)
│
├── hooks/
│   ├── useSupabaseState.ts     # ⭐ Core: sync, cache, offline queue logic
│   ├── useMapPins.ts           # Hotel/coach pin CRUD via Supabase
│   ├── useRemoteUpdates.ts     # Cross-device change notification
│   ├── useOnlineStatus.ts      # navigator.onLine + event listeners
│   ├── useDarkMode.ts          # localStorage-backed dark mode
│   └── useLocalStorage.ts      # Generic localStorage hook
│
├── components/
│   ├── TabBar.tsx              # Fixed bottom navigation
│   ├── ConfirmModal.tsx        # Reusable destructive-action dialog
│   ├── OfflineBanner.tsx       # Network status banner
│   ├── RemoteUpdateToast.tsx   # "Trip updated by another device" toast
│   │
│   ├── itinerary/
│   │   ├── ItineraryTab.tsx    # Day sections, sortable event cards
│   │   └── EventForm.tsx       # Add/edit event modal
│   │
│   ├── checklist/
│   │   └── ChecklistTab.tsx    # Multi-group checklist with progress
│   │
│   ├── meals/
│   │   └── MealsTab.tsx        # Day × meal-type grid, inline editing
│   │
│   ├── places/
│   │   └── PlacesTab.tsx       # Expandable place cards
│   │
│   ├── notes/
│   │   └── NotesTab.tsx        # Textarea + saved links manager
│   │
│   ├── map/
│   │   ├── MapTab.tsx          # Leaflet map container + controls
│   │   ├── MapPopup.tsx        # Pin/hotspot popup with Maps link
│   │   ├── HotspotSearch.tsx   # Overpass API nearby search
│   │   ├── CustomPinPanel.tsx  # Hotel/coach pin management
│   │   └── mapIcons.ts         # Leaflet divIcon factory
│   │
│   └── chat/
│       ├── ChatOverlay.tsx     # Full-screen AI chat (FAB-triggered)
│       └── ChatTab.tsx         # Tab-embedded chat variant
│
supabase/
├── functions/
│   └── claude-chat/index.ts   # Edge Function: Claude API proxy
└── migrations/
    ├── ..._create_trip_state.sql
    └── ..._add_trip_pins_and_coordinates.sql
```

---

## 🔄 Real-Time Sync Architecture

Ordo's sync engine, `useSupabaseState`, implements a **cache-first, optimistic, offline-resilient** data pattern with zero external state management libraries:

```
Read path:
  1. Return localStorage cache immediately (zero-latency render)
  2. Fetch from Supabase in background
  3. Update state + cache when data arrives

Write path:
  Online  → upsert to Supabase immediately
  Offline → queue to localStorage write queue
          → flush entire queue on `online` event

Realtime path:
  Supabase Broadcast → compare session IDs → ignore own writes
                     → update local state + show toast
```

**Key design decisions:**
- **No Redux/Zustand** — all sync logic lives in a single, composable generic hook
- **Session-scoped deduplication** — each browser tab generates a random `SESSION_ID`; Realtime payloads include the originator ID so a device never toasts itself
- **Write queue batching** — only the latest value per key is sent when flushing, preventing stale overwrites
- **Upsert-on-conflict** — `ON CONFLICT (key) DO UPDATE` prevents duplicate rows; `updated_at` provides an audit trail

---

## 🗄️ Database Schema

### `trip_state` — All trip data as typed JSONB
```sql
CREATE TABLE trip_state (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

| Key | Type | Contents |
|---|---|---|
| `nw_itinerary` | `ItineraryDay[]` | All days with ordered event arrays |
| `nw_checklist` | `ChecklistGroup[]` | Groups of packing items |
| `nw_meals` | `DayMeals[]` | Breakfast/lunch/dinner per day |
| `nw_places` | `Place[]` | Curated locations with coordinates |
| `nw_notes` | `string` | Free-form markdown notes |
| `nw_links` | `SavedLink[]` | Labelled URLs for quick reference |
| `nw_chat` | `ChatMessage[]` | Full AI conversation history |

### `trip_pins` — Named map markers
```sql
CREATE TABLE trip_pins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    TEXT NOT NULL,
  type       TEXT NOT NULL,   -- 'hotel' | 'coach_dropoff' | 'coach_pickup'
  lat        DOUBLE PRECISION NOT NULL,
  lng        DOUBLE PRECISION NOT NULL,
  name       TEXT,
  address    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Both tables are protected by **Row Level Security** with policies granting anonymous access — suitable for a shared, no-auth collaborative app.

---

## 🤖 AI Assistant

The Claude-powered trip assistant is aware of your full itinerary and places list. It can:

- Answer questions about the destination (packing, weather, restaurants, photo spots)
- Suggest additions in a structured format
- Emit embedded `<action>` blocks that render as tappable buttons to add events or places **directly to your trip data** — no copy-pasting required

### Action Parsing Flow

```
Claude response (streamed):
  "...I'd recommend visiting Conwy Castle in the morning.
   <action type="add_itinerary">{"dayId":"day1","event":{...}}</action>"

Frontend:
  1. Regex extracts action blocks
  2. Strips them from displayed text
  3. Renders action buttons below the message
  4. On tap → calls onAddToItinerary / onAddToPlaces handler
  5. Button changes to "Added successfully ✓"
```

### Edge Function System Prompt
The edge function builds a compact trip context string from the current itinerary and places, injected as a system message before the conversation history. This keeps Claude grounded in **your specific trip** without hallucination.

---

## 🗺️ Map Features

The interactive map tab is the most feature-rich surface in Ordo:

- **🏨 Hotel-centric default view** — on load, the map centers on your hotel pin (zoom 15) or falls back to a North Wales overview (zoom 10)
- **📌 Itinerary event pins** — all events with coordinates render as category-coloured markers; clicking shows title, time, and category
- **🛣️ Route polylines** — when multiple events have coordinates, a dashed polyline connects them in order
- **🔍 Nearby hotspot search** — type a query (e.g. "pubs", "waterfalls") and choose a search origin:
  - GPS location
  - Hotel position
  - Current map center
  - Manual Nominatim geocode
- **🧭 Walking directions** — Google Maps links from hotspot popups automatically route **from your hotel** when a hotel pin is set
- **⚙️ Custom pins** — add, relocate, or remove hotel, coach pickup, and coach dropoff markers with address lookup

---

## 🌙 Dark Mode

Ordo supports a **class-based dark mode** (independent of OS preference) toggled via the Moon/Sun button in the header:

- Entire app switches to a dark slate palette (`slate-700/800/900`)
- All 6 tabs, all modals, the AI chat overlay, and banners are fully dark-mode-aware
- Preference persists via `localStorage` key `ordo_dark`
- No flash-of-unstyled-content thanks to synchronous localStorage read on initial render

---

## ⚡ Performance

| Optimisation | Detail |
|---|---|
| **Lazy map loading** | `MapTab` component and Leaflet CSS only load when the Map tab is active |
| **Cache-first renders** | LocalStorage hit on first paint; no loading skeleton for returning users |
| **Tailwind CSS purging** | Production builds only ship CSS classes actually used in JSX |
| **Broadcast deduplication** | Realtime listener only processes changes from *other* sessions |
| **Write queue batching** | Offline writes deduplicate by key; only latest value sent per key on flush |
| **Vite code splitting** | Map chunk (`MapTab`) ships as a separate JS file for optimal caching |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier sufficient)
- An Anthropic API key

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

The edge function uses `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `ANTHROPIC_API_KEY` — all auto-populated by the Supabase runtime.

### Database Setup

Apply the included migrations via Supabase CLI or the dashboard SQL editor:

```bash
supabase db push
```

This creates `trip_state` and `trip_pins` tables with RLS enabled.

### Local Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

---

## 🔒 Security Model

Ordo is intentionally designed as a **no-authentication shared trip app**:

- RLS is **enabled** on all tables — nothing is publicly accessible by default
- Policies grant `anon` role full CRUD — appropriate for a shared, pre-known-URL collaborative tool
- The Claude API key is **never exposed to the client** — all AI calls route through the Supabase Edge Function
- `dangerouslySetInnerHTML` in the chat renderer only renders content returned by Claude (not user input), and only applies simple markdown transformations

> For multi-tenant or production use, swap the `anon` RLS policies for `auth.uid()`-scoped policies and add Supabase Auth.

---

## 📱 Mobile Experience

Ordo is built **mobile-first**:

- Fixed bottom tab bar with 64px touch targets
- Full-screen overlays for event editing and AI chat
- `pb-safe` padding respects iOS home indicator
- `overscroll-contain` prevents scroll bleed in the chat overlay
- Large, accessible tap areas on all interactive elements
- Responsive max-width container (`max-w-2xl`) with edge padding on all viewports

---

## 🧩 Key Abstractions

### `useSupabaseState<T>(key, fallback)`

The heart of Ordo. A generic hook that:
1. Reads from localStorage on init (zero-latency)
2. Fetches the latest value from Supabase
3. Subscribes to Realtime broadcast updates
4. Returns `[value, setValue]` — identical API to `useState`
5. Handles offline queuing transparently

Used for every piece of trip data — itinerary, checklist, meals, places, notes, links, and chat history.

### `parseActions(content)` + `renderMarkdown(text)`

Claude responses can contain structured `<action>` blocks alongside natural language. The frontend:
- Strips action blocks before display
- Renders markdown to safe HTML
- Materialises action blocks as interactive React buttons

This is Ordo's **AI → UI bridge** — Claude effectively drives UI updates through typed action payloads.

---

## 🗓️ Roadmap Ideas

- 🔐 **Auth + multi-trip** — Supabase Auth + per-user trip isolation
- 💰 **Budget tracker** — expense logging against itinerary events
- 📸 **Photo uploads** — attach photos to places and events via Supabase Storage
- 🗺️ **Offline maps** — tile caching for areas without signal
- 📤 **Export** — PDF itinerary export and calendar (.ics) sync
- 🔔 **Push notifications** — Web Push when a co-traveller makes changes
- 🌍 **Multi-destination** — support for trips spanning multiple cities

---

## 📄 License

MIT — build on it, extend it, make it yours.

---

<div align="center">

**Built with React · TypeScript · Supabase · Anthropic Claude**

*Made for travellers who plan together.*

</div>
