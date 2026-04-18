"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Crown, ExternalLink, RotateCcw, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BUDGET_MAP, getHotel, getStageResults } from "@/lib/game-data"
import { useGame, useGameActions, useScrollToStage } from "@/lib/game-state"
import { Illustration } from "./illustration"
import { HotelRow } from "./hotel-card"

const DORIS_LINK = "#"

export function Finish() {
  const { state } = useGame()
  const { openDeepDive, replay } = useGameActions()
  const scrollTo = useScrollToStage()
  const [modalOpen, setModalOpen] = useState(true)

  const results = useMemo(
    () =>
      state.city && state.budget ? getStageResults(state.city, state.budget) : null,
    [state.city, state.budget],
  )

  if (!results) return null

  const [id1, id2, id3] = results.final_top3
  const top1 = getHotel(id1)
  const top2 = getHotel(id2)
  const top3 = getHotel(id3)

  function handleDeepDive() {
    setModalOpen(false)
    openDeepDive()
    requestAnimationFrame(() => scrollTo("stage-deepdive"))
  }

  function handleReplay() {
    setModalOpen(false)
    replay()
    requestAnimationFrame(() => scrollTo("stage-intro"))
  }

  return (
    <section
      id="stage-finish"
      aria-label="Best match found"
      className="relative mx-auto w-full max-w-xl px-5 py-10"
    >
      {/* Persistent win card (shown even after modal dismissed) */}
      <div className="cartoon-card relative p-5">
        <div className="absolute -top-4 left-5 flex items-center gap-1 rounded-full border-[2.5px] border-ink bg-highlight px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-[2px_2px_0_0_var(--ink)]">
          <Crown size={14} strokeWidth={3} />
          Best Match · 100%
        </div>

        <h2 className="mt-3 font-display text-pretty text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {top1.hotel_name}
        </h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">{top1.location_line}</p>

        <div className="cartoon-card-sm mt-5 flex items-center gap-3 p-3">
          <Illustration hotel={top1} size="md" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {top1.hotel_description}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 cartoon-chip cartoon-chip-accent !text-[10px]">
              <Sparkles size={11} strokeWidth={3} />
              Filter · Text · Vector
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <SecondaryCard rank={2} hotel={top2} />
          <SecondaryCard rank={3} hotel={top3} />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="cartoon-btn h-12 w-full justify-center"
          >
            Show result summary
            <ArrowRight className="size-5" strokeWidth={3} />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDeepDive}
              className="cartoon-btn cartoon-btn-ghost h-11 flex-1 justify-center text-sm"
            >
              See how Doris did it
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className="cartoon-btn cartoon-btn-ghost h-11 justify-center px-3"
              aria-label="Replay the experience"
            >
              <RotateCcw className="size-4" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      <WinModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        top1={top1}
        top2={top2}
        top3={top3}
        city={state.city}
        budget={state.budget}
        onDeepDive={handleDeepDive}
        onReplay={handleReplay}
      />
    </section>
  )
}

function SecondaryCard({
  rank,
  hotel,
}: {
  rank: number
  hotel: ReturnType<typeof getHotel>
}) {
  return (
    <div className="cartoon-card-sm flex items-center gap-2 p-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-[2px] border-ink bg-accent font-display text-sm font-bold">
        {rank}
      </span>
      {/* Illustration is visual nice-to-have; hide it on narrow screens so the
          name + price stay readable inside a 2-col grid. */}
      <div className="hidden sm:block">
        <Illustration hotel={hotel} size="sm" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold">{hotel.hotel_name}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          ${hotel.nightly_price}/nt
        </p>
      </div>
    </div>
  )
}

function WinModal({
  open,
  onOpenChange,
  top1,
  top2,
  top3,
  city,
  budget,
  onDeepDive,
  onReplay,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  top1: ReturnType<typeof getHotel>
  top2: ReturnType<typeof getHotel>
  top3: ReturnType<typeof getHotel>
  city?: string
  budget?: keyof typeof BUDGET_MAP
  onDeepDive: () => void
  onReplay: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto border-[3px] border-ink bg-card shadow-[6px_6px_0_0_var(--ink)] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="cartoon-chip cartoon-chip-highlight animate-bob">
              <Crown size={12} strokeWidth={3} />
              Best Match Found
            </span>
          </div>
          <DialogTitle className="mt-2 font-display text-2xl leading-tight">
            {top1.hotel_name}
          </DialogTitle>
          <DialogDescription className="text-xs font-semibold">
            {city} · {budget ? BUDGET_MAP[budget].label : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Primary */}
          <div className="rounded-2xl border-[3px] border-ink bg-primary p-3 shadow-[3px_3px_0_0_var(--ink)]">
            <div className="flex items-center gap-3">
              <Illustration hotel={top1} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-display text-base font-semibold">
                    {top1.hotel_name}
                  </span>
                  <span className="shrink-0 font-mono text-xs font-bold">
                    ${top1.nightly_price}/nt
                  </span>
                </div>
                <p className="truncate text-xs font-semibold">{top1.location_line}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink/80">
              {top1.hotel_description}
            </p>
          </div>

          {/* Secondary two */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <HotelRow hotel={top2} />
            <HotelRow hotel={top3} />
          </div>

          <p className="rounded-xl border-[2px] border-ink bg-background px-3 py-2 text-xs font-semibold leading-relaxed">
            Apache Doris can filter, retrieve, and fuse in one flow.
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <a
            href={DORIS_LINK}
            className="cartoon-btn h-12 w-full justify-center text-sm sm:text-base"
          >
            <span className="sm:hidden">Hybrid Search on Doris</span>
            <span className="hidden sm:inline">Continue learning about Hybrid Search</span>
            <ExternalLink className="size-4" strokeWidth={3} />
          </a>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onDeepDive}
              className="cartoon-btn cartoon-btn-ghost flex-1 justify-center text-sm"
            >
              See how Doris did it
            </button>
            <button
              type="button"
              onClick={onReplay}
              className="cartoon-btn cartoon-btn-ghost shrink-0 justify-center px-3"
              aria-label="Replay the experience"
            >
              <RotateCcw className="size-4" strokeWidth={3} />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
