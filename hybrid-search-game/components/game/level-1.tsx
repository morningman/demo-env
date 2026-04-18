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

type PoolPhase = 'idle' | 'phase1' | 'phase2' | 'done'

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





function SqlPanel({
  city,
  checkIn,
  budget,
  canContinue,
  poolPhase,
  onRun,
}: {
  city: City | undefined
  checkIn: CheckIn | undefined
  budget: BudgetBand | undefined
  canContinue: boolean
  poolPhase: PoolPhase
  onRun: () => void
}) {
  const isLoading = poolPhase === 'phase1' || poolPhase === 'phase2'
  const isExecuted = poolPhase === 'done'

  function Val({ value, placeholder }: { value: string | undefined; placeholder: string }) {
    if (value) {
      return (
        <span className="rounded border-[1.5px] border-ink bg-primary px-1 font-bold not-italic text-ink">
          {value}
        </span>
      )
    }
    return (
      <span className="rounded border-[1.5px] border-dashed border-ink/40 px-1 italic text-muted-foreground">
        {placeholder}
      </span>
    )
  }

  const budgetSql = budget ? BUDGET_MAP[budget].sql : null

  return (
    <div className="cartoon-card mt-4 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          SQL Preview
        </span>
      </div>
      <pre className="overflow-x-auto rounded border-[1.5px] border-ink/20 bg-ink/5 p-3 font-mono text-[11px] leading-relaxed text-foreground sm:text-xs">
        <code>
          <span className="text-muted-foreground">SELECT</span>{' '}hotel_name, nightly_price, hotel_tags{'\n'}
          <span className="text-muted-foreground">FROM</span>{' '}hotels{'\n'}
          <span className="text-muted-foreground">WHERE</span>{' '}city = <Val value={city} placeholder="pick city" />{'\n'}
          {'  '}<span className="text-muted-foreground">AND</span>{' '}check_in = <Val value={checkIn} placeholder="pick check-in" />{'\n'}
          {'  '}<span className="text-muted-foreground">AND</span>{' '}<Val value={budgetSql ?? undefined} placeholder="pick budget" />;
        </code>
      </pre>
      <div className="mt-3">
        {isExecuted ? (
          <div className="flex h-10 items-center justify-center rounded-lg border-[2px] border-ink/30 bg-background px-4 text-[11px] font-bold text-muted-foreground sm:text-xs">
            {/* Display string — always "10 rows", not actual count */}
            ✓ Executed · 10 rows returned
          </div>
        ) : (
          <button
            type="button"
            disabled={!canContinue || isLoading}
            onClick={onRun}
            className={cn(
              'cartoon-btn h-10 w-full justify-center text-[11px] sm:text-xs',
              canContinue && !isLoading
                ? 'bg-accent'
                : 'cursor-not-allowed opacity-60',
            )}
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">●●●</span>
                <span className="ml-2">Running…</span>
              </>
            ) : (
              <>▶ {canContinue ? 'Run Query' : 'Run Query (select all filters first)'}</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

const BLOCK_FRAGMENTS = [
  "Harbor Inn", "$289/nt", "family-friendly", "near attractions", "quiet",
  "Seaport", "$412/nt", "walkable", "lake view", "Pike Place",
  "Belltown", "Coronado", "Balboa", "$345/nt", "downtown",
  "La Jolla", "Space Needle", "calm vibe", "beach path", "zoo nearby",
]

const BLOCK_TONES = ["bg-primary", "bg-accent", "bg-highlight", "bg-card"]

// Pre-computed fixed positions for the 20 blocks (% of container width/height)
const BLOCK_LAYOUT = [
  { top: 6,  left: 2,  w: 28, delay: 0.0 },
  { top: 4,  left: 34, w: 22, delay: 0.4 },
  { top: 3,  left: 60, w: 32, delay: 0.8 },
  { top: 22, left: 8,  w: 20, delay: 0.2 },
  { top: 20, left: 30, w: 30, delay: 0.6 },
  { top: 18, left: 64, w: 26, delay: 1.0 },
  { top: 38, left: 0,  w: 32, delay: 0.3 },
  { top: 36, left: 36, w: 24, delay: 0.7 },
  { top: 35, left: 62, w: 30, delay: 1.1 },
  { top: 54, left: 6,  w: 26, delay: 0.5 },
  { top: 52, left: 34, w: 28, delay: 0.9 },
  { top: 51, left: 64, w: 24, delay: 1.3 },
  { top: 70, left: 2,  w: 30, delay: 0.1 },
  { top: 68, left: 36, w: 22, delay: 0.5 },
  { top: 66, left: 60, w: 32, delay: 0.9 },
  { top: 84, left: 8,  w: 24, delay: 0.2 },
  { top: 82, left: 34, w: 30, delay: 0.6 },
  { top: 80, left: 66, w: 26, delay: 1.0 },
  { top: 14, left: 18, w: 20, delay: 0.7 },
  { top: 44, left: 46, w: 22, delay: 1.2 },
]

function DataPool({
  hotels,
  poolPhase,
}: {
  hotels: ReturnType<typeof getHotel>[] | null
  poolPhase: PoolPhase
}) {
  const showBlocks = poolPhase === 'idle' || poolPhase === 'phase1'
  const showShortlist = poolPhase === 'phase2' || poolPhase === 'done'

  return (
    <div className="cartoon-card mt-4 overflow-hidden">
      {/* Block field */}
      {showBlocks && (
        <div className="relative h-48 p-3 sm:h-56">
          <div className="absolute left-3 top-2 z-10 flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full border-[1.5px] border-ink bg-highlight" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Pool · 30+ candidates
            </span>
          </div>
          {BLOCK_LAYOUT.map((b, i) => (
            <span
              key={i}
              className={cn(
                'absolute truncate rounded border-[1.5px] border-ink px-2 py-1 text-[10px] font-bold text-ink',
                BLOCK_TONES[i % BLOCK_TONES.length],
                poolPhase === 'idle'
                  ? 'animate-drift'
                  : i < 10
                  ? 'animate-block-stay'
                  : 'animate-filter-fade-out',
              )}
              style={{
                top: `${b.top}%`,
                left: `${b.left}%`,
                width: `${b.w}%`,
                animationDelay: poolPhase === 'idle' ? `${b.delay}s` : `${i * 0.025}s`,
              }}
            >
              {BLOCK_FRAGMENTS[i]}
            </span>
          ))}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent"
          />
        </div>
      )}

      {/* Shortlist */}
      {showShortlist && hotels && (
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="cartoon-chip cartoon-chip-primary">Shortlist · {hotels.length} stays</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              candidate set
            </span>
          </div>
          <div className="relative space-y-2">
            {hotels.map((h, i) => (
              <div
                key={h.hotel_id}
                className={cn(
                  'animate-crystallise-in',
                  i === 4 && '[mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]',
                )}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <HotelRow hotel={h} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
