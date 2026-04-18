"use client"

import { useGame } from "@/lib/game-state"
import { cn } from "@/lib/utils"

export function MatchConfidence() {
  const { confidence, state } = useGame()
  const hitGoodOptions = confidence >= 50
  const hitBestMatch = confidence >= 100

  // Hide on Deep Dive — it is not part of the main flow.
  if (state.stage === "deepdive") return null

  return (
    <aside
      aria-label="Match Confidence progress"
      className="pointer-events-none fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex"
    >
      <span className="cartoon-chip cartoon-chip-primary !text-[9px] uppercase tracking-widest">
        Match
      </span>
      <div className="relative h-72 w-5 overflow-hidden rounded-full border-[3px] border-ink bg-card shadow-[3px_3px_0_0_var(--ink)]">
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 bg-highlight transition-[height] duration-700 ease-out"
          style={{ height: `${confidence}%` }}
        />
        {/* Checkpoint: Good Options at 50% */}
        <CheckpointTick at={50} hit={hitGoodOptions} />
        {/* Checkpoint: Best Match Found at 100% */}
        <CheckpointTick at={100} hit={hitBestMatch} />
      </div>
      <div className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
        <span className={cn(hitBestMatch ? "text-foreground" : "text-muted-foreground")}>
          Best Match
        </span>
        <span className={cn(hitGoodOptions && !hitBestMatch ? "text-foreground" : "text-muted-foreground")}>
          Good Options
        </span>
      </div>
    </aside>
  )
}

function CheckpointTick({ at, hit }: { at: number; hit: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full transition-colors",
        hit ? "bg-ink" : "bg-ink/30",
      )}
      style={{ bottom: `calc(${at}% - 1.5px)` }}
    />
  )
}

// Inline mobile version that sits at the top of the page.
export function MatchConfidenceMobile() {
  const { confidence, state } = useGame()
  if (state.stage === "deepdive") return null

  const goodOptions = confidence >= 50
  const bestMatch = confidence >= 100

  return (
    <div className="sticky top-0 z-30 border-b-[3px] border-ink bg-background/95 backdrop-blur-md sm:hidden">
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Match
        </span>
        <div className="relative h-3 flex-1 overflow-hidden rounded-full border-[2px] border-ink bg-card">
          <div
            className="absolute inset-y-0 left-0 bg-highlight transition-[width] duration-700 ease-out"
            style={{ width: `${confidence}%` }}
          />
          <span
            aria-hidden
            className={cn(
              "absolute top-0 h-3 w-[2px] -translate-x-1/2",
              goodOptions ? "bg-ink" : "bg-ink/30",
            )}
            style={{ left: "50%" }}
          />
          <span
            aria-hidden
            className={cn(
              "absolute top-0 h-3 w-[2px] -translate-x-1/2",
              bestMatch ? "bg-ink" : "bg-ink/30",
            )}
            style={{ left: "99%" }}
          />
        </div>
        <span className="font-mono text-xs font-bold tabular-nums">
          {Math.round(confidence)}%
        </span>
      </div>
    </div>
  )
}
