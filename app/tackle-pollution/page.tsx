"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  Recycle,
  Trash2,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Smartphone,
  Package,
  Apple,
  Skull,
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { Header } from "@/components/header"
import { FloatingParticles } from "@/components/particles"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { getUser, getEcoScore, getDailyInputs, addWasteDecision } from "@/lib/storage"
import { getWasteRecommendation } from "@/lib/calculations"
import type { User, EcoScore, DailyInput } from "@/lib/types"

const wasteTypes = [
  { id: "e-waste", label: "E-Waste", icon: Smartphone, description: "Electronics, batteries, cables" },
  { id: "dry", label: "Dry Waste", icon: Package, description: "Paper, plastic, cardboard" },
  { id: "wet", label: "Wet Waste", icon: Apple, description: "Food scraps, organic matter" },
  { id: "hazardous", label: "Hazardous", icon: Skull, description: "Chemicals, medicines, paints" },
  { id: "mixed", label: "Mixed Waste", icon: Layers, description: "Unsegregated waste" },
]

const conditions = [
  { id: "working", label: "Working/Fresh" },
  { id: "broken", label: "Broken/Damaged" },
  { id: "expired", label: "Expired" },
  { id: "contaminated", label: "Contaminated" },
]

export default function TacklePollutionPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [ecoScore, setEcoScore] = useState<EcoScore | null>(null)
  const [inputs, setInputs] = useState<DailyInput[]>([])

  // Waste decision state
  const [selectedWaste, setSelectedWaste] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<{
    action: string
    whatToDo: string[]
    whatToAvoid: string[]
    whyItMatters: string
    ecoCredits: number
  } | null>(null)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    setEcoScore(getEcoScore())
    setInputs(getDailyInputs().filter((i) => i.userId === currentUser.id))
    setLoading(false)
  }, [router])

  const handleGetRecommendation = () => {
    if (!selectedWaste || !selectedCondition) return

    const rec = getWasteRecommendation(
      selectedWaste as "e-waste" | "dry" | "wet" | "hazardous" | "mixed",
      selectedCondition as "working" | "broken" | "expired" | "contaminated",
    )
    setRecommendation(rec)

    // Save decision
    addWasteDecision({
      type: selectedWaste as "e-waste" | "dry" | "wet" | "hazardous" | "mixed",
      action: rec.action,
      whatToDo: rec.whatToDo,
      whatToAvoid: rec.whatToAvoid,
      whyItMatters: rec.whyItMatters,
      ecoCredits: rec.ecoCredits,
    })
  }

  const resetForm = () => {
    setSelectedWaste(null)
    setSelectedCondition(null)
    setRecommendation(null)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "reduce":
        return "text-blue-400 bg-blue-500/20"
      case "reuse":
        return "text-emerald-400 bg-emerald-500/20"
      case "recycle":
        return "text-amber-400 bg-amber-500/20"
      case "recover":
        return "text-purple-400 bg-purple-500/20"
      default:
        return "text-foreground bg-white/20"
    }
  }

  // Calculate eco credit/debt summary
  const calculateEcoSummary = () => {
    if (!ecoScore) return { net: 0, status: "neutral" }

    const totalCredit = ecoScore.waterCredit + ecoScore.energyCredit + ecoScore.transportCredit + ecoScore.wasteCredit
    const net = totalCredit - ecoScore.debt

    return {
      net,
      status: net > 0 ? "credit" : net < 0 ? "debt" : "neutral",
    }
  }

  const ecoSummary = calculateEcoSummary()

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950">
      <FloatingParticles />
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Recycle className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Tackle Pollution</h1>
          </div>
          <p className="text-muted-foreground">Smart waste management and eco score tracking with the 4R system.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Waste Decision System */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waste Type Selection */}
            <div className="bg-background/40 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-500/20 rounded-lg">
                  <Trash2 className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Smart Waste Decision System</h2>
                  <p className="text-sm text-muted-foreground">Based on 4R: Reduce, Reuse, Recycle, Recover</p>
                </div>
              </div>

              {!recommendation ? (
                <div className="space-y-6">
                  <div>
                    <Label className="text-foreground mb-3 block">Select Waste Type</Label>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {wasteTypes.map((waste) => (
                        <button
                          key={waste.id}
                          type="button"
                          onClick={() => setSelectedWaste(waste.id)}
                          className={`p-4 rounded-xl border transition-all text-left ${
                            selectedWaste === waste.id
                              ? "bg-emerald-500/20 border-emerald-500/50"
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${selectedWaste === waste.id ? "bg-emerald-500/30" : "bg-white/10"}`}
                            >
                              <waste.icon
                                className={`h-5 w-5 ${selectedWaste === waste.id ? "text-emerald-400" : "text-muted-foreground"}`}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{waste.label}</p>
                              <p className="text-xs text-muted-foreground">{waste.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedWaste && (
                    <div>
                      <Label className="text-foreground mb-3 block">Condition</Label>
                      <RadioGroup
                        value={selectedCondition || ""}
                        onValueChange={setSelectedCondition}
                        className="grid sm:grid-cols-2 gap-3"
                      >
                        {conditions.map((condition) => (
                          <div
                            key={condition.id}
                            className={`p-3 rounded-lg border transition-all ${
                              selectedCondition === condition.id
                                ? "bg-emerald-500/20 border-emerald-500/50"
                                : "bg-white/5 border-white/10"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={condition.id} id={condition.id} />
                              <Label htmlFor={condition.id} className="text-foreground cursor-pointer">
                                {condition.label}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {selectedWaste && selectedCondition && (
                    <Button
                      onClick={handleGetRecommendation}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      Get Recommendation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Recommendation Result */}
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
                    <p className="text-sm text-muted-foreground mb-2">Recommended Action</p>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-lg font-bold uppercase ${getActionColor(recommendation.action)}`}
                    >
                      {recommendation.action}
                    </span>
                    <p className="text-sm text-emerald-400 mt-2">+{recommendation.ecoCredits} Eco Credits</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <h3 className="font-medium text-foreground">What To Do</h3>
                      </div>
                      <ul className="space-y-2">
                        {recommendation.whatToDo.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="h-5 w-5 text-red-400" />
                        <h3 className="font-medium text-foreground">What To Avoid</h3>
                      </div>
                      <ul className="space-y-2">
                        {recommendation.whatToAvoid.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="h-5 w-5 text-blue-400" />
                      <h3 className="font-medium text-foreground">Why It Matters</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{recommendation.whyItMatters}</p>
                  </div>

                  <Button onClick={resetForm} variant="outline" className="w-full bg-transparent">
                    Make Another Decision
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Eco Score Sidebar */}
          <div className="space-y-6">
            {/* Unified Eco Score */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Leaf className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-foreground">Unified Eco Score</h3>
              </div>

              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2">
                  {ecoSummary.status === "credit" ? (
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  ) : ecoSummary.status === "debt" ? (
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  ) : (
                    <Minus className="h-6 w-6 text-muted-foreground" />
                  )}
                  <span
                    className={`text-4xl font-bold ${
                      ecoSummary.status === "credit"
                        ? "text-emerald-400"
                        : ecoSummary.status === "debt"
                          ? "text-red-400"
                          : "text-foreground"
                    }`}
                  >
                    {ecoSummary.net > 0 ? "+" : ""}
                    {ecoSummary.net}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {ecoSummary.status === "credit"
                    ? "Eco Credit"
                    : ecoSummary.status === "debt"
                      ? "Eco Debt"
                      : "Neutral"}
                </p>
              </div>

              {ecoScore && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Water Credit</span>
                    <span className="text-blue-400">+{ecoScore.waterCredit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Energy Credit</span>
                    <span className="text-amber-400">+{ecoScore.energyCredit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transport Credit</span>
                    <span className="text-purple-400">+{ecoScore.transportCredit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Waste Credit</span>
                    <span className="text-emerald-400">+{ecoScore.wasteCredit}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                    <span className="text-muted-foreground">Eco Debt</span>
                    <span className="text-red-400">-{ecoScore.debt}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Debt Repayment Suggestions */}
            {ecoScore && ecoScore.debt > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <h3 className="font-semibold text-foreground">Repay Your Debt</h3>
                </div>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    Reduce AC usage by 1 hour tomorrow
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    Use public transport instead of private
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    Segregate waste properly for a week
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    Take shorter showers to save water
                  </li>
                </ul>
              </div>
            )}

            {/* 4R Guide */}
            <div className="bg-background/40 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">4R Waste Hierarchy</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Reduce</p>
                    <p className="text-xs text-muted-foreground">Minimize waste generation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Reuse</p>
                    <p className="text-xs text-muted-foreground">Give items a second life</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Recycle</p>
                    <p className="text-xs text-muted-foreground">Convert to new materials</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400">
                    4
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Recover</p>
                    <p className="text-xs text-muted-foreground">Extract energy/resources</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
