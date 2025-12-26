import type { User, DailyInput, EcoScore, Badge, WasteDecision, DailyGreenIndex } from "./types"
import { ENTRY_LOCK_DURATION } from "./config"
import { calculateDailyGreenIndex } from "./calculations"

const STORAGE_KEYS = {
  USER: "ecopulse_user",
  DAILY_INPUTS: "ecopulse_daily_inputs",
  ECO_SCORE: "ecopulse_eco_score",
  BADGES: "ecopulse_badges",
  WASTE_DECISIONS: "ecopulse_waste_decisions",
  DAILY_GREEN_INDEX: "ecopulse_daily_green_index",
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? JSON.parse(data) : null
}

export function setUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEYS.USER)
}

export function getDailyInputs(): DailyInput[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_INPUTS)
  return data ? JSON.parse(data) : []
}

export function addDailyInput(input: DailyInput): void {
  const inputs = getDailyInputs()
  inputs.push(input)
  localStorage.setItem(STORAGE_KEYS.DAILY_INPUTS, JSON.stringify(inputs))

  // Get previous scores for momentum calculation
  const previousScores = getDailyGreenIndexScores(input.userId)

  // Calculate and store the daily green index with previous scores
  const dailyGreenIndex = calculateDailyGreenIndex(input, previousScores)
  saveDailyGreenIndex(dailyGreenIndex)
}

export function getTodayInput(userId: string): DailyInput | null {
  const inputs = getDailyInputs()
  const today = new Date().toISOString().split("T")[0]
  return inputs.find((i) => i.userId === userId && i.date === today) || null
}

export function canSubmitToday(userId: string): boolean {
  const inputs = getDailyInputs().filter((i) => i.userId === userId)
  if (inputs.length === 0) return true

  const lastInput = inputs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const lastSubmitTime = new Date(lastInput.timestamp).getTime()
  const now = Date.now()

  return now - lastSubmitTime >= ENTRY_LOCK_DURATION
}

export function getTimeUntilNextEntry(userId: string): number {
  const inputs = getDailyInputs().filter((i) => i.userId === userId)
  if (inputs.length === 0) return 0

  const lastInput = inputs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const lastSubmitTime = new Date(lastInput.timestamp).getTime()
  const now = Date.now()
  const elapsed = now - lastSubmitTime

  return Math.max(0, ENTRY_LOCK_DURATION - elapsed)
}

export function getEcoScore(): EcoScore {
  if (typeof window === "undefined")
    return { waterCredit: 0, energyCredit: 0, transportCredit: 0, wasteCredit: 0, totalScore: 0, debt: 0 }
  const data = localStorage.getItem(STORAGE_KEYS.ECO_SCORE)
  return data
    ? JSON.parse(data)
    : { waterCredit: 0, energyCredit: 0, transportCredit: 0, wasteCredit: 0, totalScore: 0, debt: 0 }
}

export function updateEcoScore(score: EcoScore): void {
  localStorage.setItem(STORAGE_KEYS.ECO_SCORE, JSON.stringify(score))
}

export function getBadges(): Badge[] {
  if (typeof window === "undefined") return getDefaultBadges()
  const data = localStorage.getItem(STORAGE_KEYS.BADGES)
  return data ? JSON.parse(data) : getDefaultBadges()
}

export function updateBadges(badges: Badge[]): void {
  localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges))
}

function getDefaultBadges(): Badge[] {
  return [
    {
      id: "eco-starter",
      name: "Eco Starter",
      icon: "Leaf",
      description: "Complete your first daily input",
      earned: false,
    },
    {
      id: "water-saver",
      name: "Water Saver",
      icon: "Droplets",
      description: "Use less than 100L water for 3 days",
      earned: false,
    },
    {
      id: "energy-aware",
      name: "Energy Aware",
      icon: "Zap",
      description: "Keep AC/Fan under 4 hours for 5 days",
      earned: false,
    },
    {
      id: "green-champion",
      name: "Green Champion",
      icon: "Trophy",
      description: "Achieve 80+ Green Index for a week",
      earned: false,
    },
    {
      id: "air-guardian",
      name: "Air Guardian",
      icon: "Wind",
      description: "Use public/walk/cycle transport for 7 days",
      earned: false,
    },
    {
      id: "solar-hero",
      name: "Solar Hero",
      icon: "Sun",
      description: "High outdoor exposure for 5 days",
      earned: false,
    },
  ]
}

export function getWasteDecisions(): WasteDecision[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.WASTE_DECISIONS)
  return data ? JSON.parse(data) : []
}

export function addWasteDecision(decision: WasteDecision): void {
  const decisions = getWasteDecisions()
  decisions.push(decision)
  localStorage.setItem(STORAGE_KEYS.WASTE_DECISIONS, JSON.stringify(decisions))
}

export function getDailyGreenIndexScores(userId: string): DailyGreenIndex[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_GREEN_INDEX)
  const allScores: DailyGreenIndex[] = data ? JSON.parse(data) : []
  return allScores
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function saveDailyGreenIndex(index: DailyGreenIndex): void {
  const allScores = getAllDailyGreenIndexScores()
  const existingIdx = allScores.findIndex((s) => s.date === index.date && s.userId === index.userId)
  if (existingIdx >= 0) {
    return
  }
  allScores.push(index)
  localStorage.setItem(STORAGE_KEYS.DAILY_GREEN_INDEX, JSON.stringify(allScores))
}

function getAllDailyGreenIndexScores(): DailyGreenIndex[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_GREEN_INDEX)
  return data ? JSON.parse(data) : []
}
