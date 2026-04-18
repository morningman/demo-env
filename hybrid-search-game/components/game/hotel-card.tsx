import type { Hotel } from "@/lib/game-data"
import { Illustration } from "./illustration"
import { cn } from "@/lib/utils"

export function HotelRow({
  hotel,
  highlight,
  reasonTags,
  reasonAccent,
}: {
  hotel: Hotel
  highlight?: boolean
  reasonTags?: string[]
  reasonAccent?: "primary" | "accent"
}) {
  // On mobile we show fewer base tags to avoid wrapping the card.
  const mobileTagCount = 1
  const baseTags = hotel.hotel_tags
  const reasonTagCount = reasonTags?.length ?? 0
  // If there are reason tags, drop most of the base tags on mobile
  // so the reason tags (the story of *why*) always stay visible.
  const mobileBaseCap = reasonTagCount > 0 ? 0 : mobileTagCount

  return (
    <div
      className={cn(
        "cartoon-card-sm cartoon-card-lift flex items-center gap-2.5 px-2.5 py-2.5 sm:gap-3 sm:px-3 sm:py-3",
        highlight && "!bg-primary",
      )}
    >
      <Illustration hotel={hotel} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="truncate text-sm font-bold text-foreground">{hotel.hotel_name}</h4>
          <span className="shrink-0 font-mono text-xs font-bold text-foreground">
            ${hotel.nightly_price}
            <span className="text-foreground/60">/nt</span>
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{hotel.location_line}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {baseTags.map((t, i) => (
            <span
              key={t}
              className={cn(
                "rounded-full border-[1.5px] border-ink bg-background px-1.5 py-0.5 text-[10px] font-bold text-foreground",
                // hide extra base tags on mobile to keep the card one row tall
                i >= mobileBaseCap && "hidden sm:inline-flex",
              )}
            >
              {t}
            </span>
          ))}
          {reasonTags?.map((t) => (
            <span
              key={t}
              className={cn(
                "rounded-full border-[1.5px] border-ink px-1.5 py-0.5 text-[10px] font-bold text-foreground",
                reasonAccent === "accent" ? "bg-accent" : "bg-highlight",
              )}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
