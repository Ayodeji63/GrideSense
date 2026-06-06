import {
  BiBell,
  BiBoltCircle,
  BiCurrentLocation,
  BiLeaf,
  BiMapAlt,
  BiMoon,
  BiSolidThermometer,
  BiSun,
} from 'react-icons/bi'
import type { CSSProperties } from 'react'
import { DriverControls } from '../components/DriverControls'
import type { ScoredStation } from '../data/stations'

type HomePageProps = {
  battery: number
  rangeKm: number
  efficiency: number
  bestStation: ScoredStation
  activeAlerts: number
  onBatteryChange: (value: number) => void
  onEfficiencyChange: (value: number) => void
  onOpenMap: () => void
  onToggleTheme: () => void
  theme: 'dark' | 'light'
}

export function HomePage({
  activeAlerts,
  battery,
  bestStation,
  efficiency,
  onBatteryChange,
  onEfficiencyChange,
  onOpenMap,
  onToggleTheme,
  rangeKm,
  theme,
}: HomePageProps) {
  return (
    <div className="page home-page">
      <header className="app-header">
        <div>
          <h1>Welcome, John</h1>
          <p>Eco-friendly journeys start with you.</p>
        </div>
        <div className="header-actions">
          <button className="round-button" type="button" aria-label="Notifications">
            <BiBell aria-hidden="true" />
            {activeAlerts > 0 && <span>{activeAlerts}</span>}
          </button>
          <button
            className="round-button"
            onClick={onToggleTheme}
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <BiSun aria-hidden="true" /> : <BiMoon aria-hidden="true" />}
          </button>
        </div>
      </header>

      <section className="charge-banner">
        <div>
          <strong>
            <BiBoltCircle aria-hidden="true" />
            {battery}% completed
          </strong>
          <span>{Math.max(4, Math.round((100 - battery) * 0.27))} min. remaining</span>
        </div>
        <button onClick={onOpenMap} type="button">
          View
        </button>
      </section>

      <section className="vehicle-hero">
        <img src="/64370.jpg" alt="" />
        <div className="vehicle-glass">
          <span className="connected">
            <BiLeaf aria-hidden="true" />
            Connected
          </span>
          <strong>GridSense EV</strong>
          <small>
            <BiCurrentLocation aria-hidden="true" />
            {bestStation.area}
          </small>
        </div>
      </section>

      <section className="vehicle-grid" aria-label="Vehicle status">
        <div className="battery-widget">
          <div className="widget-title">
            <span>
              <BiBoltCircle aria-hidden="true" />
            </span>
            Battery
          </div>
          <div className="battery-meter" style={{ '--battery': `${battery}%` } as CSSProperties}>
            <i></i>
          </div>
          <strong>{battery}%</strong>
          <small>{rangeKm} km left</small>
        </div>

        <div className="small-widget">
          <div className="widget-title">
            <span>
              <BiSolidThermometer aria-hidden="true" />
            </span>
            Battery Temp.
          </div>
          <strong>16°C</strong>
          <small>Alert at 94°</small>
        </div>

        <div className="small-widget">
          <div className="widget-title">
            <span>
              <BiLeaf aria-hidden="true" />
            </span>
            Climate
          </div>
          <strong>16°C</strong>
          <small>Day 16° · Night 11°C</small>
        </div>
      </section>

      <DriverControls
        battery={battery}
        efficiency={efficiency}
        onBatteryChange={onBatteryChange}
        onEfficiencyChange={onEfficiencyChange}
        rangeKm={rangeKm}
      />

      <button className="home-map-preview" onClick={onOpenMap} type="button">
        <span>
          <BiMapAlt aria-hidden="true" />
          Open live station map
        </span>
      </button>
    </div>
  )
}
