// Doris Hybrid Search mini-game: preset data
// Data contract: hotel_pool, filter_combinations, stage_results

export type City = "Boston" | "Seattle" | "San Diego"
export type CheckIn = "This weekend" | "Next weekend"
export type BudgetBand = "budget_mid" | "budget_high"

export const BUDGET_MAP: Record<
  BudgetBand,
  { label: string; min: number; max: number; sql: string }
> = {
  budget_mid: {
    label: "$250-$400",
    min: 250,
    max: 400,
    sql: "nightly_price BETWEEN 250 AND 400",
  },
  budget_high: {
    label: "$400-$650",
    min: 400,
    max: 650,
    sql: "nightly_price BETWEEN 400 AND 650",
  },
}

export type Hotel = {
  hotel_id: string
  hotel_name: string // <= 32 chars
  city: City
  nightly_price: number
  budget_band: BudgetBand
  hotel_tags: [string, string] // each <=16 chars
  location_line: string // <=38 chars
  hotel_description: string
  illustration_key: "harbor" | "park" | "skyline" | "beach" | "garden" | "loft"
}

// 30 hotels, 10 per city. Names kept <=32 chars, tags <=16, location <=38.
export const HOTEL_POOL: Hotel[] = [
  // ---------- Boston (10) ----------
  {
    hotel_id: "bos-01",
    hotel_name: "Beacon Harbor Inn",
    city: "Boston",
    nightly_price: 289,
    budget_band: "budget_mid",
    hotel_tags: ["quiet floors", "family suites"],
    location_line: "Beacon Hill · 6 min to Common",
    hotel_description:
      "A calm brownstone with family suites on quiet upper floors, a five-minute stroll to the Common and the Freedom Trail start.",
    illustration_key: "harbor",
  },
  {
    hotel_id: "bos-02",
    hotel_name: "Commonwealth Garden Stay",
    city: "Boston",
    nightly_price: 315,
    budget_band: "budget_mid",
    hotel_tags: ["garden view", "kid menu"],
    location_line: "Back Bay · steps to Public Garden",
    hotel_description:
      "Boutique rooms facing a private garden, with a dedicated kid menu and strollers at the front desk.",
    illustration_key: "garden",
  },
  {
    hotel_id: "bos-03",
    hotel_name: "Seaport Lantern Hotel",
    city: "Boston",
    nightly_price: 345,
    budget_band: "budget_mid",
    hotel_tags: ["harbor walk", "late checkout"],
    location_line: "Seaport · 8 min to ICA Boston",
    hotel_description:
      "A waterfront hotel with a quiet harbor walk and easy access to the main Seaport attractions.",
    illustration_key: "harbor",
  },
  {
    hotel_id: "bos-04",
    hotel_name: "Copley Row Residences",
    city: "Boston",
    nightly_price: 375,
    budget_band: "budget_mid",
    hotel_tags: ["suites", "walkable"],
    location_line: "Copley · near Trinity Church",
    hotel_description:
      "Family-sized suites above Copley Square, walkable to Newbury Street shopping and the library.",
    illustration_key: "skyline",
  },
  {
    hotel_id: "bos-05",
    hotel_name: "North End Courtyard",
    city: "Boston",
    nightly_price: 279,
    budget_band: "budget_mid",
    hotel_tags: ["central access", "quiet courtyard"],
    location_line: "North End · 4 min to Paul Revere",
    hotel_description:
      "A tucked-away courtyard hotel in the historic North End, central to the main attractions but insulated from street noise.",
    illustration_key: "park",
  },
  {
    hotel_id: "bos-06",
    hotel_name: "Atlantic Pier House",
    city: "Boston",
    nightly_price: 455,
    budget_band: "budget_high",
    hotel_tags: ["harbor view", "family suites"],
    location_line: "Long Wharf · harbor front",
    hotel_description:
      "Large family suites with harbor views, connecting rooms, and a quiet pool deck set away from the main lobby.",
    illustration_key: "harbor",
  },
  {
    hotel_id: "bos-07",
    hotel_name: "Beacon Crest Grand",
    city: "Boston",
    nightly_price: 499,
    budget_band: "budget_high",
    hotel_tags: ["quiet wing", "kid amenities"],
    location_line: "Beacon Hill · 3 min to State House",
    hotel_description:
      "A grand hotel with a dedicated quiet family wing, kids welcome kits, and concierge routes to the top attractions.",
    illustration_key: "skyline",
  },
  {
    hotel_id: "bos-08",
    hotel_name: "Fenway Arts Residence",
    city: "Boston",
    nightly_price: 520,
    budget_band: "budget_high",
    hotel_tags: ["art district", "spacious"],
    location_line: "Fenway · near MFA Boston",
    hotel_description:
      "Spacious art-led residences near the museum district, popular with families visiting Boston's main cultural sites.",
    illustration_key: "garden",
  },
  {
    hotel_id: "bos-09",
    hotel_name: "Seaport Ember Collection",
    city: "Boston",
    nightly_price: 585,
    budget_band: "budget_high",
    hotel_tags: ["harbor walk", "calm vibe"],
    location_line: "Seaport · waterfront promenade",
    hotel_description:
      "A calm, design-led waterfront collection with direct access to the harbor walk and Seaport attractions.",
    illustration_key: "harbor",
  },
  {
    hotel_id: "bos-10",
    hotel_name: "Back Bay Quiet House",
    city: "Boston",
    nightly_price: 610,
    budget_band: "budget_high",
    hotel_tags: ["quiet street", "family floor"],
    location_line: "Back Bay · tree-lined street",
    hotel_description:
      "A quiet residential-street retreat with a dedicated family floor and short walks to the main Back Bay attractions.",
    illustration_key: "park",
  },

  // ---------- Seattle (10) ----------
  {
    hotel_id: "sea-01",
    hotel_name: "Pike Lantern Hotel",
    city: "Seattle",
    nightly_price: 265,
    budget_band: "budget_mid",
    hotel_tags: ["walkable area", "quiet match"],
    location_line: "Downtown · 5 min to Pike Place",
    hotel_description:
      "A walkable downtown hotel with quiet interior rooms, five minutes from Pike Place Market and the waterfront.",
    illustration_key: "skyline",
  },
  {
    hotel_id: "sea-02",
    hotel_name: "Elliott Bay Family Inn",
    city: "Seattle",
    nightly_price: 299,
    budget_band: "budget_mid",
    hotel_tags: ["family-friendly", "bay view"],
    location_line: "Waterfront · near Aquarium",
    hotel_description:
      "A family-focused inn with connecting rooms and a short walk to the Seattle Aquarium and waterfront carousel.",
    illustration_key: "harbor",
  },
  {
    hotel_id: "sea-03",
    hotel_name: "Belltown Garden Stay",
    city: "Seattle",
    nightly_price: 325,
    budget_band: "budget_mid",
    hotel_tags: ["garden", "good for kids"],
    location_line: "Belltown · 8 min to Space Needle",
    hotel_description:
      "Garden courtyard rooms in Belltown with a kid-friendly breakfast, a short walk from the Space Needle.",
    illustration_key: "garden",
  },
  {
    hotel_id: "sea-04",
    hotel_name: "South Lake Calm Lofts",
    city: "Seattle",
    nightly_price: 358,
    budget_band: "budget_mid",
    hotel_tags: ["calm vibe", "suites"],
    location_line: "South Lake Union · lakefront",
    hotel_description:
      "Calm lofts on South Lake Union with separate sleeping nooks, ideal for families who want quiet evenings.",
    illustration_key: "loft",
  },
  {
    hotel_id: "sea-05",
    hotel_name: "Queen Anne Quiet Rooms",
    city: "Seattle",
    nightly_price: 389,
    budget_band: "budget_mid",
    hotel_tags: ["quiet match", "central access"],
    location_line: "Queen Anne · near Seattle Center",
    hotel_description:
      "Quiet rooms on a residential street in Queen Anne, with easy central access to Seattle Center attractions.",
    illustration_key: "park",
  },
  {
    hotel_id: "sea-06",
    hotel_name: "Pike Harbor Suites",
    city: "Seattle",
    nightly_price: 449,
    budget_band: "budget_high",
    hotel_tags: ["harbor view", "family-friendly"],
    location_line: "Waterfront · 3 min to Pike Place",
    hotel_description:
      "Harbor-facing family suites steps from Pike Place, with a quiet pool and kids welcome kits.",
    illustration_key: "harbor",
  },
  {
    hotel_id: "sea-07",
    hotel_name: "Space Needle Ember",
    city: "Seattle",
    nightly_price: 495,
    budget_band: "budget_high",
    hotel_tags: ["near attractions", "quiet wing"],
    location_line: "Seattle Center · park-side",
    hotel_description:
      "A calm, park-side hotel with a quiet family wing, right next to the Space Needle and Chihuly garden.",
    illustration_key: "skyline",
  },
  {
    hotel_id: "sea-08",
    hotel_name: "Cascade Grove Residence",
    city: "Seattle",
    nightly_price: 525,
    budget_band: "budget_high",
    hotel_tags: ["spacious", "kid amenities"],
    location_line: "Denny Triangle · 10 min to market",
    hotel_description:
      "Spacious residences with bunk-room setups, a kids lounge, and walkable routes to the main attractions.",
    illustration_key: "loft",
  },
  {
    hotel_id: "sea-09",
    hotel_name: "Lake Union Horizon",
    city: "Seattle",
    nightly_price: 565,
    budget_band: "budget_high",
    hotel_tags: ["calm vibe", "lake view"],
    location_line: "Lake Union · quiet street",
    hotel_description:
      "Serene lake-view rooms in a low-traffic pocket of the city, still a short ride from the top attractions.",
    illustration_key: "harbor",
  },
  {
    hotel_id: "sea-10",
    hotel_name: "Capitol Hill Arts Hotel",
    city: "Seattle",
    nightly_price: 615,
    budget_band: "budget_high",
    hotel_tags: ["art district", "walkable area"],
    location_line: "Capitol Hill · 6 min to park",
    hotel_description:
      "An arts-led hotel on a walkable block of Capitol Hill, popular with families visiting the parks and museums.",
    illustration_key: "garden",
  },

  // ---------- San Diego (10) ----------
  {
    hotel_id: "sd-01",
    hotel_name: "Pacific Dune Lodge",
    city: "San Diego",
    nightly_price: 259,
    budget_band: "budget_mid",
    hotel_tags: ["beach path", "family-friendly"],
    location_line: "Pacific Beach · oceanfront",
    hotel_description:
      "Oceanfront family rooms with a direct beach path, beach toys on loan, and a quiet morning breakfast lounge.",
    illustration_key: "beach",
  },
  {
    hotel_id: "sd-02",
    hotel_name: "Gaslamp Courtyard Hotel",
    city: "San Diego",
    nightly_price: 285,
    budget_band: "budget_mid",
    hotel_tags: ["walkable area", "quiet courtyard"],
    location_line: "Gaslamp · 4 min to Petco Park",
    hotel_description:
      "A central courtyard hotel with quiet interior rooms in the otherwise lively Gaslamp Quarter.",
    illustration_key: "skyline",
  },
  {
    hotel_id: "sd-03",
    hotel_name: "Balboa Garden Stay",
    city: "San Diego",
    nightly_price: 319,
    budget_band: "budget_mid",
    hotel_tags: ["park view", "good for kids"],
    location_line: "Balboa Park · near the Zoo",
    hotel_description:
      "Park-facing rooms a short walk from the San Diego Zoo, with strollers and a kid-friendly patio cafe.",
    illustration_key: "park",
  },
  {
    hotel_id: "sd-04",
    hotel_name: "La Jolla Quiet Cove",
    city: "San Diego",
    nightly_price: 355,
    budget_band: "budget_mid",
    hotel_tags: ["quiet match", "calm vibe"],
    location_line: "La Jolla · 5 min to cove beach",
    hotel_description:
      "Calm, residential-street rooms above La Jolla Cove, a favorite with families wanting quiet evenings.",
    illustration_key: "beach",
  },
  {
    hotel_id: "sd-05",
    hotel_name: "Seaport Wharf Residence",
    city: "San Diego",
    nightly_price: 385,
    budget_band: "budget_mid",
    hotel_tags: ["harbor walk", "suites"],
    location_line: "Seaport Village · bayfront",
    hotel_description:
      "Bayfront suites on the Seaport Village promenade, easy access to the USS Midway and main attractions.",
    illustration_key: "harbor",
  },
  {
    hotel_id: "sd-06",
    hotel_name: "Coronado Family Villas",
    city: "San Diego",
    nightly_price: 465,
    budget_band: "budget_high",
    hotel_tags: ["beach path", "family suites"],
    location_line: "Coronado · ocean side",
    hotel_description:
      "Beach villas on Coronado with connecting family suites, kid pools, and a quiet garden wing.",
    illustration_key: "beach",
  },
  {
    hotel_id: "sd-07",
    hotel_name: "Gaslamp Ember Hotel",
    city: "San Diego",
    nightly_price: 499,
    budget_band: "budget_high",
    hotel_tags: ["near attractions", "quiet wing"],
    location_line: "Gaslamp · 2 min to waterfront",
    hotel_description:
      "A design-led hotel at the edge of the Gaslamp, with a quiet family wing and direct walks to the waterfront.",
    illustration_key: "skyline",
  },
  {
    hotel_id: "sd-08",
    hotel_name: "Balboa Grove Residences",
    city: "San Diego",
    nightly_price: 535,
    budget_band: "budget_high",
    hotel_tags: ["park view", "kid amenities"],
    location_line: "Balboa Park · garden side",
    hotel_description:
      "Spacious residences overlooking Balboa Park's gardens, with kid amenities and a quiet reading lounge.",
    illustration_key: "garden",
  },
  {
    hotel_id: "sd-09",
    hotel_name: "Point Loma Horizon",
    city: "San Diego",
    nightly_price: 575,
    budget_band: "budget_high",
    hotel_tags: ["calm vibe", "harbor view"],
    location_line: "Point Loma · bay-view cliff",
    hotel_description:
      "Cliff-side bay-view rooms in a calm pocket of Point Loma, a short ride from the main family attractions.",
    illustration_key: "harbor",
  },
  {
    hotel_id: "sd-10",
    hotel_name: "Little Italy Loft Hotel",
    city: "San Diego",
    nightly_price: 620,
    budget_band: "budget_high",
    hotel_tags: ["walkable area", "spacious"],
    location_line: "Little Italy · 6 min to bayfront",
    hotel_description:
      "Loft-style family rooms on a walkable block of Little Italy, close to the bayfront and main attractions.",
    illustration_key: "loft",
  },
]

// ---------- Filter combinations ----------
export type FilterCombination = {
  combination_id: string
  city: City
  check_in_window: CheckIn
  budget_band: BudgetBand
  shortlisted_hotel_ids: string[] // 10 ids
}

const citySlug: Record<City, string> = {
  Boston: "bos",
  Seattle: "sea",
  "San Diego": "sd",
}
const checkinSlug: Record<CheckIn, string> = {
  "This weekend": "w1",
  "Next weekend": "w2",
}
const budgetSlug: Record<BudgetBand, string> = {
  budget_mid: "mid",
  budget_high: "high",
}

export function makeCombinationId(
  city: City,
  checkIn: CheckIn,
  budget: BudgetBand,
): string {
  return `${citySlug[city]}-${checkinSlug[checkIn]}-${budgetSlug[budget]}`
}

function shortlistFor(city: City, budget: BudgetBand): string[] {
  // Shortlist = that city's 10 hotels, reordered so budget-matching ones come first.
  // This satisfies "same-city same-budget overlaps most, cross-city overlaps least."
  const all = HOTEL_POOL.filter((h) => h.city === city)
  const matching = all.filter((h) => h.budget_band === budget)
  const rest = all.filter((h) => h.budget_band !== budget)
  return [...matching, ...rest].map((h) => h.hotel_id).slice(0, 10)
}

export const FILTER_COMBINATIONS: FilterCombination[] = (["Boston", "Seattle", "San Diego"] as City[])
  .flatMap((city) =>
    (["This weekend", "Next weekend"] as CheckIn[]).flatMap((checkIn) =>
      (["budget_mid", "budget_high"] as BudgetBand[]).map((budget) => ({
        combination_id: makeCombinationId(city, checkIn, budget),
        city,
        check_in_window: checkIn,
        budget_band: budget,
        shortlisted_hotel_ids: shortlistFor(city, budget),
      })),
    ),
  )

// ---------- Stage results (Level 2 / Level 3) ----------
// Key: `${citySlug}-${budgetSlug}` (check-in doesn&apos;t change results, per spec minimal-variance mapping).
export type ResultItem = { hotel_id: string; reason_tags: string[] }
export type StageResults = {
  text_top3: ResultItem[]
  semantic_top3: ResultItem[]
  final_top3: string[] // just hotel_ids, ordered by rank
}

// Rules honored:
// - text_top3 & semantic_top3 have exactly 1 overlap
// - final_top3[0] = the overlap
// - final_top3[1] = text-leaning, final_top3[2] = semantic-leaning
const STAGE_RESULTS: Record<string, StageResults> = {
  // Boston · mid
  "bos-mid": {
    text_top3: [
      { hotel_id: "bos-01", reason_tags: ["quiet match", "family-friendly match"] },
      { hotel_id: "bos-05", reason_tags: ["central access", "near attractions"] },
      { hotel_id: "bos-04", reason_tags: ["walkable area"] },
    ],
    semantic_top3: [
      { hotel_id: "bos-01", reason_tags: ["calm vibe", "good for kids"] },
      { hotel_id: "bos-02", reason_tags: ["calm vibe", "good for kids"] },
      { hotel_id: "bos-03", reason_tags: ["near attractions"] },
    ],
    final_top3: ["bos-01", "bos-05", "bos-02"],
  },
  // Boston · high
  "bos-high": {
    text_top3: [
      { hotel_id: "bos-07", reason_tags: ["quiet match", "family-friendly match"] },
      { hotel_id: "bos-10", reason_tags: ["quiet match"] },
      { hotel_id: "bos-06", reason_tags: ["near attractions"] },
    ],
    semantic_top3: [
      { hotel_id: "bos-07", reason_tags: ["calm vibe", "good for kids"] },
      { hotel_id: "bos-09", reason_tags: ["calm vibe", "near attractions"] },
      { hotel_id: "bos-08", reason_tags: ["good for kids"] },
    ],
    final_top3: ["bos-07", "bos-10", "bos-09"],
  },
  // Seattle · mid
  "sea-mid": {
    text_top3: [
      { hotel_id: "sea-02", reason_tags: ["family-friendly match", "near attractions"] },
      { hotel_id: "sea-01", reason_tags: ["quiet match", "walkable area"] },
      { hotel_id: "sea-05", reason_tags: ["quiet match"] },
    ],
    semantic_top3: [
      { hotel_id: "sea-02", reason_tags: ["good for kids", "calm vibe"] },
      { hotel_id: "sea-04", reason_tags: ["calm vibe"] },
      { hotel_id: "sea-03", reason_tags: ["good for kids"] },
    ],
    final_top3: ["sea-02", "sea-01", "sea-04"],
  },
  // Seattle · high
  "sea-high": {
    text_top3: [
      { hotel_id: "sea-07", reason_tags: ["near attractions", "quiet match"] },
      { hotel_id: "sea-06", reason_tags: ["family-friendly match"] },
      { hotel_id: "sea-10", reason_tags: ["walkable area"] },
    ],
    semantic_top3: [
      { hotel_id: "sea-07", reason_tags: ["calm vibe", "good for kids"] },
      { hotel_id: "sea-09", reason_tags: ["calm vibe"] },
      { hotel_id: "sea-08", reason_tags: ["good for kids"] },
    ],
    final_top3: ["sea-07", "sea-06", "sea-09"],
  },
  // San Diego · mid
  "sd-mid": {
    text_top3: [
      { hotel_id: "sd-03", reason_tags: ["near attractions", "family-friendly match"] },
      { hotel_id: "sd-02", reason_tags: ["walkable area", "quiet match"] },
      { hotel_id: "sd-05", reason_tags: ["near attractions"] },
    ],
    semantic_top3: [
      { hotel_id: "sd-03", reason_tags: ["good for kids", "calm vibe"] },
      { hotel_id: "sd-04", reason_tags: ["calm vibe"] },
      { hotel_id: "sd-01", reason_tags: ["good for kids"] },
    ],
    final_top3: ["sd-03", "sd-02", "sd-04"],
  },
  // San Diego · high
  "sd-high": {
    text_top3: [
      { hotel_id: "sd-07", reason_tags: ["near attractions", "quiet match"] },
      { hotel_id: "sd-10", reason_tags: ["walkable area"] },
      { hotel_id: "sd-06", reason_tags: ["family-friendly match"] },
    ],
    semantic_top3: [
      { hotel_id: "sd-07", reason_tags: ["calm vibe", "good for kids"] },
      { hotel_id: "sd-09", reason_tags: ["calm vibe"] },
      { hotel_id: "sd-08", reason_tags: ["good for kids"] },
    ],
    final_top3: ["sd-07", "sd-10", "sd-09"],
  },
}

export function getStageResults(
  city: City,
  budget: BudgetBand,
): StageResults {
  return STAGE_RESULTS[`${citySlug[city]}-${budgetSlug[budget]}`]
}

export function getHotel(hotel_id: string): Hotel {
  const h = HOTEL_POOL.find((x) => x.hotel_id === hotel_id)
  if (!h) throw new Error(`unknown hotel ${hotel_id}`)
  return h
}

export function getCombination(
  city: City,
  checkIn: CheckIn,
  budget: BudgetBand,
): FilterCombination {
  const id = makeCombinationId(city, checkIn, budget)
  const found = FILTER_COMBINATIONS.find((c) => c.combination_id === id)
  if (!found) throw new Error(`unknown combination ${id}`)
  return found
}

// Quick lookup by illustration_key for rendering.
export const ILLUSTRATIONS = ["harbor", "park", "skyline", "beach", "garden", "loft"] as const
