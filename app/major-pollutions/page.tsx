"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  Wind,
  Droplets,
  Trash2,
  ChevronDown,
  AlertCircle,
  Shield,
  Leaf,
  Heart,
  Factory,
  Car,
  Flame,
  Fish,
  Bug,
  TreeDeciduous,
  Recycle,
  Lightbulb,
  Bike,
  Home,
  Waves,
  Sprout,
} from "lucide-react"
import { Header } from "@/components/header"
import { FloatingParticles } from "@/components/particles"
import { TestModeIndicator } from "@/components/test-mode-indicator"
import { getUser } from "@/lib/storage"
import type { User } from "@/lib/types"

interface PollutionType {
  id: string
  title: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  effects: { icon: React.ElementType; text: string }[]
  prevention: { icon: React.ElementType; text: string }[]
}

const pollutionData: PollutionType[] = [
  {
    id: "air",
    title: "Air Pollution",
    icon: Wind,
    color: "text-sky-400",
    bgColor: "from-sky-500/20 to-blue-500/20",
    borderColor: "border-sky-500/30",
    effects: [
      { icon: Heart, text: "Causes respiratory diseases like asthma and bronchitis" },
      { icon: Wind, text: "Reduces lung capacity and oxygen absorption" },
      { icon: Leaf, text: "Harms plant photosynthesis and crop yields" },
      { icon: Droplets, text: "Acid rain damages soil and water bodies" },
      { icon: Factory, text: "Contributes to global climate warming" },
      { icon: AlertCircle, text: "Depletes protective ozone layer" },
      { icon: Heart, text: "Reduces average life expectancy in polluted areas" },
    ],
    prevention: [
      { icon: Bike, text: "Use public transport, walk, or cycle" },
      { icon: Car, text: "Reduce vehicle idling time" },
      { icon: Lightbulb, text: "Shift to renewable energy sources" },
      { icon: TreeDeciduous, text: "Plant native trees in your area" },
      { icon: Flame, text: "Avoid burning waste and crop residue" },
      { icon: Car, text: "Maintain vehicles with regular servicing" },
      { icon: Factory, text: "Promote and use clean fuel alternatives" },
    ],
  },
  {
    id: "water",
    title: "Water Pollution",
    icon: Droplets,
    color: "text-blue-400",
    bgColor: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    effects: [
      { icon: Fish, text: "Destroys aquatic ecosystems and marine life" },
      { icon: Heart, text: "Causes waterborne diseases like cholera and typhoid" },
      { icon: Bug, text: "Disrupts food chains and biodiversity" },
      { icon: Sprout, text: "Contaminates soil through irrigation" },
      { icon: Waves, text: "Leads to algal blooms and dead zones" },
      { icon: AlertCircle, text: "Makes drinking water sources unsafe" },
      { icon: Heart, text: "Bioaccumulation of toxins in humans" },
    ],
    prevention: [
      { icon: Recycle, text: "Properly dispose of chemicals and medicines" },
      { icon: Home, text: "Use eco-friendly household cleaners" },
      { icon: Factory, text: "Support industrial water treatment" },
      { icon: Droplets, text: "Reduce single-use plastics" },
      { icon: Sprout, text: "Use organic fertilizers in farming" },
      { icon: Waves, text: "Participate in river and beach cleanups" },
      { icon: Home, text: "Install water-efficient fixtures" },
    ],
  },
  {
    id: "land",
    title: "Land / Waste Pollution",
    icon: Trash2,
    color: "text-amber-400",
    bgColor: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
    effects: [
      { icon: Bug, text: "Contaminates soil and groundwater" },
      { icon: Sprout, text: "Reduces soil fertility for agriculture" },
      { icon: Heart, text: "Causes health issues from toxic exposure" },
      { icon: TreeDeciduous, text: "Destroys natural habitats and wildlife" },
      { icon: Wind, text: "Releases methane contributing to climate change" },
      { icon: AlertCircle, text: "Creates breeding grounds for disease vectors" },
      { icon: Waves, text: "Plastic waste enters ocean food chains" },
    ],
    prevention: [
      { icon: Recycle, text: "Practice the 3Rs: Reduce, Reuse, Recycle" },
      { icon: Trash2, text: "Segregate wet and dry waste at source" },
      { icon: Sprout, text: "Compost organic waste at home" },
      { icon: Home, text: "Avoid single-use plastics and packaging" },
      { icon: Factory, text: "Support proper e-waste disposal programs" },
      { icon: Lightbulb, text: "Choose products with minimal packaging" },
      { icon: TreeDeciduous, text: "Participate in community cleanup drives" },
    ],
  },
]

export default function MajorPollutionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950">
      <FloatingParticles />
      <Header />
      <TestModeIndicator />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Major Pollutions</h1>
          <p className="text-muted-foreground">
            Understand the biggest threats to our environment and learn how to prevent them.
          </p>
        </div>

        <div className="space-y-6">
          {pollutionData.map((pollution) => (
            <div
              key={pollution.id}
              className={`bg-gradient-to-br ${pollution.bgColor} border ${pollution.borderColor} rounded-xl overflow-hidden transition-all duration-300`}
            >
              {/* Header - Clickable */}
              <button
                onClick={() => toggleExpand(pollution.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl bg-background/30 backdrop-blur-sm`}>
                    <pollution.icon className={`h-8 w-8 ${pollution.color}`} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-foreground">{pollution.title}</h2>
                    <p className="text-sm text-muted-foreground">Click to learn about effects and prevention</p>
                  </div>
                </div>
                <div
                  className={`p-2 rounded-lg bg-background/20 transition-transform duration-300 ${expandedId === pollution.id ? "rotate-180" : ""}`}
                >
                  <ChevronDown className={`h-5 w-5 ${pollution.color}`} />
                </div>
              </button>

              {/* Expanded Content */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  expandedId === pollution.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 pt-0 grid md:grid-cols-2 gap-6">
                    {/* Effects Section */}
                    <div className="bg-background/30 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <h3 className="font-semibold text-foreground">Effects on Living Beings & Earth</h3>
                      </div>
                      <ul className="space-y-3">
                        {pollution.effects.map((effect, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-red-500/10 mt-0.5">
                              <effect.icon className="h-4 w-4 text-red-400" />
                            </div>
                            <span className="text-sm text-muted-foreground leading-relaxed">{effect.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prevention Section */}
                    <div className="bg-background/30 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="h-5 w-5 text-emerald-400" />
                        <h3 className="font-semibold text-foreground">How We Can Prevent This</h3>
                      </div>
                      <ul className="space-y-3">
                        {pollution.prevention.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 mt-0.5">
                              <item.icon className="h-4 w-4 text-emerald-400" />
                            </div>
                            <span className="text-sm text-muted-foreground leading-relaxed">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Educational Footer */}
        <div className="mt-8 bg-background/40 backdrop-blur-xl border border-white/20 rounded-xl p-6 text-center">
          <Leaf className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Every Action Counts</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Understanding pollution is the first step towards prevention. Small changes in our daily habits can create a
            significant positive impact on our environment. Start with one action today and build sustainable habits for
            a cleaner tomorrow.
          </p>
        </div>
      </main>
    </div>
  )
}
