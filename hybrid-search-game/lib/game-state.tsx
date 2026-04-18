"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"
import type { BudgetBand, City, CheckIn } from "./game-data"

export type Stage = "intro" | "level1" | "level2" | "level3" | "finish" | "deepdive"

export type GameState = {
  stage: Stage
  city?: City
  checkIn?: CheckIn
  budget?: BudgetBand
  level2Triggered: boolean
  level3Fused: boolean
  hasWon: boolean
  deepDiveScreen: number // 1..5
}

const INITIAL_STATE: GameState = {
  stage: "intro",
  city: undefined,
  checkIn: undefined,
  budget: undefined,
  level2Triggered: false,
  level3Fused: false,
  hasWon: false,
  deepDiveScreen: 1,
}

export type GameAction =
  | { type: "SET_CITY"; city: City }
  | { type: "SET_CHECKIN"; checkIn: CheckIn }
  | { type: "SET_BUDGET"; budget: BudgetBand }
  | { type: "GO_TO_STAGE"; stage: Stage }
  | { type: "TRIGGER_LEVEL2" }
  | { type: "FUSE_LEVEL3" }
  | { type: "WIN" }
  | { type: "OPEN_DEEP_DIVE" }
  | { type: "SET_DEEP_DIVE_SCREEN"; screen: number }
  | { type: "RETURN_TO_FINISH" }
  | { type: "REPLAY" }
  | { type: "HYDRATE"; state: GameState }

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_CITY":
      // Editing an upstream selection resets ALL downstream state (including win).
      return {
        ...state,
        city: action.city,
        level2Triggered: false,
        level3Fused: false,
        hasWon: false,
      }
    case "SET_CHECKIN":
      return {
        ...state,
        checkIn: action.checkIn,
        level2Triggered: false,
        level3Fused: false,
        hasWon: false,
      }
    case "SET_BUDGET":
      return {
        ...state,
        budget: action.budget,
        level2Triggered: false,
        level3Fused: false,
        hasWon: false,
      }
    case "GO_TO_STAGE":
      return { ...state, stage: action.stage }
    case "TRIGGER_LEVEL2":
      return { ...state, level2Triggered: true }
    case "FUSE_LEVEL3":
      return { ...state, level3Fused: true }
    case "WIN":
      return { ...state, hasWon: true, stage: "finish" }
    case "OPEN_DEEP_DIVE":
      return { ...state, stage: "deepdive", deepDiveScreen: 1 }
    case "SET_DEEP_DIVE_SCREEN":
      return {
        ...state,
        deepDiveScreen: Math.max(1, Math.min(5, action.screen)),
      }
    case "RETURN_TO_FINISH":
      return { ...state, stage: "finish" }
    case "REPLAY":
      // Clear all per-run state, keep nothing.
      return { ...INITIAL_STATE }
    case "HYDRATE":
      return action.state
    default:
      return state
  }
}

const STORAGE_KEY = "doris-hybrid-search-state-v1"

type Ctx = {
  state: GameState
  dispatch: (a: GameAction) => void
  confidence: number // 0..100
}

const GameContext = createContext<Ctx | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // Hydrate from sessionStorage on mount (refresh recovery within a tab).
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as GameState
        dispatch({ type: "HYDRATE", state: parsed })
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Persist on state changes.
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const confidence = useMemo(() => computeConfidence(state), [state])

  const value = useMemo(() => ({ state, dispatch, confidence }), [state, confidence])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>")
  return ctx
}

export function useGameActions() {
  const { dispatch } = useGame()
  return useMemo(
    () => ({
      setCity: (city: City) => dispatch({ type: "SET_CITY", city }),
      setCheckIn: (checkIn: CheckIn) => dispatch({ type: "SET_CHECKIN", checkIn }),
      setBudget: (budget: BudgetBand) => dispatch({ type: "SET_BUDGET", budget }),
      goToStage: (stage: Stage) => dispatch({ type: "GO_TO_STAGE", stage }),
      triggerLevel2: () => dispatch({ type: "TRIGGER_LEVEL2" }),
      fuseLevel3: () => dispatch({ type: "FUSE_LEVEL3" }),
      win: () => dispatch({ type: "WIN" }),
      openDeepDive: () => dispatch({ type: "OPEN_DEEP_DIVE" }),
      setDeepDiveScreen: (screen: number) =>
        dispatch({ type: "SET_DEEP_DIVE_SCREEN", screen }),
      returnToFinish: () => dispatch({ type: "RETURN_TO_FINISH" }),
      replay: () => dispatch({ type: "REPLAY" }),
    }),
    [dispatch],
  )
}

// Confidence model: 18% baseline, +checkpoints per progress
export function computeConfidence(s: GameState): number {
  let v = 18
  if (s.city && s.checkIn && s.budget) v = 50 // Good Options
  if (s.level2Triggered) v = 72
  if (s.level3Fused || s.hasWon) v = 100 // Best Match Found
  // Intermediate nudges during Level 1 selections
  if (v === 18) {
    const picks = [s.city, s.checkIn, s.budget].filter(Boolean).length
    v = 18 + picks * 8
  }
  return v
}

// Smooth scroll helper
export function useScrollToStage() {
  return useCallback((id: string) => {
    if (typeof window === "undefined") return
    const el = document.getElementById(id)
    if (!el) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    })
  }, [])
}
