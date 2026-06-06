import { useMemo, useRef } from 'react'
import { BiCurrentLocation, BiMoon, BiSearch, BiSun } from 'react-icons/bi'
import StationMap from '../components/StationMap'
import { StationCard } from '../components/StationCard'
import { statusCopy, type ScoredStation } from '../data/stations'

type MapPageProps = {
  stations: ScoredStation[]
  selectedStation: ScoredStation
  selectedId: string
  battery: number
  fastOnly: boolean
  onBatteryChange: (value: number) => void
  onFastOnlyChange: () => void
  onSelectStation: (stationId: string) => void
  onTargetChargeChange: (value: number) => void
  onToggleTheme: () => void
  onUrgencyChange: (value: 'hurry' | 'flexible') => void
  onVehicleModelChange: (value: never) => void
  targetCharge: number
  theme: 'dark' | 'light'
  urgency: 'hurry' | 'flexible'
  vehicleModel: string
  vehicleModels: string[]
}

export function MapPage({
  battery,
  fastOnly,
  onBatteryChange,
  onFastOnlyChange,
  onSelectStation,
  onTargetChargeChange,
  onToggleTheme,
  onUrgencyChange,
  onVehicleModelChange,
  selectedId,
  selectedStation,
  stations,
  targetCharge,
  theme,
  urgency,
  vehicleModel,
  vehicleModels,
}: MapPageProps) {
  const carouselRef = useRef<HTMLElement>(null)
  const mapStations = useMemo(() => {
    return stations.map((station) => ({
      address: station.area,
      chargeSpeedKw: station.speedKw,
      chargersAvailable: station.available,
      chargersTotal: station.total,
      estimatedWait: station.waitMin,
      frequency: station.frequency,
      gridStatus: station.status,
      lastUpdated: '2026-06-06T09:14:32Z',
      lat: station.position[0],
      lng: station.position[1],
      name: station.name,
      stationId: station.id,
      voltage: station.voltage,
    }))
  }, [stations])
  const nearestStation = stations[0]
  const topStations = stations.slice(0, 3)

  const scrollStations = (direction: 'back' | 'forward') => {
    carouselRef.current?.scrollBy({
      behavior: 'smooth',
      left: direction === 'forward' ? 252 : -252,
    })
  }

  const selectNearestSuitable = () => {
    if (!nearestStation) {
      return
    }

    onSelectStation(nearestStation.id)
    carouselRef.current?.scrollTo({ behavior: 'smooth', left: 0 })
  }

  return (
    <div className="page map-page">
      <div className="map-top-row">
        <label className="map-search">
          <BiSearch aria-hidden="true" />
          <input placeholder="Search location" type="search" />
        </label>
        <button
          className="round-button map-theme-button"
          onClick={onToggleTheme}
          type="button"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <BiSun aria-hidden="true" /> : <BiMoon aria-hidden="true" />}
        </button>
      </div>

      <section className="dark-map real-map" aria-label="Live charging station map">
        <StationMap
          onStationSelect={(station) => onSelectStation(station.stationId)}
          stations={mapStations}
        />
      </section>

      <section className="driver-fit-panel" aria-label="Driver charging inputs">
        <label>
          <span>Battery</span>
          <strong>{battery}%</strong>
          <input
            max="100"
            min="5"
            onChange={(event) => onBatteryChange(Number(event.target.value))}
            type="range"
            value={battery}
          />
        </label>
        <label>
          <span>Target</span>
          <strong>{targetCharge}%</strong>
          <input
            max="100"
            min={battery}
            onChange={(event) => onTargetChargeChange(Number(event.target.value))}
            type="range"
            value={targetCharge}
          />
        </label>
        <label>
          <span>Vehicle</span>
          <select
            onChange={(event) => onVehicleModelChange(event.target.value as never)}
            value={vehicleModel}
          >
            {vehicleModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </label>
        <div className="urgency-toggle">
          <button
            className={urgency === 'hurry' ? 'active' : ''}
            onClick={() => onUrgencyChange('hurry')}
            type="button"
          >
            In a hurry
          </button>
          <button
            className={urgency === 'flexible' ? 'active' : ''}
            onClick={() => onUrgencyChange('flexible')}
            type="button"
          >
            Flexible
          </button>
        </div>
      </section>

      <div className="map-filter-row">
        <button
          className="locate-button"
          onClick={selectNearestSuitable}
          type="button"
          aria-label="Select nearest suitable station from my driver inputs"
        >
          <BiCurrentLocation aria-hidden="true" />
        </button>
        <button className="nearest-button" onClick={selectNearestSuitable} type="button">
          Nearest suitable
        </button>
        <button className={!fastOnly ? 'chip active' : 'chip'} onClick={onFastOnlyChange} type="button">
          All
        </button>
        <button className={fastOnly ? 'chip active' : 'chip'} onClick={onFastOnlyChange} type="button">
          DC fast
        </button>
        <button className="chip" type="button" aria-label="Available plugs shown in station cards">
          Live plugs
        </button>
      </div>

      <div className="station-carousel-shell">
        <button className="carousel-control" onClick={() => scrollStations('back')} type="button" aria-label="Previous station">
          &lt;
        </button>
        <section className="station-carousel" aria-label="Top 3 suitable charging stations" ref={carouselRef}>
          {topStations.map((station) => (
            <StationCard
              active={selectedId === station.id}
              key={station.id}
              onSelect={onSelectStation}
              station={station}
            />
          ))}
        </section>
        <button className="carousel-control" onClick={() => scrollStations('forward')} type="button" aria-label="Next station">
          &gt;
        </button>
      </div>

      <section className="map-detail-sheet" aria-live="polite">
        <div>
          <p className="eyebrow">{selectedStation.id}</p>
          <h2>{selectedStation.name}</h2>
          <span>{selectedStation.area}</span>
        </div>
        <div className={`suitability ${selectedStation.status.toLowerCase()}`}>
          <strong>{selectedStation.score}</strong>
          <span>fit</span>
        </div>
        <p>
          Triangulated from Lagos driver point · {selectedStation.distanceKm} km away ·{' '}
          {statusCopy[selectedStation.status]} · {selectedStation.available}/{selectedStation.total} plugs
        </p>
      </section>
    </div>
  )
}
