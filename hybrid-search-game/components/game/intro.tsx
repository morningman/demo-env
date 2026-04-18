"use client"

import { ArrowDown, Filter, GitMerge, Radio, Sparkles } from "lucide-react"
import { useGameActions, useScrollToStage } from "@/lib/game-state"

export function Intro() {
  const { goToStage } = useGameActions()
  const scrollTo = useScrollToStage()

  function start() {
    goToStage("level1")
    requestAnimationFrame(() => scrollTo("stage-level1"))
  }

  return (
    <section
      id="stage-intro"
      aria-label="Intro"
      className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col justify-center px-5 py-12"
    >
      {/* Floating sticker */}
      <div className="mb-6 flex items-center gap-3">
        <span className="cartoon-chip cartoon-chip-accent wobble-left animate-bob">
          <Sparkles size={14} strokeWidth={3} />
          Apache Doris
        </span>
        <span className="cartoon-chip cartoon-chip-highlight wobble-right">
          Hybrid Search
        </span>
      </div>

      <h1 className="font-display text-pretty text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
        Find the stay
        <br />
        that <span className="inline-block bg-highlight px-2 -rotate-1 border-[3px] border-ink rounded-xl shadow-[3px_3px_0_0_var(--ink)]">really fits</span>.
      </h1>
      <p className="mt-5 text-pretty text-base font-semibold leading-relaxed text-muted-foreground sm:text-lg">
        One search. More than one signal.
      </p>

      <div className="cartoon-card mt-8 p-5">
        <div className="flex items-start gap-3">
          <div
            aria-hidden
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[2.5px] border-ink bg-primary shadow-[2px_2px_0_0_var(--ink)]"
          >
            <Radio size={18} strokeWidth={2.8} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-base font-semibold">
              One of these stays is the best fit. Find it.
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Plan a weekend family trip. We&apos;ll walk three stages of a real search
              pipeline — filter, retrieve, fuse — and land on the best match.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <QueryPathDiagram />
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <button type="button" onClick={start} className="cartoon-btn h-14 w-full justify-center text-lg">
          Start
          <ArrowDown className="size-5" strokeWidth={3} />
        </button>
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          ~90 seconds · mobile first
        </p>
      </div>
    </section>
  )
}

function QueryPathDiagram() {
  const nodes = [
    { icon: Filter, label: "Filter", sub: "structured", color: "bg-primary" },
    { icon: Radio, label: "Retrieve", sub: "text + vector", color: "bg-accent" },
    { icon: GitMerge, label: "Fuse", sub: "RRF", color: "bg-highlight" },
  ] as const

  return (
    <div className="relative flex items-start justify-between gap-1 sm:gap-2">
      {/* Dashed connector — horizontal line through circle centers */}
      <svg
        aria-hidden
        className="absolute left-6 right-6 top-7 h-1 w-[calc(100%-3rem)] sm:left-8 sm:right-8 sm:top-8 sm:w-[calc(100%-4rem)]"
        preserveAspectRatio="none"
        viewBox="0 0 100 4"
      >
        <line
          x1="0"
          y1="2"
          x2="100"
          y2="2"
          stroke="var(--ink)"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
      </svg>
      {nodes.map((n, i) => (
        <div key={n.label} className="relative flex w-1/3 flex-col items-center gap-2">
          <div
            className={`relative flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-ink sm:h-16 sm:w-16 ${n.color} shadow-[3px_3px_0_0_var(--ink)] ${
              i === 0 ? "wobble-left" : i === 2 ? "wobble-right" : ""
            }`}
          >
            <n.icon size={22} strokeWidth={2.5} className="text-ink sm:[&]:h-6 sm:[&]:w-6" />
          </div>
          <div className="text-center">
            <div className="font-display text-sm font-semibold">{n.label}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {n.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
