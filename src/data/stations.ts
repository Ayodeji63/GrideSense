export type StationStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN'

export type Station = {
  id: string
  name: string
  area: string
  distanceKm: number
  waitMin: number
  speedKw: number
  price: number
  status: StationStatus
  available: number
  total: number
  voltage: number
  frequency: number
  demand: number
  coords: { x: number; y: number }
  position: [number, number]
  amenities: string[]
  connectors: string[]
  reliability7d: number
  outageRiskNext6h: number
  image: string
}

export type ScoredStation = Station & { score: number }

export const lagosDriverLocation: [number, number] = [6.5244, 3.3792]

export const stations: Station[] = [
  {
    id: 'NGR-LKI-001',
    name: 'Lekki Phase 1 Hub',
    area: 'Admiralty Way, Lagos',
    distanceKm: 3.6,
    waitMin: 4,
    speedKw: 120,
    price: 248,
    status: 'ONLINE',
    available: 4,
    total: 6,
    voltage: 219.8,
    frequency: 50.7,
    demand: 82,
    coords: { x: 62, y: 38 },
    position: [6.4474, 3.4723],
    amenities: ['Cafe', 'Canopy', 'Restroom'],
    connectors: ['CCS2', 'Type 2'],
    reliability7d: 99,
    outageRiskNext6h: 8,
    image: '/station-charger.svg',
  },
  {
    id: 'NGR-VI-014',
    name: 'VI ChargePark',
    area: 'Akin Adesola, Lagos',
    distanceKm: 6.8,
    waitMin: 12,
    speedKw: 90,
    price: 265,
    status: 'DEGRADED',
    available: 2,
    total: 5,
    voltage: 187.4,
    frequency: 49.8,
    demand: 91,
    coords: { x: 42, y: 56 },
    position: [6.4281, 3.4219],
    amenities: ['Security', 'Lounge'],
    connectors: ['CCS2'],
    reliability7d: 82,
    outageRiskNext6h: 44,
    image: '/station-charger.svg',
  },
  {
    id: 'NGR-YBA-007',
    name: 'Yaba Fleet Depot',
    area: 'Herbert Macaulay, Lagos',
    distanceKm: 11.4,
    waitMin: 8,
    speedKw: 60,
    price: 218,
    status: 'ONLINE',
    available: 3,
    total: 4,
    voltage: 211.6,
    frequency: 50.1,
    demand: 74,
    coords: { x: 33, y: 27 },
    position: [6.5158, 3.3843],
    amenities: ['Fleet bay', 'Restroom'],
    connectors: ['Type 2'],
    reliability7d: 96,
    outageRiskNext6h: 12,
    image: '/station-charger.svg',
  },
  {
    id: 'NGR-ABJ-022',
    name: 'Wuse Smart Plaza',
    area: 'Zone 4, Abuja',
    distanceKm: 33.2,
    waitMin: 2,
    speedKw: 150,
    price: 240,
    status: 'UNKNOWN',
    available: 0,
    total: 4,
    voltage: 0,
    frequency: 0,
    demand: 63,
    coords: { x: 77, y: 72 },
    position: [9.0643, 7.4898],
    amenities: ['Mall', 'Security'],
    connectors: ['CCS2', 'Type 2'],
    reliability7d: 88,
    outageRiskNext6h: 28,
    image: '/station-charger.svg',
  },
  {
    id: 'NGR-IKJ-018',
    name: 'Ikeja GridSense Point',
    area: 'Allen Avenue, Lagos',
    distanceKm: 18.7,
    waitMin: 24,
    speedKw: 75,
    price: 230,
    status: 'OFFLINE',
    available: 0,
    total: 3,
    voltage: 4.2,
    frequency: 0,
    demand: 69,
    coords: { x: 18, y: 68 },
    position: [6.6018, 3.3515],
    amenities: ['Service bay'],
    connectors: ['CHAdeMO'],
    reliability7d: 61,
    outageRiskNext6h: 72,
    image: '/station-charger.svg',
  },
]

const statusRank: Record<StationStatus, number> = {
  ONLINE: 1,
  DEGRADED: 0.62,
  UNKNOWN: 0.3,
  OFFLINE: 0,
}

export const statusCopy: Record<StationStatus, string> = {
  ONLINE: 'Grid stable',
  DEGRADED: 'Pre-outage risk',
  OFFLINE: 'No usable power',
  UNKNOWN: 'Telemetry stale',
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function distanceBetweenKm(from: [number, number], to: [number, number]) {
  const earthRadiusKm = 6371
  const latDelta = ((to[0] - from[0]) * Math.PI) / 180
  const lngDelta = ((to[1] - from[1]) * Math.PI) / 180
  const fromLat = (from[0] * Math.PI) / 180
  const toLat = (to[0] * Math.PI) / 180
  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2)

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function scoreStation(station: Station, rangeKm: number) {
  const rangeFit = clamp((rangeKm - station.distanceKm) / Math.max(rangeKm, 1), 0, 1)
  const distanceFit = clamp(1 - station.distanceKm / 35, 0, 1)
  const waitFit = clamp(1 - station.waitMin / 30, 0, 1)
  const speedFit = clamp(station.speedKw / 150, 0, 1)
  const availabilityFit = station.total ? station.available / station.total : 0

  return Math.round(
    (rangeFit * 0.28 +
      statusRank[station.status] * 0.28 +
      waitFit * 0.17 +
      speedFit * 0.14 +
      distanceFit * 0.08 +
      availabilityFit * 0.05) *
      100,
  )
}
