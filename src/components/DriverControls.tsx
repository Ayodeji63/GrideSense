type DriverControlsProps = {
  battery: number
  rangeKm: number
  onBatteryChange: (value: number) => void
  onTargetChargeChange: (value: number) => void
  targetCharge: number
  vehicleBatteryKwh: number
  vehicleConnectors: string[]
  vehicleMaxKw: number
  vehicleModel: string
}

export function DriverControls({
  battery,
  onBatteryChange,
  onTargetChargeChange,
  rangeKm,
  targetCharge,
  vehicleBatteryKwh,
  vehicleConnectors,
  vehicleMaxKw,
  vehicleModel,
}: DriverControlsProps) {
  const quickBatteryValues = [30, 50, 70, 90]
  const neededEnergyKwh = Math.max(0, ((targetCharge - battery) / 100) * vehicleBatteryKwh)

  return (
    <section className="driver-inputs" aria-label="Battery and range inputs">
      <div className="input-card battery-card">
        <div className="input-heading">
          <span>Battery</span>
          <strong>{battery}%</strong>
        </div>
        <div className="quick-values" aria-label="Demo battery presets">
          {quickBatteryValues.map((value) => (
            <button
              className={battery === value ? 'active' : ''}
              key={value}
              onClick={() => onBatteryChange(value)}
              type="button"
            >
              {value}%
            </button>
          ))}
        </div>
        <input
          aria-label="Battery percentage"
          max="100"
          min="5"
          onChange={(event) => onBatteryChange(Number(event.target.value))}
          type="range"
          value={battery}
        />
      </div>
      <div className="input-card">
        <div className="input-heading">
          <span>Target</span>
          <strong>{targetCharge}%</strong>
        </div>
        <input
          aria-label="Target charge percentage"
          max="100"
          min={battery}
          onChange={(event) => onTargetChargeChange(Number(event.target.value))}
          type="range"
          value={targetCharge}
        />
        <div className="vehicle-profile-strip">
          <strong>{vehicleModel}</strong>
          <span>{vehicleBatteryKwh} kWh</span>
          <span>{vehicleMaxKw} kW max</span>
          <span>{vehicleConnectors.join(' / ')}</span>
        </div>
        <p className="driver-math">
          {rangeKm} km reachable · {neededEnergyKwh.toFixed(1)} kWh needed
        </p>
      </div>
    </section>
  )
}
