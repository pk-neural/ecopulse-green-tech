"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, TrendingUp, Thermometer, Wind, CloudRain, AlertTriangle, Droplets } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Header } from "@/components/header"
import { FloatingParticles } from "@/components/particles"
import { getUser } from "@/lib/storage"
import { getForecast } from "@/lib/api"
import type { User, ForecastDay } from "@/lib/types"

export default function TrendsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [forecast, setForecast] = useState<ForecastDay[]>([])

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)

    const fetchForecast = async () => {
      const data = await getForecast(currentUser.lat, currentUser.lon)
      setForecast(data)
      setLoading(false)
    }

    fetchForecast()
  }, [router])

  if (loading || !user || forecast.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  const tempData = forecast.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" }),
    max: day.tempMax,
    min: day.tempMin,
  }))

  const aqiData = forecast.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" }),
    aqi: day.aqi,
  }))

  const rainData = forecast.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" }),
    probability: day.rainProbability,
  }))

  const isDryWeek = forecast.every((day) => day.rainProbability < 20)
  const avgRainProbability = forecast.reduce((a, b) => a + b.rainProbability, 0) / forecast.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950">
      <FloatingParticles />
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">7-Day Trends</h1>
          </div>
          <p className="text-muted-foreground">
            Forecast-based environmental trends for {user.city}, {user.state}
          </p>
        </div>

        {/* Dry Week Alert */}
        {isDryWeek && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">Dry Week Expected</p>
              <p className="text-xs text-muted-foreground mt-1">
                Rain probability is below 20% for the entire week. Please conserve water and reduce outdoor water usage.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* Temperature Trend */}
          <div className="bg-background/40 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Thermometer className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Temperature Forecast</h2>
                <p className="text-sm text-muted-foreground">Max and min temperatures for the next 7 days</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tempData}>
                  <defs>
                    <linearGradient id="tempMaxGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="tempMinGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} unit="°C" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="max"
                    stroke="#f97316"
                    fill="url(#tempMaxGradient)"
                    strokeWidth={2}
                    name="Max Temp"
                  />
                  <Area
                    type="monotone"
                    dataKey="min"
                    stroke="#3b82f6"
                    fill="url(#tempMinGradient)"
                    strokeWidth={2}
                    name="Min Temp"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* AQI Trend */}
            <div className="bg-background/40 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Wind className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">AQI Trend</h2>
                  <p className="text-sm text-muted-foreground">Air quality index forecast</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={aqiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="aqi" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rain Probability */}
            <div className="bg-background/40 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <CloudRain className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Rain Probability</h2>
                  <p className="text-sm text-muted-foreground">
                    Avg: {avgRainProbability.toFixed(0)}% chance this week
                  </p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rainData}>
                    <defs>
                      <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} unit="%" />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="probability"
                      stroke="#3b82f6"
                      fill="url(#rainGradient)"
                      strokeWidth={2}
                      name="Rain %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Water Conservation Tips */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Water Conservation Tips</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-sm font-medium text-foreground">Shorter Showers</p>
                <p className="text-xs text-muted-foreground mt-1">Reduce shower time by 2 minutes to save 20L daily</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-sm font-medium text-foreground">Fix Leaks</p>
                <p className="text-xs text-muted-foreground mt-1">A dripping tap wastes 15L per day</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-sm font-medium text-foreground">Rainwater Harvesting</p>
                <p className="text-xs text-muted-foreground mt-1">Collect rainwater for gardening needs</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-sm font-medium text-foreground">Efficient Appliances</p>
                <p className="text-xs text-muted-foreground mt-1">Use water-efficient washing machines</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
