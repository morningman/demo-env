"use client"

import { useEffect, useMemo, useState } from "react"
import { Crown, GitMerge, Sparkles } from "lucide-react"
import { getHotel, getStageResults } from "@/lib/game-data"
import { useGame, useGameActions, useScrollToStage } from "@/lib/game-state"
import { cn } from "@/lib/utils"
import { Header } from "./level-1"
import { HotelRow } from "./hotel-card"

export function Level3() {
  const { state } = useGame()
  const { fuseLevel3, win } = useGameActions()
  const scrollTo = useScrollToStage()

  const [showFinal, setShowFinal] = useState(false)
  const [burst, setBurst] = useState(false)

  const results = useMemo(
    () =>
      state.city && state.budget ? getStageResults(state.city, state.budget) : null,
    [state.city, state.budget],
  )

  useEffect(() => {
    if (state.stage !== "level3") return
    if (!results) return
    if (state.level3Fused) {
      setShowFinal(true)
      return
    }
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const startDelay = reduced ? 100 : 350
    const finalDelay = reduced ? 200 : 1400
    const burstDelay = reduced ? 300 : 1700
    const winDelay = reduced ? 400 : 2400

    const t0 = window.setTimeout(() => fuseLevel3(), startDelay)
    const t1 = window.setTimeout(() => setShowFinal(true), finalDelay)
    const t2 = window.setTimeout(() => setBurst(true), burstDelay)
    const t3 = window.setTimeout(() => {
      win()
      requestAnimationFrame(() => scrollTo("stage-finish"))
    }, winDelay)
    return () => {
      window.clearTimeout(t0)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stage])

  if (!results) return null

  const finalHotels = results.final_top3.map(getHotel)

  return (
    <section
      id="stage-level3"
      aria-label="Level 3 · Fuse to win"
      className="relative mx-auto w-full max-w-xl px-5 py-10"
    >
      <Header
        number="03"
        title="Final Ranking"
        subtitle="Text and semantic results are fused into one final Top 3."
        technique="RRF Fusion"
        color="highlight"
      />

      {/* Fusion arena */}
      <div className="cartoon-card relative mt-6 overflow-hidden p-3 sm:p-4">
        {/* Dashed beam — only on tablet+ where the 3-col layout has a center column */}
        <svg
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-1/2 top-3 hidden h-[62%] w-1 -translate-x-1/2 sm:block",
            !showFinal && "animate-beam",
          )}
          preserveAspectRatio="none"
          viewBox="0 0 2 100"
        >
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="100"
            stroke="var(--ink)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Mobile-only RRF header pinned above the two columns */}
        <div className="mb-3 flex items-center justify-center gap-2 sm:hidden">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink bg-highlight shadow-[3px_3px_0_0_var(--ink)] transition-transform",
              !showFinal && "animate-pulse",
              showFinal && "scale-110",
            )}
          >
            <GitMerge size={18} strokeWidth={2.8} className="text-ink" />
          </div>
          <span className="cartoon-chip cartoon-chip-highlight !text-[10px]">
            RRF · fusing
          </span>
        </div>

        <div className="relative grid grid-cols-2 items-start gap-2 sm:grid-cols-[1fr_auto_1fr]">
          <SideStack
            accent="primary"
            items={results.text_top3.map((r) => ({
              hotel: getHotel(r.hotel_id),
              reasons: r.reason_tags,
            }))}
            converged={showFinal}
            direction="left"
          />

          {/* Desktop-only RRF center column */}
          <div className="hidden flex-col items-center gap-2 pt-8 sm:flex">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-ink bg-highlight shadow-[3px_3px_0_0_var(--ink)] transition-transform",
                !showFinal && "animate-pulse",
                showFinal && "scale-110",
              )}
            >
              <GitMerge size={22} strokeWidth={2.8} className="text-ink" />
            </div>
            <span className="cartoon-chip cartoon-chip-highlight !text-[10px]">RRF</span>
          </div>

          <SideStack
            accent="accent"
            items={results.semantic_top3.map((r) => ({
              hotel: getHotel(r.hotel_id),
              reasons: r.reason_tags,
            }))}
            converged={showFinal}
            direction="right"
          />
        </div>

        {/* Final Top 3 */}
        <div
          className={cn(
            "mt-6 space-y-2 transition-all duration-500",
            showFinal ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="cartoon-chip cartoon-chip-highlight">
              <Sparkles size={12} strokeWidth={3} />
              Final Top 3
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              fused ranking
            </span>
          </div>
          {finalHotels.map((h, idx) => (
            <div
              key={h.hotel_id}
              className="flex items-stretch gap-2 opacity-0 animate-in fade-in slide-in-from-bottom-1 fill-mode-forwards duration-500"
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <span
                className={cn(
                  "flex w-9 shrink-0 items-center justify-center rounded-md border-[2.5px] border-ink font-display text-lg font-bold",
                  idx === 0 ? "bg-highlight shadow-[2px_2px_0_0_var(--ink)]" : "bg-card",
                )}
              >
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <HotelRow hotel={h} highlight={idx === 0} />
              </div>
            </div>
          ))}
        </div>

        {/* Burst: crown sticker */}
        {burst && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-start justify-center pt-16"
          >
            <div className="animate-pop">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-ink bg-highlight shadow-[4px_4px_0_0_var(--ink)]">
                <Crown size={36} strokeWidth={2.8} className="text-ink" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function SideStack({
  accent,
  items,
  converged,
  direction,
}: {
  accent: "primary" | "accent"
  items: { hotel: ReturnType<typeof getHotel>; reasons: string[] }[]
  converged: boolean
  direction: "left" | "right"
}) {
  const isPrimary = accent === "primary"
  const bg = isPrimary ? "bg-primary" : "bg-accent"
  return (
    <div className="flex flex-col gap-1.5">
      <span className={cn("cartoon-chip !text-[10px]", isPrimary ? "cartoon-chip-primary" : "cartoon-chip-accent")}>
        {isPrimary ? "Text" : "Semantic"}
      </span>
      {items.map((r, idx) => (
        <div
          key={r.hotel.hotel_id}
          className={cn(
            "rounded-xl border-[2px] border-ink px-2 py-1.5 text-[11px] font-bold shadow-[2px_2px_0_0_var(--ink)] transition-all duration-700",
            bg,
            converged &&
              (direction === "left"
                ? "translate-x-2 opacity-40 blur-[0.5px]"
                : "-translate-x-2 opacity-40 blur-[0.5px]"),
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-ink">{r.hotel.hotel_name}</span>
            <span className="shrink-0 font-mono text-[10px] text-ink/80">#{idx + 1}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
