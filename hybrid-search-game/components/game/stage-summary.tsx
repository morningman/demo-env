"use client"

import { Check, Pencil } from "lucide-react"

export function StageSummary({
  title,
  checkpoint,
  summary,
  onEdit,
}: {
  title: string
  checkpoint?: string
  summary: string
  onEdit?: () => void
}) {
  return (
    <div className="cartoon-card-sm mx-auto flex w-full max-w-xl items-center gap-3 px-3 py-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2px] border-ink bg-accent">
        <Check size={14} strokeWidth={3} className="text-ink" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-bold">{title}</span>
          {checkpoint && (
            <span className="cartoon-chip cartoon-chip-primary shrink-0 !px-2 !py-0 !text-[10px] uppercase tracking-widest">
              {checkpoint}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{summary}</p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 items-center gap-1 rounded-full border-[2px] border-ink bg-card px-3 text-xs font-bold shadow-[2px_2px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5"
        >
          <Pencil size={12} strokeWidth={3} />
          Edit
        </button>
      )}
    </div>
  )
}
