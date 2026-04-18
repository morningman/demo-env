import { Anchor, Building2, Leaf, Mountain, Palmtree, Warehouse } from "lucide-react"
import type { Hotel } from "@/lib/game-data"
import { cn } from "@/lib/utils"

const ICON_MAP = {
  harbor: Anchor,
  park: Leaf,
  skyline: Building2,
  beach: Palmtree,
  garden: Leaf,
  loft: Warehouse,
} as const

// Flat cartoon colour fills (3-5 palette colours, no gradients).
const COLOR_MAP = {
  harbor: "bg-accent",         // mint
  park: "bg-accent",           // mint
  skyline: "bg-primary",       // lemon
  beach: "bg-highlight",       // coral
  garden: "bg-primary",        // lemon
  loft: "bg-highlight",        // coral
} as const

export function Illustration({
  hotel,
  className,
  size = "md",
}: {
  hotel: Pick<Hotel, "illustration_key">
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const Icon = ICON_MAP[hotel.illustration_key] ?? Mountain
  const color = COLOR_MAP[hotel.illustration_key]
  const sizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
  } as const
  const iconSizes = { sm: 20, md: 26, lg: 36 } as const

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        "rounded-2xl border-[3px] border-ink",
        "shadow-[3px_3px_0_0_var(--ink)]",
        color,
        sizes[size],
        className,
      )}
    >
      {/* Paper dots for warmth */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(var(--ink) 0.9px, transparent 1.2px)",
          backgroundSize: "8px 8px",
        }}
      />
      <Icon size={iconSizes[size]} strokeWidth={2.5} className="relative text-ink" />
    </div>
  )
}
