import { GameShell } from "@/components/game/game-shell"
import { GameProvider } from "@/lib/game-state"

export default function Page() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  )
}
