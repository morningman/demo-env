"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDown, Brain, Search } from "lucide-react"
import {
  BUDGET_MAP,
  getHotel,
  getStageResults,
} from "@/lib/game-data"
import { useGame, useGameActions, useScrollToStage } from "@/lib/game-state"
import { cn } from "@/lib/utils"
import { Header } from "./level-1"
import { HotelRow } from "./hotel-card"

export function Level2() {
  const { state } = useGame()
  const { triggerLevel2, goToStage } = useGameActions()
  const scrollTo = useScrollToStage()
  const [textReady, setTextReady] = useState(false)
  const [semReady, setSemReady] = useState(false)

  const hasSelections = Boolean(state.city && state.checkIn && state.budget)
  const results = useMemo(
    () => (hasSelections ? getStageResults(state.city!, state.budget!) : null),
    [hasSelections, state.city, state.budget],
  )

  // Auto-trigger retrieval on entry so the stage reveals on its own.
  useEffect(() => {
    if (hasSelections && !state.level2Triggered) {
      const t = window.setTimeout(() => triggerLevel2(), 450)
      return () => window.clearTimeout(t)
    }
  }, [hasSelections, state.level2Triggered, triggerLevel2])

  // Staggered reveal when level2 triggered.
  useEffect(() => {
    if (!state.level2Triggered) {
      setTextReady(false)
      setSemReady(false)
      return
    }
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setTextReady(true)
      setSemReady(true)
      return
    }
    const t1 = window.setTimeout(() => setTextReady(true), 280)
    const t2 = window.setTimeout(() => setSemReady(true), 700)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [state.level2Triggered])

  function handleFuse() {
    goToStage("level3")
    requestAnimationFrame(() => scrollTo("stage-level3"))
  }

  return (
    <section
      id="stage-level2"
      aria-label="Level 2 · Retrieve in parallel"
      className="relative mx-auto w-full max-w-xl px-5 py-10"
    >
      <Header
        number="02"
        title="Retrieve in parallel"
        subtitle="Run two retrieval paths on the same candidate set."
        technique="Parallel Recall"
        color="accent"
      />

      {/* Hard-condition chips recap */}
      <div className="mt-5 flex flex-wrap gap-2">
        {state.city && <Pill>City: {state.city}</Pill>}
        {state.checkIn && <Pill>Check-in: {state.checkIn}</Pill>}
        {state.budget && <Pill>Budget: {BUDGET_MAP[state.budget].label}</Pill>}
      </div>

      {/* Query bar */}
      <button
        type="button"
        onClick={() => (state.level2Triggered ? null : triggerLevel2())}
        disabled={state.level2Triggered}
        className={cn(
          "mt-5 flex w-full items-center gap-3 rounded-full border-[3px] border-ink px-4 py-3 text-left transition-all shadow-[3px_3px_0_0_var(--ink)]",
          state.level2Triggered ? "bg-accent" : "bg-card hover:-translate-y-0.5",
        )}
      >
        <Search size={18} strokeWidth={2.8} className="shrink-0 text-ink" />
        <span className="min-w-0 flex-1 truncate font-mono text-xs font-bold text-foreground">
          quiet, family-friendly, close to the main attractions
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full border-[2px] border-ink px-2 py-1 text-[10px] font-bold uppercase tracking-widest",
            state.level2Triggered ? "bg-highlight" : "bg-primary",
          )}
        >
          {state.level2Triggered ? "running" : "run"}
        </span>
      </button>

      {/* Two channels */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Channel
          title="Text Retrieval"
          tech="Inverted Index + BM25"
          accent="primary"
          icon={<Search size={16} strokeWidth={2.8} />}
          ready={textReady}
          results={results?.text_top3.map((r) => ({
            hotel: getHotel(r.hotel_id),
            reasonTags: r.reason_tags,
          }))}
        />
        <Channel
          title="Semantic Retrieval"
          tech="ANN Vector Retrieve"
          accent="accent"
          icon={<Brain size={16} strokeWidth={2.8} />}
          ready={semReady}
          results={results?.semantic_top3.map((r) => ({
            hotel: getHotel(r.hotel_id),
            reasonTags: r.reason_tags,
          }))}
        />
      </div>

      <div className="mt-6 flex flex-col items-stretch gap-2">
        <button
          type="button"
          disabled={!state.level2Triggered || !textReady || !semReady}
          onClick={handleFuse}
          className="cartoon-btn cartoon-btn-highlight h-14 w-full justify-center text-lg"
        >
          Fuse the Ranking
          <ArrowDown className="size-5" strokeWidth={3} />
        </button>
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Two Top 3 lists · one shared, one different
        </p>
      </div>
    </section>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border-[2px] border-ink bg-card px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0_0_var(--ink)]">
      {children}
    </span>
  )
}

function Channel({
  title,
  tech,
  accent,
  icon,
  ready,
  results,
}: {
  title: string
  tech: string
  accent: "primary" | "accent"
  icon: React.ReactNode
  ready: boolean
  results?: { hotel: ReturnType<typeof getHotel>; reasonTags: string[] }[]
}) {
  const isPrimary = accent === "primary"
  const headerBg = isPrimary ? "bg-primary" : "bg-accent"
  return (
    <div className="cartoon-card p-0 overflow-hidden">
      <div className={cn("flex items-center justify-between border-b-[3px] border-ink px-3 py-2", headerBg)}>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border-[2px] border-ink bg-card">
            {icon}
          </span>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold leading-none">{title}</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground/70">
              {tech}
            </span>
          </div>
        </div>
        <span className="rounded-full border-[2px] border-ink bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
          Top 3
        </span>
      </div>

      <div className="space-y-2 p-3">
        {!ready && <ChannelSkeleton accent={accent} />}
        {ready &&
          results?.map((r, idx) => (
            <div
              key={r.hotel.hotel_id}
              className="flex items-stretch gap-2 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-forwards"
              style={{ animationDelay: `${idx * 90}ms` }}
            >
              <span
                className={cn(
                  "flex w-7 shrink-0 items-center justify-center rounded-md border-[2px] border-ink font-display text-sm font-bold",
                  isPrimary ? "bg-primary" : "bg-accent",
                )}
              >
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <HotelRow
                  hotel={r.hotel}
                  reasonTags={r.reasonTags}
                  reasonAccent={accent}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

function ChannelSkeleton({ accent }: { accent: "primary" | "accent" }) {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "h-14 animate-pulse rounded-lg border-[2px] border-ink/40",
            accent === "primary" ? "bg-primary/30" : "bg-accent/30",
          )}
        />
      ))}
    </div>
  )
}
