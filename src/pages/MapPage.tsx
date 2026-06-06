import { useMemo, useRef, useState } from 'react'
import { BiCurrentLocation, BiMoon, BiSearch, BiSun } from 'react-icons/bi'
import StationMap from '../components/StationMap'
import { StationCard } from '../components/StationCard'
import { statusCopy, type ScoredStation } from '../data/stations'

type MapPageProps = {
  stations: ScoredStation[]
  selectedStation: ScoredStation
  selectedId: string
  fastOnly: boolean
  onFastOnlyChange: () => void
  onSelectStation: (stationId: string) => void
  onToggleTheme: () => void
  theme: 'dark' | 'light'
}

export function MapPage({
  fastOnly,
  onFastOnlyChange,
  onSelectStation,
  onToggleTheme,
  selectedId,
  selectedStation,
  stations,
  theme,
}: MapPageProps) {
  const carouselRef = useRef<HTMLElement>(null)
  const [routeRequest, setRouteRequest] = useState<{ requestId: number; stationId: string } | null>(null)
  const mapStations = useMemo(() => {
    return stations.map((station) => ({
      address: station.area,
      chargeSpeedKw: station.speedKw,
      chargersAvailable: station.available,
      chargersTotal: station.total,
      estimatedWait: station.waitMin,
      frequency: station.frequency,
      gridStatus: station.status,
      lastUpdated: station.lastUpdated,
      lat: station.position[0],
      lng: station.position[1],
      name: station.name,
      stationId: station.id,
      voltage: station.voltage,
      activeSessions: station.activeSessions,
      queueCount: station.queueCount,
      connectorTypes: station.connectors,
    }))
  }, [stations])
  const nearestStation = useMemo(() => {
    return [...stations]
      .filter((station) => station.status !== 'OFFLINE' && station.status !== 'UNKNOWN')
      .sort((firstStation, secondStation) => {
        const distanceDelta = firstStation.distanceKm - secondStation.distanceKm

        if (Math.abs(distanceDelta) > 0.2) {
          return distanceDelta
        }

        const waitDelta = firstStation.waitMin - secondStation.waitMin

        if (waitDelta !== 0) {
          return waitDelta
        }

        const availabilityDelta = secondStation.available - firstStation.available

        if (availabilityDelta !== 0) {
          return availabilityDelta
        }

        return secondStation.score - firstStation.score
      })[0]
  }, [stations])
  const topStations = useMemo(() => {
    const rankedTop = stations.slice(0, 3)

    if (!nearestStation || rankedTop.some((station) => station.id === nearestStation.id)) {
      return rankedTop
    }

    return [nearestStation, ...rankedTop.slice(0, 2)]
  }, [nearestStation, stations])

  const selectNearestSuitable = () => {
    if (!nearestStation) {
      return
    }

    onSelectStation(nearestStation.id)
    setRouteRequest({ requestId: Date.now(), stationId: nearestStation.id })
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
          routeRequest={routeRequest}
          stations={mapStations}
        />
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
          {selectedStation.queueCount > 0 ? ` · ${selectedStation.queueCount} queued` : ''}
        </p>
      </section>
    </div>
  )
}
