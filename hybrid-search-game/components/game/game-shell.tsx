"use client"

import { useEffect } from "react"
import { BUDGET_MAP, type BudgetBand } from "@/lib/game-data"
import {
  useGame,
  useGameActions,
  useScrollToStage,
  type Stage,
} from "@/lib/game-state"
import { DeepDive } from "./deep-dive"
import { Finish } from "./finish"
import { Intro } from "./intro"
import { Level1 } from "./level-1"
import { Level2 } from "./level-2"
import { Level3 } from "./level-3"
import {
  MatchConfidence,
  MatchConfidenceMobile,
} from "./match-confidence"
import { StageSummary } from "./stage-summary"

const ORDER: Stage[] = ["intro", "level1", "level2", "level3", "finish", "deepdive"]
function idx(s: Stage) {
  return ORDER.indexOf(s)
}

export function GameShell() {
  const { state } = useGame()
  const { goToStage } = useGameActions()
  const scrollTo = useScrollToStage()

  // On reload, scroll to the current stage after hydration paints.
  useEffect(() => {
    const id = `stage-${state.stage}`
    const el = document.getElementById(id)
    if (!el) return
    const t = window.setTimeout(() => scrollTo(id), 80)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showAsSummary = (name: Stage) =>
    idx(state.stage) > idx(name) && name !== "finish" && name !== "deepdive"
  const showAsFull = (name: Stage) => state.stage === name

  function editStage(target: Stage) {
    goToStage(target)
    requestAnimationFrame(() => scrollTo(`stage-${target}`))
  }

  return (
    <main className="relative min-h-[100svh] w-full">
      <MatchConfidenceMobile />
      <MatchConfidence />

      {/* Intro */}
      {showAsFull("intro") && <Intro />}

      {/* Level 1 */}
      {showAsFull("level1") && <Level1 />}
      {showAsSummary("level1") && (
        <div className="mx-auto w-full max-w-xl px-5 pt-6">
          <StageSummary
            title="Level 1 · Narrow the field"
            checkpoint="Good Options"
            summary={summarizeLevel1(state.city, state.checkIn, state.budget)}
            onEdit={() => editStage("level1")}
          />
        </div>
      )}

      {/* Level 2 */}
      {showAsFull("level2") && <Level2 />}
      {showAsSummary("level2") && (
        <div className="mx-auto w-full max-w-xl px-5 pt-3">
          <StageSummary
            title="Level 2 · Retrieve in parallel"
            summary="Text Top 3 and Semantic Top 3 ran on the same candidate view."
            onEdit={() => editStage("level2")}
          />
        </div>
      )}

      {/* Level 3 */}
      {showAsFull("level3") && <Level3 />}
      {showAsSummary("level3") && (
        <div className="mx-auto w-full max-w-xl px-5 pt-3">
          <StageSummary
            title="Level 3 · Fuse to win"
            checkpoint="Best Match Found"
            summary="RRF fused the two ranked lists into the final Top 3."
          />
        </div>
      )}

      {/* Finish / Win */}
      {(state.stage === "finish" || state.stage === "deepdive") &&
        state.hasWon && <Finish />}

      {/* Deep Dive */}
      {state.stage === "deepdive" && <DeepDive />}

      <footer className="mx-auto w-full max-w-xl px-5 pb-16 pt-10 text-center">
        <span className="cartoon-chip cartoon-chip-primary !text-[10px]">
          Apache Doris · Hybrid Search Demo
        </span>
      </footer>
    </main>
  )
}

function summarizeLevel1(
  city?: string,
  checkIn?: string,
  budget?: BudgetBand,
): string {
  const parts = [
    city ? `City: ${city}` : null,
    checkIn ? `Check-in: ${checkIn}` : null,
    budget ? `Budget: ${BUDGET_MAP[budget].label}` : null,
  ].filter(Boolean)
  if (parts.length === 0) return "No selections yet."
  return `${parts.join(" · ")} · 10 shortlisted stays`
}
