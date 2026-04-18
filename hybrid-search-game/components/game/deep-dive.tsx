"use client"

import { useMemo } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Database,
  Download,
  Filter,
  GitMerge,
  Rocket,
  Search,
  Sparkles,
  Table2,
} from "lucide-react"
import {
  BUDGET_MAP,
  type BudgetBand,
  type CheckIn,
  type City,
} from "@/lib/game-data"
import { useGame, useGameActions, useScrollToStage } from "@/lib/game-state"
import { cn } from "@/lib/utils"

const DOWNLOAD_LINK = "#"
const VELODB_LINK = "#"

type Screen = {
  id: number
  title: string
  subtitle: string
  icon: React.ReactNode
  sql?: (ctx: { city: City; checkIn: CheckIn; budget: BudgetBand }) => string
  diagram: React.ReactNode
  explain: string[]
}

const SCREENS: Screen[] = [
  {
    id: 1,
    title: "Table View",
    subtitle:
      "Doris stores structured fields, searchable text, and vector fields in the same table.",
    icon: <Table2 size={14} strokeWidth={3} />,
    diagram: <TableDiagram />,
    explain: [
      "One table. Three field groups.",
      "Structured fields for filters. Text fields for full-text. Vector fields for semantics.",
    ],
  },
  {
    id: 2,
    title: "Structured Filter",
    subtitle: "Doris first narrows the search space with exact conditions.",
    icon: <Filter size={14} strokeWidth={3} />,
    sql: ({ city, checkIn, budget }) => {
      const { min, max } = BUDGET_MAP[budget]
      const checkSql = checkIn === "This weekend" ? "'this_weekend'" : "'next_weekend'"
      return `CREATE VIEW hotel_candidates AS
SELECT hotel_id, hotel_name, nightly_price, budget_band,
       hotel_description, hotel_tags,
       image_embedding, description_embedding
FROM hotels
WHERE city = '${city}'
  AND check_in_window = ${checkSql}
  AND nightly_price BETWEEN ${min} AND ${max};`
    },
    diagram: <FilterDiagram />,
    explain: [
      "Structured predicates shrink the pool first.",
      "Downstream retrieval only runs on this candidate view.",
    ],
  },
  {
    id: 3,
    title: "Text Retrieval",
    subtitle: "Doris runs full-text search on the filtered candidate set.",
    icon: <Search size={14} strokeWidth={3} />,
    sql: () => `SELECT hotel_id, hotel_name, score() AS bm25
FROM hotel_candidates
WHERE hotel_description MATCH_ANY 'quiet family-friendly attractions'
   OR hotel_tags MATCH_ANY 'quiet family-friendly attractions'
ORDER BY score() DESC
LIMIT 3;`,
    diagram: <TextDiagram />,
    explain: [
      "Inverted index over description and tags.",
      "BM25 ranks lexical hits.",
    ],
  },
  {
    id: 4,
    title: "Semantic Retrieval",
    subtitle: "Doris runs vector search on the same candidate view.",
    icon: <Sparkles size={14} strokeWidth={3} />,
    sql: () => `SELECT hotel_id, hotel_name,
       l2_distance_approximate(description_embedding, [query_vector]) AS dist
FROM hotel_candidates
ORDER BY dist ASC
LIMIT 3;`,
    diagram: <VectorDiagram />,
    explain: [
      "ANN over description embeddings on the same view.",
      "Returns stays whose meaning matches the query.",
    ],
  },
  {
    id: 5,
    title: "RRF Fusion",
    subtitle: "Doris fuses the two ranked result sets into one final Top 3.",
    icon: <GitMerge size={14} strokeWidth={3} />,
    sql: () => `WITH fused AS (
  SELECT hotel_id, SUM(1.0 / (60 + rank)) AS rrf_score
  FROM (
    SELECT hotel_id, text_rank AS rank FROM text_top3
    UNION ALL
    SELECT hotel_id, semantic_rank AS rank FROM semantic_top3
  ) ranked_results
  GROUP BY hotel_id
)
SELECT hotel_id, rrf_score
FROM fused
ORDER BY rrf_score DESC
LIMIT 3;`,
    diagram: <FusionDiagram />,
    explain: [
      "RRF combines rankings, not raw scores.",
      "Results appearing in both lists float to the top.",
    ],
  },
]

export function DeepDive() {
  const { state } = useGame()
  const { setDeepDiveScreen, returnToFinish } = useGameActions()
  const scrollTo = useScrollToStage()

  const ctx = useMemo(() => {
    if (!state.city || !state.checkIn || !state.budget) return null
    return { city: state.city, checkIn: state.checkIn, budget: state.budget }
  }, [state.city, state.checkIn, state.budget])

  if (!ctx) return null

  const screen = SCREENS[state.deepDiveScreen - 1] ?? SCREENS[0]
  const isLast = state.deepDiveScreen === SCREENS.length
  const isFirst = state.deepDiveScreen === 1
  const sql = screen.sql ? screen.sql(ctx) : null

  function next() {
    if (isLast) return
    setDeepDiveScreen(state.deepDiveScreen + 1)
  }
  function prev() {
    if (isFirst) return
    setDeepDiveScreen(state.deepDiveScreen - 1)
  }
  function back() {
    returnToFinish()
    requestAnimationFrame(() => scrollTo("stage-finish"))
  }

  return (
    <section
      id="stage-deepdive"
      aria-label="Deep Dive · how Doris made it work"
      className="relative mx-auto w-full max-w-xl px-5 py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          className="inline-flex items-center gap-1 rounded-full border-[2px] border-ink bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5"
        >
          <ArrowLeft size={14} strokeWidth={3} />
          Back
        </button>
        <span className="cartoon-chip cartoon-chip-primary !text-[10px]">
          Deep Dive · {state.deepDiveScreen} / {SCREENS.length}
        </span>
      </div>

      {/* Step dots */}
      <div className="mt-4 flex gap-1.5">
        {SCREENS.map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() => setDeepDiveScreen(s.id)}
            aria-label={`Go to step ${s.id}: ${s.title}`}
            className={cn(
              "h-3 flex-1 rounded-full border-[2px] border-ink transition-colors",
              s.id === state.deepDiveScreen
                ? "bg-highlight"
                : s.id < state.deepDiveScreen
                  ? "bg-primary"
                  : "bg-card",
            )}
          />
        ))}
      </div>

      {/* Screen */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border-[2.5px] border-ink bg-primary shadow-[2px_2px_0_0_var(--ink)]">
            {screen.icon}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Screen {screen.id} · Doris Internals
          </span>
        </div>
        <h2 className="mt-3 font-display text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
          {screen.title}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">
          {screen.subtitle}
        </p>

        {sql && (
          <pre className="mt-4 overflow-x-auto rounded-xl border-[3px] border-ink bg-ink p-3 font-mono text-[11px] leading-relaxed text-[color:var(--background)] shadow-[3px_3px_0_0_var(--ink)]">
            <code>{sql}</code>
          </pre>
        )}

        <div className="cartoon-card mt-4 overflow-hidden p-4">
          {screen.diagram}
        </div>

        <ul className="mt-4 space-y-2 text-sm font-semibold leading-relaxed">
          {screen.explain.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full border-[1.5px] border-ink bg-highlight" />
              <span className="text-muted-foreground">{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={prev}
          disabled={isFirst}
          className="cartoon-btn cartoon-btn-ghost h-12 flex-1 justify-center"
        >
          <ArrowLeft className="size-4" strokeWidth={3} />
          Previous
        </button>
        {isLast ? (
          <button type="button" onClick={back} className="cartoon-btn h-12 flex-1 justify-center">
            Back to result
            <ArrowRight className="size-4" strokeWidth={3} />
          </button>
        ) : (
          <button type="button" onClick={next} className="cartoon-btn h-12 flex-1 justify-center">
            Next
            <ArrowRight className="size-4" strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Persistent CTA bar — stacks on mobile, side-by-side on tablet+ */}
      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <a href={DOWNLOAD_LINK} className="cartoon-btn cartoon-btn-ghost h-12 w-full justify-center text-sm sm:text-base">
          <Download className="size-4" strokeWidth={3} />
          Download Doris
        </a>
        <a href={VELODB_LINK} className="cartoon-btn cartoon-btn-highlight h-12 w-full justify-center text-sm sm:text-base">
          <Rocket className="size-4" strokeWidth={3} />
          VeloDB Free Trial
        </a>
      </div>
    </section>
  )
}

/* ---------- Diagrams ---------- */

function DiagramFrame({
  children,
  tall,
}: {
  children: React.ReactNode
  tall?: boolean
}) {
  // `tall` diagrams (Table Diagram on mobile, where 3 field groups stack vertically)
  // need room to breathe; standard diagrams keep a 16/9 aspect.
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border-[2.5px] border-ink bg-background",
        tall
          ? "min-h-[280px] sm:aspect-[16/9] sm:min-h-0"
          : "aspect-[16/9]",
      )}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(var(--ink) 0.8px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div className="relative h-full w-full p-3">{children}</div>
    </div>
  )
}

function TableDiagram() {
  return (
    <DiagramFrame tall>
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
          <Database size={14} strokeWidth={3} />
          hotels
        </div>
        {/* Mobile: single column stacked; Tablet+: 3 columns side by side */}
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
          <FieldGroup label="Structured" color="primary" fields={["city", "nightly_price", "budget_band"]} />
          <FieldGroup label="Text" color="accent" fields={["hotel_description", "hotel_tags"]} />
          <FieldGroup label="Vector" color="highlight" fields={["image_embedding", "description_embedding"]} />
        </div>
      </div>
    </DiagramFrame>
  )
}

function FieldGroup({
  label,
  color,
  fields,
}: {
  label: string
  color: "primary" | "accent" | "highlight"
  fields: string[]
}) {
  const bg =
    color === "primary" ? "bg-primary" : color === "accent" ? "bg-accent" : "bg-highlight"
  return (
    <div className={cn("flex flex-col rounded-xl border-[2px] border-ink p-2 shadow-[2px_2px_0_0_var(--ink)]", bg)}>
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      <div className="mt-1 flex flex-1 flex-col gap-1">
        {fields.map((f) => (
          <span
            key={f}
            className="truncate rounded-md border-[1.5px] border-ink bg-card px-1.5 py-0.5 font-mono text-[10px] font-bold"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

function FilterDiagram() {
  return (
    <DiagramFrame>
      <div className="flex h-full items-center justify-between gap-2">
        <DiagramBlock label="hotels" count="30" color="muted" />
        <Arrow label="WHERE" />
        <DiagramBlock label="candidates" count="10" color="primary" />
      </div>
    </DiagramFrame>
  )
}

function TextDiagram() {
  return (
    <DiagramFrame>
      <div className="flex h-full items-center justify-between gap-2">
        <DiagramBlock label="candidates" count="10" color="muted" />
        <Arrow label="BM25" />
        <DiagramBlock label="text_top3" count="3" color="primary" />
      </div>
    </DiagramFrame>
  )
}

function VectorDiagram() {
  return (
    <DiagramFrame>
      <div className="flex h-full items-center justify-between gap-2">
        <DiagramBlock label="candidates" count="10" color="muted" />
        <Arrow label="ANN" />
        <DiagramBlock label="semantic_top3" count="3" color="accent" />
      </div>
    </DiagramFrame>
  )
}

function FusionDiagram() {
  return (
    <DiagramFrame>
      <div className="flex h-full items-center justify-between gap-2">
        <div className="flex flex-col gap-2">
          <DiagramBlock label="text_top3" count="3" color="primary" small />
          <DiagramBlock label="semantic_top3" count="3" color="accent" small />
        </div>
        <Arrow label="RRF" />
        <DiagramBlock label="final_top3" count="3" color="highlight" />
      </div>
    </DiagramFrame>
  )
}

function DiagramBlock({
  label,
  count,
  color,
  small,
}: {
  label: string
  count: string
  color: "primary" | "accent" | "highlight" | "muted"
  small?: boolean
}) {
  const map = {
    primary: "bg-primary",
    accent: "bg-accent",
    highlight: "bg-highlight",
    muted: "bg-card",
  } as const
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 rounded-xl border-[2.5px] border-ink text-center shadow-[3px_3px_0_0_var(--ink)]",
        map[color],
        small ? "h-12 w-24" : "h-20 flex-1",
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      <span className="font-display text-lg font-bold tabular-nums">{count}</span>
    </div>
  )
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-ink bg-highlight shadow-[2px_2px_0_0_var(--ink)]">
        <ArrowRight className="size-4 text-ink" strokeWidth={3} />
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </div>
  )
}
