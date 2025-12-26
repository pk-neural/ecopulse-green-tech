export interface User {
  id: string
  email: string
  city: string
  state: string
  lat: number
  lon: number
  createdAt: string
}

export interface DailyInput {
  id: string
  userId: string
  date: string
  acFanHours: number
  waterUsage: number
  outdoorExposure: "low" | "medium" | "high"
  transportMode: "walk" | "cycle" | "public" | "private"
  wasteSegregation: boolean
  timestamp: string
  locked: boolean
}

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  uvIndex: number
  aqi: number
  condition: string
}

export interface GreenMetrics {
  greenIndex: number
  energyStress: number
  waterStress: number
  airQuality: number
  solarPotential: number
}

export interface EcoScore {
  waterCredit: number
  energyCredit: number
  transportCredit: number
  wasteCredit: number
  totalScore: number
  debt: number
}

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
  earned: boolean
  earnedAt?: string
}

export interface ForecastDay {
  date: string
  tempMax: number
  tempMin: number
  rainProbability: number
  aqi: number
  condition: string
}

export interface CityImpact {
  waterSaved: number
  energyReduced: number
  co2Avoided: number
  householdsSupplied: number
  streetlightsPowered: number
  treesEquivalent: number
}

export interface DailyGreenIndex {
  date: string
  userId: string
  score: number
  breakdown: {
    waterPenalty: number
    energyPenalty: number
    transportBonus: number
    wasteBonus: number
    outdoorBonus: number
  }
}

export interface WasteDecision {
  type: "e-waste" | "dry" | "wet" | "hazardous" | "mixed"
  action: "reduce" | "reuse" | "recycle" | "recover"
  whatToDo: string[]
  whatToAvoid: string[]
  whyItMatters: string
  ecoCredits: number
}
