import { useEffect, useMemo, useState } from 'react'
import { BottomNav, type Screen } from './components/BottomNav'
import {
  distanceBetweenKm,
  lagosDriverLocation,
  normalizeApiStations,
  scoreStation,
  stations,
} from './data/stations'
import { HomePage } from './pages/HomePage'
import { MapPage } from './pages/MapPage'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { ProfilePage } from './pages/ProfilePage'
import './App.css'

const vehicleProfiles = {
  'BYD Atto 3': { batteryKwh: 60.5, connectors: ['CCS2', 'Type 2'], maxKw: 88, usableRangeKm: 420 },
  'Tesla Model 3': { batteryKwh: 57.5, connectors: ['CCS2'], maxKw: 170, usableRangeKm: 438 },
  'Hyundai Kona EV': { batteryKwh: 64, connectors: ['CCS2', 'Type 2'], maxKw: 77, usableRangeKm: 450 },
  'Nissan Leaf': { batteryKwh: 40, connectors: ['CHAdeMO', 'Type 2'], maxKw: 50, usableRangeKm: 270 },
}

type VehicleModel = keyof typeof vehicleProfiles
type Urgency = 'hurry' | 'flexible'
const stationsApiUrl =
  import.meta.env.VITE_STATIONS_API_URL ??
  'https://j517v8hjtg.execute-api.us-east-1.amazonaws.com/stations'
const stationsPollIntervalMs = Number(import.meta.env.VITE_STATIONS_POLL_INTERVAL_MS ?? 5000)

function App() {
  const [apiStations, setApiStations] = useState(stations)
  const [battery, setBattery] = useState(90)
  const [targetCharge, setTargetCharge] = useState(90)
  const vehicleModel: VehicleModel = 'BYD Atto 3'
  const urgency: Urgency = 'hurry'
  const [selectedId, setSelectedId] = useState(stations[0].id)
  const [screen, setScreen] = useState<Screen>('home')
  const [fastOnly, setFastOnly] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const vehicleProfile = vehicleProfiles[vehicleModel]
  const rangeKm = Math.round((battery / 100) * vehicleProfile.usableRangeKm)
  const neededCharge = Math.max(0, targetCharge - battery)
  const neededEnergyKwh = (vehicleProfile.batteryKwh * neededCharge) / 100
  const stationSource = apiStations.length > 0 ? apiStations : stations

  useEffect(() => {
    let cancelled = false

    async function loadStations() {
      try {
        const response = await fetch(stationsApiUrl)

        if (!response.ok) {
          throw new Error(`Station API returned ${response.status}`)
        }

        const payload = await response.json()
        const normalizedStations = normalizeApiStations(payload)

        if (!cancelled && normalizedStations.length > 0) {
          setApiStations(normalizedStations)
        }
      } catch (error) {
        console.warn('Unable to load stations API, using local fallback data.', error)
      }
    }

    void loadStations()
    const intervalId = window.setInterval(() => {
      void loadStations()
    }, stationsPollIntervalMs)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  const rankedStations = useMemo(() => {
    return stationSource
      .filter((station) => station.area.toLowerCase().includes('lagos'))
      .filter((station) =>
        station.connectors.some((connector) => vehicleProfile.connectors.includes(connector)),
      )
      .filter((station) => !fastOnly || station.speedKw >= 90)
      .map((station) => {
        const stationWithLiveDistance = {
          ...station,
          distanceKm: Number(distanceBetweenKm(lagosDriverLocation, station.position).toFixed(1)),
        }
        const baseScore = scoreStation(stationWithLiveDistance, rangeKm)
        const effectiveSpeedKw = Math.max(1, Math.min(station.speedKw, vehicleProfile.maxKw))
        const speedFit = effectiveSpeedKw / vehicleProfile.maxKw
        const reliabilityFit = station.reliability7d / 100
        const riskFit = 1 - station.outageRiskNext6h / 100
        const urgencyFit =
          urgency === 'hurry'
            ? Math.max(0, 1 - (stationWithLiveDistance.distanceKm + station.waitMin) / 35)
            : reliabilityFit
        const chargeSessionMin =
          neededEnergyKwh > 0 ? Math.ceil((neededEnergyKwh / effectiveSpeedKw) * 60) : 0
        const totalTripDelayMin = station.waitMin + chargeSessionMin
        const sessionFit = neededCharge > 0 ? Math.max(0, 1 - totalTripDelayMin / 95) : 1

        return {
          ...stationWithLiveDistance,
          chargeSessionMin,
          score: Math.round(
            baseScore * 0.42 +
              speedFit * 14 +
              reliabilityFit * 16 +
              riskFit * 12 +
              urgencyFit * 10 +
              sessionFit * 6,
          ),
        }
      })
      .sort((a, b) => b.score - a.score)
  }, [
    fastOnly,
    neededCharge,
    neededEnergyKwh,
    rangeKm,
    stationSource,
    urgency,
    vehicleProfile.connectors,
    vehicleProfile.maxKw,
  ])

  const fallbackStation = {
    ...stationSource[0],
    distanceKm: Number(distanceBetweenKm(lagosDriverLocation, stationSource[0].position).toFixed(1)),
    score: 0,
  }
  const selectedStation =
    rankedStations.find((station) => station.id === selectedId) ?? rankedStations[0] ?? fallbackStation
  const bestStation = rankedStations[0]
  const activeAlerts = stationSource.filter(
    (station) =>
      station.area.toLowerCase().includes('lagos') &&
      (station.status === 'DEGRADED' || station.status === 'OFFLINE'),
  ).length

  const changeScreen = (nextScreen: Screen) => {
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => void
    }

    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(() => setScreen(nextScreen))
      return
    }

    setScreen(nextScreen)
  }

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const updateBattery = (value: number) => {
    setBattery(value)
    setTargetCharge((currentTarget) => Math.max(currentTarget, value))
  }

  return (
    <main className={`app-shell ${theme}-theme`}>
      <section className="phone-frame" aria-label="GridSense EV driver app">
        <div className="screen-content">
          {screen === 'home' && (
            <HomePage
              activeAlerts={activeAlerts}
              battery={battery}
              bestStation={bestStation}
              onBatteryChange={updateBattery}
              onTargetChargeChange={setTargetCharge}
              onOpenMap={() => changeScreen('map')}
              onToggleTheme={toggleTheme}
              rangeKm={rangeKm}
              targetCharge={targetCharge}
              theme={theme}
              vehicleBatteryKwh={vehicleProfile.batteryKwh}
              vehicleConnectors={vehicleProfile.connectors}
              vehicleMaxKw={vehicleProfile.maxKw}
              vehicleModel={vehicleModel}
            />
          )}

          {screen === 'map' && (
            <MapPage
              fastOnly={fastOnly}
              onFastOnlyChange={() => setFastOnly((value) => !value)}
              onSelectStation={setSelectedId}
              selectedId={selectedStation.id}
              selectedStation={selectedStation}
              onToggleTheme={toggleTheme}
              stations={rankedStations}
              theme={theme}
            />
          )}

          {screen === 'activities' && (
            <ActivitiesPage
              battery={battery}
              selectedStation={selectedStation}
              vehicleModel={vehicleModel}
            />
          )}

          {screen === 'profile' && (
            <ProfilePage
              rangeKm={rangeKm}
              theme={theme}
              vehicleBatteryKwh={vehicleProfile.batteryKwh}
              vehicleConnectors={vehicleProfile.connectors}
              vehicleMaxKw={vehicleProfile.maxKw}
              vehicleModel={vehicleModel}
            />
          )}
        </div>

        <BottomNav onChange={changeScreen} screen={screen} />
      </section>
    </main>
  )
}

export default App
