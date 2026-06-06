import { useMemo, useState } from 'react'
import { BottomNav, type Screen } from './components/BottomNav'
import { distanceBetweenKm, lagosDriverLocation, scoreStation, stations } from './data/stations'
import { HomePage } from './pages/HomePage'
import { MapPage } from './pages/MapPage'
import './App.css'

const vehicleProfiles = {
  'BYD Atto 3': { connectors: ['CCS2', 'Type 2'], maxKw: 88 },
  'Tesla Model 3': { connectors: ['CCS2'], maxKw: 170 },
  'Hyundai Kona EV': { connectors: ['CCS2', 'Type 2'], maxKw: 77 },
  'Nissan Leaf': { connectors: ['CHAdeMO', 'Type 2'], maxKw: 50 },
}

type VehicleModel = keyof typeof vehicleProfiles
type Urgency = 'hurry' | 'flexible'

function App() {
  const [battery, setBattery] = useState(90)
  const [efficiency, setEfficiency] = useState(3.55)
  const [targetCharge, setTargetCharge] = useState(80)
  const [vehicleModel, setVehicleModel] = useState<VehicleModel>('BYD Atto 3')
  const [urgency, setUrgency] = useState<Urgency>('hurry')
  const [selectedId, setSelectedId] = useState(stations[0].id)
  const [screen, setScreen] = useState<Screen>('home')
  const [fastOnly, setFastOnly] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const rangeKm = Math.round(battery * efficiency)
  const vehicleProfile = vehicleProfiles[vehicleModel]
  const neededCharge = Math.max(0, targetCharge - battery)

  const rankedStations = useMemo(() => {
    return stations
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
        const speedFit = Math.min(station.speedKw, vehicleProfile.maxKw) / vehicleProfile.maxKw
        const reliabilityFit = station.reliability7d / 100
        const riskFit = 1 - station.outageRiskNext6h / 100
        const urgencyFit =
          urgency === 'hurry'
            ? Math.max(0, 1 - (stationWithLiveDistance.distanceKm + station.waitMin) / 35)
            : reliabilityFit
        const sessionFit = neededCharge > 0 ? Math.min(1, station.speedKw / Math.max(22, neededCharge * 2)) : 1

        return {
          ...stationWithLiveDistance,
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
  }, [fastOnly, neededCharge, rangeKm, urgency, vehicleProfile.connectors, vehicleProfile.maxKw])

  const fallbackStation = {
    ...stations[0],
    distanceKm: Number(distanceBetweenKm(lagosDriverLocation, stations[0].position).toFixed(1)),
    score: 0,
  }
  const selectedStation =
    rankedStations.find((station) => station.id === selectedId) ?? rankedStations[0] ?? fallbackStation
  const bestStation = rankedStations[0]
  const activeAlerts = stations.filter(
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

  return (
    <main className={`app-shell ${theme}-theme`}>
      <section className="phone-frame" aria-label="GridSense EV driver app">
        <div className="screen-content">
          {screen === 'home' && (
            <HomePage
              activeAlerts={activeAlerts}
              battery={battery}
              bestStation={bestStation}
              efficiency={efficiency}
              onBatteryChange={setBattery}
              onEfficiencyChange={setEfficiency}
              onOpenMap={() => changeScreen('map')}
              onToggleTheme={toggleTheme}
              rangeKm={rangeKm}
              theme={theme}
            />
          )}

          {screen === 'map' && (
            <MapPage
              fastOnly={fastOnly}
              onFastOnlyChange={() => setFastOnly((value) => !value)}
              onSelectStation={setSelectedId}
              selectedId={selectedStation.id}
              selectedStation={selectedStation}
              battery={battery}
              onBatteryChange={setBattery}
              onTargetChargeChange={setTargetCharge}
              onToggleTheme={toggleTheme}
              onUrgencyChange={setUrgency}
              onVehicleModelChange={setVehicleModel}
              stations={rankedStations}
              targetCharge={targetCharge}
              theme={theme}
              urgency={urgency}
              vehicleModel={vehicleModel}
              vehicleModels={Object.keys(vehicleProfiles) as VehicleModel[]}
            />
          )}

          {screen === 'activities' && (
            <div className="page empty-page">
              <h1>Activities</h1>
              <p>Recent charging sessions and reservations will appear here.</p>
            </div>
          )}

          {screen === 'profile' && (
            <div className="page empty-page">
              <h1>Profile</h1>
              <p>Driver pass, wallet, vehicle settings, and operator preferences.</p>
            </div>
          )}
        </div>

        <BottomNav onChange={changeScreen} screen={screen} />
      </section>
    </main>
  )
}

export default App
