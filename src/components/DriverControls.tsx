type DriverControlsProps = {
  battery: number
  rangeKm: number
  efficiency: number
  onBatteryChange: (value: number) => void
  onEfficiencyChange: (value: number) => void
}

export function DriverControls({
  battery,
  efficiency,
  onBatteryChange,
  onEfficiencyChange,
  rangeKm,
}: DriverControlsProps) {
  return (
    <section className="driver-inputs" aria-label="Battery and range inputs">
      <div className="input-card battery-card">
        <div className="input-heading">
          <span>Battery</span>
          <strong>{battery}%</strong>
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
          <span>Range</span>
          <strong>{rangeKm} km</strong>
        </div>
        <input
          aria-label="Vehicle efficiency in kilometers per percent"
          max="7.5"
          min="3"
          onChange={(event) => onEfficiencyChange(Number(event.target.value))}
          step="0.1"
          type="range"
          value={efficiency}
        />
      </div>
    </section>
  )
}
