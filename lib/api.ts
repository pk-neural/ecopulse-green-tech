import type { WeatherData, ForecastDay } from "./types"

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
const OPEN_METEO_BASE = "https://api.open-meteo.com/v1"
const OPENWEATHER_API_KEY = "e0d8e992d7d59e2adfdd3f1a00e3792e"
const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5"

const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedData<T>(key: string): T | null {
  const cached = apiCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  return null
}

function setCachedData(key: string, data: any): void {
  apiCache.set(key, { data, timestamp: Date.now() })
}

function calculateIndianAQI(pm25: number): number {
  // Indian CPCB AQI breakpoints for PM2.5
  const breakpoints = [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 }, // Good
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 }, // Satisfactory
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 }, // Moderate
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 }, // Poor
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 }, // Very Poor
    { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 }, // Severe
  ]

  // Handle edge cases
  if (pm25 <= 0) return 0
  if (pm25 > 500) return 500

  // Find the appropriate breakpoint
  for (const bp of breakpoints) {
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      // Linear interpolation formula: I = ((IHi - ILo) / (CHi - CLo)) * (C - CLo) + ILo
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow
      return Math.round(aqi)
    }
  }

  return Math.round(pm25) // Fallback
}

export async function searchCities(
  query: string,
): Promise<Array<{ name: string; state: string; lat: number; lon: number }>> {
  if (!query || query.length < 2) return []

  const cacheKey = `search_${query.toLowerCase()}`
  const cached = getCachedData<Array<{ name: string; state: string; lat: number; lon: number }>>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&addressdetails=1&limit=5`,
      { headers: { "User-Agent": "EcoPulse/1.0" } },
    )
    const data = await response.json()

    const results = data
      .filter((item: any) => item.address?.city || item.address?.town || item.address?.village || item.address?.state)
      .map((item: any) => ({
        name: item.address?.city || item.address?.town || item.address?.village || item.name,
        state: item.address?.state || "",
        lat: Number.parseFloat(item.lat),
        lon: Number.parseFloat(item.lon),
      }))

    setCachedData(cacheKey, results)
    return results
  } catch (error) {
    console.error("City search failed:", error)
    return []
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; state: string } | null> {
  const cacheKey = `reverse_${lat.toFixed(2)}_${lon.toFixed(2)}`
  const cached = getCachedData<{ name: string; state: string }>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(`${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`, {
      headers: { "User-Agent": "EcoPulse/1.0" },
    })
    const data = await response.json()

    if (data.address?.country_code !== "in") {
      return null
    }

    const result = {
      name: data.address?.city || data.address?.town || data.address?.village || data.address?.county || "",
      state: data.address?.state || "",
    }

    setCachedData(cacheKey, result)
    return result
  } catch (error) {
    console.error("Reverse geocode failed:", error)
    return null
  }
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const cacheKey = `weather_${lat.toFixed(3)}_${lon.toFixed(3)}`
  const cached = getCachedData<WeatherData>(cacheKey)
  if (cached) return cached

  try {
    // Fetch weather and air pollution data in parallel
    const [weatherResponse, aqiResponse] = await Promise.all([
      fetch(`${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`),
      fetch(`${OPENWEATHER_BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`),
    ])

    if (weatherResponse.ok && aqiResponse.ok) {
      const weatherData = await weatherResponse.json()
      const aqiData = await aqiResponse.json()

      // Extract actual PM2.5 value from air pollution data
      const pm25 = aqiData.list?.[0]?.components?.pm2_5 || 0

      // Calculate Indian AQI from PM2.5 (CPCB standard)
      const aqi = calculateIndianAQI(pm25)

      // Estimate UV from cloud cover (simplified)
      const clouds = weatherData.clouds?.all || 0
      const uvIndex = Math.max(1, Math.round(10 - clouds / 10))

      const result: WeatherData = {
        temperature: Math.round(weatherData.main?.temp || 30),
        humidity: weatherData.main?.humidity || 60,
        windSpeed: Math.round((weatherData.wind?.speed || 0) * 3.6), // m/s to km/h
        uvIndex,
        aqi,
        condition: getWeatherConditionFromCode(weatherData.weather?.[0]?.id || 800),
      }

      setCachedData(cacheKey, result)
      return result
    }

    // Fallback to Open-Meteo if OpenWeather fails
    return await getWeatherDataFromOpenMeteo(lat, lon)
  } catch (error) {
    console.error("Weather fetch failed, using Open-Meteo fallback:", error)
    return await getWeatherDataFromOpenMeteo(lat, lon)
  }
}

async function getWeatherDataFromOpenMeteo(lat: number, lon: number): Promise<WeatherData> {
  try {
    const [weatherResponse, aqiResponse] = await Promise.all([
      fetch(
        `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,uv_index,weather_code&timezone=auto`,
      ),
      fetch(`${OPEN_METEO_BASE}/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`),
    ])

    const data = await weatherResponse.json()
    const aqiData = await aqiResponse.json()

    // Get PM2.5 and convert to Indian AQI
    const pm25 = aqiData.current?.pm2_5 || 0
    const aqi = calculateIndianAQI(pm25)

    return {
      temperature: data.current?.temperature_2m || 0,
      humidity: data.current?.relative_humidity_2m || 0,
      windSpeed: data.current?.wind_speed_10m || 0,
      uvIndex: data.current?.uv_index || 0,
      aqi,
      condition: getWeatherCondition(data.current?.weather_code || 0),
    }
  } catch (error) {
    console.error("Open-Meteo fetch failed:", error)
    return { temperature: 30, humidity: 60, windSpeed: 10, uvIndex: 5, aqi: 50, condition: "Clear" }
  }
}

function getWeatherConditionFromCode(code: number): string {
  if (code >= 200 && code < 300) return "Stormy"
  if (code >= 300 && code < 400) return "Rainy"
  if (code >= 500 && code < 600) return "Rainy"
  if (code >= 600 && code < 700) return "Snowy"
  if (code >= 700 && code < 800) return "Foggy"
  if (code === 800) return "Clear"
  if (code > 800) return "Partly Cloudy"
  return "Clear"
}

export async function getForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  const cacheKey = `forecast_${lat.toFixed(3)}_${lon.toFixed(3)}`
  const cached = getCachedData<ForecastDay[]>(cacheKey)
  if (cached) return cached

  try {
    const [weatherResponse, aqiResponse] = await Promise.all([
      fetch(
        `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&forecast_days=7`,
      ),
      fetch(`${OPEN_METEO_BASE}/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5&forecast_days=7`),
    ])

    const data = await weatherResponse.json()
    const aqiData = await aqiResponse.json()

    const dailyAqi: number[] = []
    if (aqiData.hourly?.pm2_5) {
      for (let i = 0; i < 7; i++) {
        const dayPm25Values = aqiData.hourly.pm2_5.slice(i * 24, (i + 1) * 24)
        const avgPm25 = dayPm25Values.reduce((a: number, b: number) => a + b, 0) / dayPm25Values.length
        dailyAqi.push(calculateIndianAQI(avgPm25))
      }
    }

    const results =
      data.daily?.time?.map((date: string, i: number) => ({
        date,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        rainProbability: data.daily.precipitation_probability_max[i] || 0,
        aqi: dailyAqi[i] || 50,
        condition: getWeatherCondition(data.daily.weather_code[i]),
      })) || []

    setCachedData(cacheKey, results)
    return results
  } catch (error) {
    console.error("Forecast fetch failed:", error)
    return []
  }
}

function getWeatherCondition(code: number): string {
  if (code === 0) return "Clear"
  if (code <= 3) return "Partly Cloudy"
  if (code <= 49) return "Foggy"
  if (code <= 69) return "Rainy"
  if (code <= 79) return "Snowy"
  if (code <= 99) return "Stormy"
  return "Clear"
}
