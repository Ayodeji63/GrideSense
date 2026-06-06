import { BiBell, BiBoltCircle, BiCreditCard, BiMap, BiShield, BiUser } from 'react-icons/bi'

type ProfilePageProps = {
  rangeKm: number
  theme: 'dark' | 'light'
  vehicleBatteryKwh: number
  vehicleConnectors: string[]
  vehicleMaxKw: number
  vehicleModel: string
}

export function ProfilePage({
  rangeKm,
  theme,
  vehicleBatteryKwh,
  vehicleConnectors,
  vehicleMaxKw,
  vehicleModel,
}: ProfilePageProps) {
  return (
    <div className="page profile-page">
      <header className="profile-hero">
        <div className="profile-avatar">
          <BiUser aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">GRIDSENSE PASS</p>
          <h1>John Driver</h1>
          <span>Lagos · {theme === 'dark' ? 'Dark' : 'Light'} mode</span>
        </div>
      </header>

      <section className="profile-card vehicle-profile-card">
        <div>
          <p className="eyebrow">CONNECTED EV</p>
          <h2>{vehicleModel}</h2>
          <span>{rangeKm} km current range</span>
        </div>
        <BiBoltCircle aria-hidden="true" />
      </section>

      <section className="profile-stat-grid" aria-label="Vehicle profile">
        <article>
          <span>Battery</span>
          <strong>{vehicleBatteryKwh} kWh</strong>
        </article>
        <article>
          <span>Max speed</span>
          <strong>{vehicleMaxKw} kW</strong>
        </article>
        <article>
          <span>Connector</span>
          <strong>{vehicleConnectors.join(' / ')}</strong>
        </article>
        <article>
          <span>Plan</span>
          <strong>Fleet-ready</strong>
        </article>
      </section>

      <section className="profile-list" aria-label="Profile settings">
        <button type="button">
          <span>
            <BiCreditCard aria-hidden="true" />
            Wallet balance
          </span>
          <strong>₦18,400</strong>
        </button>
        <button type="button">
          <span>
            <BiBell aria-hidden="true" />
            Grid alerts
          </span>
          <strong>Enabled</strong>
        </button>
        <button type="button">
          <span>
            <BiMap aria-hidden="true" />
            Preferred area
          </span>
          <strong>Lagos</strong>
        </button>
        <button type="button">
          <span>
            <BiShield aria-hidden="true" />
            Driver verification
          </span>
          <strong>Active</strong>
        </button>
      </section>
    </div>
  )
}
