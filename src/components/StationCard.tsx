import { BiBoltCircle, BiMap, BiTimeFive } from 'react-icons/bi'
import type { ScoredStation } from '../data/stations'

type StationCardProps = {
  station: ScoredStation
  active?: boolean
  onSelect: (stationId: string) => void
}

const stationTag = {
  ONLINE: 'Grid stable',
  DEGRADED: 'Voltage dip',
  OFFLINE: 'Offline',
  UNKNOWN: 'Telemetry stale',
}

export function StationCard({ active = false, onSelect, station }: StationCardProps) {
  return (
    <button
      className={`station-card ${active ? 'active' : ''}`}
      onClick={() => onSelect(station.id)}
      type="button"
    >
      <img
        alt=""
        onError={(event) => {
          event.currentTarget.src = '/station-charger.svg'
        }}
        src={station.image}
      />
      <span className={`open-pill ${station.status.toLowerCase()}`}>
        {stationTag[station.status]}
      </span>
      <div className="station-card-copy">
        <strong>{station.name}</strong>
        <small>{station.area}</small>
        <div className="station-tags" aria-label="Station tags">
          <em>{station.available}/{station.total} plugs idle</em>
          <em>{station.queueCount} queued</em>
          <em>{station.connectors.join(' / ')}</em>
        </div>
        <span>
          <BiTimeFive aria-hidden="true" />
          {station.waitMin} min wait
          <BiBoltCircle aria-hidden="true" />
          {station.speedKw} kW
        </span>
        <span>
          <BiMap aria-hidden="true" />
          {station.distanceKm} km away
        </span>
      </div>
    </button>
  )
}
