import { BiBoltCircle, BiChevronRight, BiCreditCard, BiMap, BiTimeFive } from 'react-icons/bi'
import type { CSSProperties } from 'react'
import type { ScoredStation } from '../data/stations'

type ActivitiesPageProps = {
  battery: number
  selectedStation: ScoredStation
  vehicleModel: string
}

export function ActivitiesPage({ battery, selectedStation, vehicleModel }: ActivitiesPageProps) {
  const progress = Math.min(Math.max(battery, 0), 100)
  const units = Math.max(4, Math.round((progress / 100) * 16))
  const totalCost = units * 210

  return (
    <div className="page activity-page">
      <header className="section-header">
        <div>
          <p className="eyebrow">ACTIVE SESSION</p>
          <h1>Charging now</h1>
        </div>
        <span className="session-live">Live</span>
      </header>

      <section className="charge-orbit" style={{ '--progress': `${progress}%` } as CSSProperties}>
        <span className="orbit-dot dot-one"></span>
        <span className="orbit-dot dot-two"></span>
        <span className="orbit-dot dot-three"></span>
        <span className="orbit-dot dot-four"></span>
        <div>
          <strong>{progress}%</strong>
          <span>charging</span>
          <small>35C temp</small>
        </div>
      </section>

      <h2 className="activity-vehicle">{vehicleModel}</h2>

      <section className="active-station-card">
        <div className="station-thumb">
          <img src={selectedStation.image} alt="" />
        </div>
        <div>
          <strong>{selectedStation.name}</strong>
          <span>{selectedStation.connectors[0]} | Type 2</span>
          <small>
            {selectedStation.speedKw}kW · ₦{selectedStation.price}/unit
          </small>
        </div>
        <em>Fast</em>
      </section>

      <section className="activity-location">
        <strong>{selectedStation.name}</strong>
        <span>
          <BiMap aria-hidden="true" />
          {selectedStation.area}
        </span>
      </section>

      <section className="session-metrics" aria-label="Charging session metrics">
        <article>
          <BiTimeFive aria-hidden="true" />
          <span>Duration</span>
          <strong>1h 10min</strong>
        </article>
        <article>
          <BiTimeFive aria-hidden="true" />
          <span>Time remaining</span>
          <strong>2h 20 min</strong>
        </article>
        <article>
          <BiBoltCircle aria-hidden="true" />
          <span>Units</span>
          <strong>{units} units</strong>
        </article>
        <article>
          <BiCreditCard aria-hidden="true" />
          <span>Total cost</span>
          <strong>₦{totalCost.toLocaleString()}</strong>
        </article>
      </section>

      <button className="payment-row" type="button">
        <span>
          <BiCreditCard aria-hidden="true" />
          Pay with wallet
        </span>
        <BiChevronRight aria-hidden="true" />
      </button>
    </div>
  )
}
