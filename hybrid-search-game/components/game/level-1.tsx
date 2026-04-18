"use client"

import { useMemo } from "react"
import { ArrowDown } from "lucide-react"
import {
  BUDGET_MAP,
  FILTER_COMBINATIONS,
  getCombination,
  getHotel,
  type BudgetBand,
  type CheckIn,
  type City,
} from "@/lib/game-data"
import { useGame, useGameActions, useScrollToStage } from "@/lib/game-state"
import { cn } from "@/lib/utils"
import { HotelRow } from "./hotel-card"

const CITIES: City[] = ["Boston", "Seattle", "San Diego"]
const CHECK_INS: CheckIn[] = ["This weekend", "Next weekend"]
const BUDGETS: BudgetBand[] = ["budget_mid", "budget_high"]

export function Level1() {
  const { state } = useGame()
  const { setCity, setCheckIn, setBudget, goToStage } = useGameActions()
  const scrollTo = useScrollToStage()

  const canContinue = Boolean(state.city && state.checkIn && state.budget)
  const shortlist = useMemo(() => {
    if (!canContinue) return null
    const c = getCombination(state.city!, state.checkIn!, state.budget!)
    return c.shortlisted_hotel_ids.map(getHotel)
  }, [canContinue, state.city, state.checkIn, state.budget])

  function handleContinue() {
    goToStage("level2")
    requestAnimationFrame(() => scrollTo("stage-level2"))
  }

  return (
    <section
      id="stage-level1"
      aria-label="Level 1 · Narrow the field"
      className="relative mx-auto w-full max-w-xl px-5 py-6 sm:py-10"
    >
      <Header
        number="01"
        title="Narrow the field"
        subtitle="Exact filters turn a broad search into a clean candidate set."
        technique="Structured Filter"
        color="primary"
      />

      {/* Compact filter panel — label + chips share a row so all three fit in minimal vertical space */}
      <div className="cartoon-card mt-4 divide-y-[2px] divide-ink/80 p-0">
        <FilterRow
          label="City"
          options={CITIES.map((c) => ({ value: c, label: c }))}
          selected={state.city}
          onSelect={(v) => setCity(v as City)}
          tone="primary"
        />
        <FilterRow
          label="Check-in"
          options={CHECK_INS.map((c) => ({ value: c, label: c }))}
          selected={state.checkIn}
          onSelect={(v) => setCheckIn(v as CheckIn)}
          tone="accent"
        />
        <FilterRow
          label="Budget"
          options={BUDGETS.map((b) => ({
            value: b,
            label: BUDGET_MAP[b].label,
          }))}
          selected={state.budget}
          onSelect={(v) => setBudget(v as BudgetBand)}
          tone="highlight"
        />
      </div>

      {/* Fragment stream or shortlist */}
      <div className="relative mt-4">
        {canContinue && shortlist ? (
          <Shortlist hotels={shortlist.slice(0, 5)} count={shortlist.length} />
        ) : (
          <FragmentStream />
        )}
      </div>

      <div className="mt-4 flex flex-col items-stretch gap-2">
        <button
          type="button"
          disabled={!canContinue}
          onClick={handleContinue}
          className="cartoon-btn h-12 w-full justify-center text-base sm:h-14 sm:text-lg"
        >
          Continue
          <ArrowDown className="size-5" strokeWidth={3} />
        </button>
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {canContinue
            ? "Checkpoint: Good Options reached"
            : `${FILTER_COMBINATIONS.length} valid combinations · pick one in each group`}
        </p>
      </div>
    </section>
  )
}

export function Header({
  number,
  title,
  subtitle,
  technique,
  color = "primary",
}: {
  number: string
  title: string
  subtitle: string
  technique?: string
  color?: "primary" | "accent" | "highlight"
}) {
  const bg = color === "accent" ? "bg-accent" : color === "highlight" ? "bg-highlight" : "bg-primary"
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-ink px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-[2px_2px_0_0_var(--ink)]",
            bg,
          )}
        >
          Level {number}
        </span>
        {technique && (
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            · {technique}
          </span>
        )}
      </div>
      <h2 className="mt-3 font-display text-pretty text-2xl font-bold leading-tight tracking-tight sm:mt-4 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-1 text-pretty text-sm font-semibold leading-snug text-muted-foreground sm:mt-2 sm:leading-relaxed">
        {subtitle}
      </p>
    </div>
  )
}

function FilterRow({
  label,
  options,
  selected,
  onSelect,
  tone = "primary",
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string | undefined
  onSelect: (v: string) => void
  tone?: "primary" | "accent" | "highlight"
}) {
  const activeBg =
    tone === "accent" ? "bg-accent" : tone === "highlight" ? "bg-highlight" : "bg-primary"
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:w-20 sm:text-[11px]">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                "rounded-full border-[2px] border-ink px-3 py-1 text-[11px] font-bold transition-all",
                active
                  ? `${activeBg} text-ink shadow-[2px_2px_0_0_var(--ink)] -translate-y-0.5`
                  : "bg-background text-foreground shadow-[1.5px_1.5px_0_0_var(--ink)] hover:-translate-y-0.5",
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FragmentStream() {
  const FRAGMENTS = [
    "Harbor Inn", "Park View", "$289/nt", "Family suite", "Quiet floor",
    "Garden Stay", "Lantern Hotel", "Near Zoo", "$499/nt", "Gaslamp",
    "Calm vibe", "Beach path", "walkable", "$345/nt", "Seaport",
    "family", "Pike Place", "Belltown", "Space Needle", "Downtown",
    "Coronado", "Balboa", "Lake Union", "quiet wing", "La Jolla",
  ]
  const tones = ["bg-primary", "bg-accent", "bg-highlight", "bg-card"]

  return (
    <div className="cartoon-card relative h-48 overflow-hidden p-3 sm:h-56">
      <div className="absolute left-3 top-2 z-10 flex items-center gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-highlight border-[1.5px] border-ink" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Result Pool · pre-filter
        </span>
      </div>
      <div className="relative grid h-full grid-cols-3 content-start gap-1.5 pt-8">
        {FRAGMENTS.map((f, i) => (
          <span
            key={`${f}-${i}`}
            className={cn(
              "truncate rounded-full border-[1.5px] border-ink px-2 py-1 text-center text-[10px] font-bold text-ink animate-drift",
              tones[i % tones.length],
            )}
            style={{ animationDelay: `${(i % 6) * 0.2}s` }}
          >
            {f}
          </span>
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent"
      />
    </div>
  )
}

function Shortlist({
  hotels,
  count,
}: {
  hotels: ReturnType<typeof getHotel>[]
  count: number
}) {
  return (
    <div className="cartoon-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="cartoon-chip cartoon-chip-primary">Shortlist · {count} stays</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          candidate set
        </span>
      </div>
      <div className="relative space-y-2">
        {hotels.map((h, i) => (
          <div
            key={h.hotel_id}
            className={cn(
              i === 4 && "[mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]",
            )}
          >
            <HotelRow hotel={h} />
          </div>
        ))}
      </div>
    </div>
  )
}
