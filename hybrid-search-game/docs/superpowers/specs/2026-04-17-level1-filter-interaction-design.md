# Level 1 Filter First — Interaction Design Spec

**Date:** 2026-04-17  
**Component:** `components/game/level-1.tsx`  
**Status:** Approved for implementation

---

## Overview

Level 1 represents **structured field filtering** in the Doris Hybrid Search game. The goal is to help users intuitively understand that filtering narrows the search space before retrieval begins. This spec covers the new interaction design that replaces the current real-time shortlist update with an explicit SQL-driven run flow.

---

## What Changes

The current Level 1 immediately shows a shortlist as soon as all three chips are selected. The new design introduces:

1. A **persistent SQL panel** that updates in real-time as chips are selected
2. An explicit **Run button** that triggers a filter animation before the shortlist appears
3. A **floating block data pool** that visualizes the pre-filter candidate set and animates into shortlist rows on run

---

## Page Layout (Layout A)

Top to bottom within the section:

1. Level header (badge, title, subtitle)
2. Filter chip panel (City / Check-in / Budget)
3. SQL preview panel (real-time, with Run button)
4. Data pool area (abstract floating blocks → shortlist)
5. Continue button

The `Match Confidence` bar remains fixed on the right edge, unchanged.

---

## Filter Chip Panel

No structural change. Three rows (City, Check-in, Budget) in a `cartoon-card` with ink dividers. The existing `FilterRow` component is reused.

- City: Boston / Seattle / San Diego
- Check-in: This weekend / Next weekend  
- Budget: $250–$400 (`budget_mid`) / $401–$650 (`budget_high`)

Chip colors remain: primary (lemon) for City, accent (mint) for Check-in, highlight (coral) for Budget.

---

## SQL Preview Panel

A persistent `cartoon-card` panel below the filter chips. Always visible from the moment Level 1 is entered.

### Real-time content

The SQL reflects current chip selections:

```sql
SELECT hotel_name, nightly_price, hotel_tags
FROM hotels
WHERE city = 'Boston'              -- filled from City chip (or placeholder)
  AND check_in = 'This weekend'   -- filled from Check-in chip (or placeholder)
  AND price BETWEEN 250 AND 400;  -- filled from Budget chip (or placeholder)
```

### Placeholder vs filled styling

- **Filled value**: highlighted background (primary/lemon chip style), bold ink text
- **Empty placeholder**: dashed border, italic muted text (e.g., `pick check-in`)

### Run button

Rendered inside the SQL panel at the bottom. Four visual states:

- **Disabled** (not all chips selected): muted/cream background, `▶ Run Query (select all filters first)`, no shadow, cursor not-allowed
- **Active** (all chips selected): accent (mint) background, ink border + shadow, `▶ Run Query`, cursor pointer
- **Loading / in-flight** (Run clicked, animation playing): accent background at 60% opacity, spinner or pulsing dots beside label, `Running…`, cursor not-allowed, prevents double-click
- **Executed** (animation complete, shortlist visible): de-emphasised (muted background, no shadow), `✓ Executed · 10 rows returned`, non-interactive

The Run button is only interactive (clickable) in the Active state.

---

## Data Pool Area (Abstract Block Field)

Replaces the current `FragmentStream`. A `cartoon-card` region containing floating, overlapping abstract blocks that represent the unfiltered hotel pool.

### Initial state (before Run)

- Multiple blocks of varying sizes, positioned absolutely, with slight drift animation
- Block colors cycle through primary, accent, highlight, and card backgrounds
- **Block text content is hardcoded** — a fixed array of ~20 decorative strings defined in the component itself (hotel name fragments, price strings, tag words). These are not sampled from `game-data.ts` and are not meant to be meaningful. Example strings: `"Harbor Inn"`, `"$289/nt"`, `"family-friendly"`, `"near attractions"`, `"quiet"`, `"Seaport"`, `"$412/nt"`, `"walkable"`, `"lake view"`, `"Pike Place"`, etc.
- A `Pool · 30+ candidates` label with a blinking dot in the top-left
- A fade gradient at the bottom edge
- Block animation uses the existing `drift` keyframe (`@keyframes drift` in `globals.css`)

### After Run — two-phase animation

**Phase 1 — Fade out (~600ms):**  
All blocks that do not belong to the matched `shortlisted_hotel_ids` gradually reduce opacity to 0 and scale down slightly. Blocks that match remain visible and slightly brighten.

**Phase 2 — Crystallise (~600ms):**  
The 10 remaining blocks animate to expand horizontally into hotel row shapes. Text fades in to show `hotel_name`, `nightly_price`, `hotel_tags`, and `location_line`. The block container transitions from fixed-height floating layout to a standard stacked list layout showing 4 full rows and the 5th half-visible behind a fade.

Both phases run sequentially (phase 2 starts after phase 1 completes). The total animation from Run click to shortlist visible is approximately 1.2 seconds.

**`prefers-reduced-motion` fallback:**  
Skip both animation phases; jump directly from block field to shortlist rows with a simple opacity fade (existing global rule handles this).

### Chip modification after Run

If the user modifies any chip after the shortlist has appeared:
- The shortlist immediately collapses back to the block field (no animation, instant)
- The SQL updates in real-time
- The Run button returns to active state
- The Continue button returns to disabled state

---

## Shortlist

Unchanged from current implementation. Uses `HotelRow` component. Shows 5 items with the 5th partially masked. The `Shortlist · N stays` chip and `candidate set` label remain.

---

## Continue Button

- **Disabled**: until shortlist is visible (i.e., Run has completed with current chip combination)
- **Active**: once shortlist is shown; clicking advances to Level 2 and triggers `Match Confidence` rise to `Good Options` checkpoint

---

## State Summary

| State | SQL values | Run button | Data area | Continue |
|---|---|---|---|---|
| Chips incomplete | Partial (some placeholders) | disabled | Block field | disabled |
| All chips selected | All filled + highlighted | active | Block field | disabled |
| Running (in-flight) | All filled | loading | Phase 1 animation | disabled |
| Shortlist visible | All filled | executed | Shortlist rows | active |
| Chip modified after run | Updated (may have placeholders) | active/disabled | Block field (instant reset) | disabled |

---

## Implementation Scope

Only `components/game/level-1.tsx` requires changes. No changes to:
- `lib/game-data.ts` (data layer unchanged)
- `lib/game-state.ts` (state machine unchanged — shortlist visibility becomes a local UI state derived from whether the user has clicked Run)
- Any other component

### New local state

Add a `hasRun` boolean (or `shortlistVisible`) to the component to track whether the current chip combination has been executed. This is separate from the game-level state since it is purely presentational.

```typescript
const [hasRun, setHasRun] = useState(false)

// Reset when chips change
useEffect(() => { setHasRun(false) }, [state.city, state.checkIn, state.budget])
```

### Animation approach

Use pure CSS transitions and keyframes with `data-` attributes or `className` toggling to drive phase transitions. The project uses `tw-animate-css` and custom keyframes in `globals.css` — there is no `framer-motion`. Add any new keyframes (`filter-fade-out`, `crystallise`) to `globals.css`.

---

## Visual Style

All new elements follow the existing cartoon design system in `globals.css`:

- Cards: `cartoon-card` class (3px ink border, hard shadow offset)
- Buttons: `cartoon-btn` (lemon/mint/coral + ink border + shadow)
- Chips: `cartoon-chip` with tone variants
- Font: Fredoka for labels, Nunito for body, JetBrains Mono for SQL
- Block animation: reuse existing `animate-drift` / `drift` keyframe
- Colors: primary (lemon), accent (mint), highlight (coral), ink dark
