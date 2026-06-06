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
  activeSessions: number
  queueCount: number
  avgSessionMinutes: number
  lastUpdated: string
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

type ApiTelemetryStation = {
  stationId?: string
  name?: string
  address?: string
  latitude?: string | number
  longitude?: string | number
  status?: string
  timestamp?: string
  avgFrequency?: string | number
  voltage?: {
    V1?: string | number
  }
  estimatedWait?: string | number
  chargersAvailable?: string | number
  chargersTotal?: string | number
  chargeSpeedKw?: string | number
  activeSessions?: string | number
  avgSessionMinutes?: string | number
  connectorTypes?: string[]
  queueCount?: string | number
  lastReading?: string
  lastUpdated?: string
}

export const lagosDriverLocation: [number, number] = [6.5244, 3.3792]

export function estimateQueueWaitMin({
  avgSessionMinutes,
  chargersAvailable,
  chargersTotal,
  queueCount,
}: {
  avgSessionMinutes: number
  chargersAvailable: number
  chargersTotal: number
  queueCount: number
}) {
  const totalChargers = Math.max(1, chargersTotal)
  const driversAhead = Math.max(queueCount - chargersAvailable, 0)

  if (driversAhead === 0) {
    return 0
  }

  return Math.ceil(driversAhead / totalChargers) * Math.max(1, avgSessionMinutes)
}

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
    activeSessions: 2,
    queueCount: 1,
    avgSessionMinutes: 28,
    lastUpdated: '2026-06-06T09:14:32Z',
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
    id: 'NGR-VI-002',
    name: 'Victoria Island ChargePark',
    area: 'Akin Adesola Street, Victoria Island, Lagos',
    distanceKm: 6.8,
    waitMin: 12,
    speedKw: 90,
    price: 265,
    status: 'DEGRADED',
    available: 2,
    total: 5,
    activeSessions: 3,
    queueCount: 4,
    avgSessionMinutes: 32,
    lastUpdated: '2026-06-06T09:12:15Z',
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
    id: 'NGR-YBA-003',
    name: 'Yaba Fleet Depot',
    area: 'Herbert Macaulay Way, Yaba, Lagos',
    distanceKm: 11.4,
    waitMin: 8,
    speedKw: 60,
    price: 218,
    status: 'ONLINE',
    available: 3,
    total: 4,
    activeSessions: 1,
    queueCount: 2,
    avgSessionMinutes: 24,
    lastUpdated: '2026-06-06T09:11:02Z',
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
    id: 'NGR-AJA-006',
    name: 'Ajah Express Charge',
    area: 'Lekki-Epe Expressway, Ajah, Lagos',
    distanceKm: 25.6,
    waitMin: 6,
    speedKw: 150,
    price: 240,
    status: 'UNKNOWN',
    available: 0,
    total: 4,
    activeSessions: 0,
    queueCount: 0,
    avgSessionMinutes: 30,
    lastUpdated: '2026-06-06T08:55:46Z',
    voltage: 0,
    frequency: 0,
    demand: 63,
    coords: { x: 77, y: 72 },
    position: [6.4698, 3.5852],
    amenities: ['Mall', 'Security'],
    connectors: ['CCS2', 'Type 2'],
    reliability7d: 88,
    outageRiskNext6h: 28,
    image: '/station-charger.svg',
  },
  {
    id: 'NGR-IKJ-004',
    name: 'Ikeja GridSense Point',
    area: 'Allen Avenue, Ikeja, Lagos',
    distanceKm: 18.7,
    waitMin: 24,
    speedKw: 75,
    price: 230,
    status: 'OFFLINE',
    available: 0,
    total: 3,
    activeSessions: 0,
    queueCount: 5,
    avgSessionMinutes: 38,
    lastUpdated: '2026-06-06T09:04:21Z',
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
  {
    id: 'NGR-SUR-005',
    name: 'Surulere EV Plaza',
    area: 'Adeniran Ogunsanya Street, Surulere, Lagos',
    distanceKm: 7.8,
    waitMin: 8,
    speedKw: 80,
    price: 228,
    status: 'ONLINE',
    available: 2,
    total: 4,
    activeSessions: 2,
    queueCount: 3,
    avgSessionMinutes: 30,
    lastUpdated: '2026-06-06T09:05:21Z',
    voltage: 218.7,
    frequency: 50.2,
    demand: 71,
    coords: { x: 40, y: 63 },
    position: [6.5012, 3.358],
    amenities: ['Security', 'Restroom'],
    connectors: ['CCS2'],
    reliability7d: 91,
    outageRiskNext6h: 21,
    image: '/station-charger.svg',
  },
  {
    id: 'NGR-EBT-007',
    name: 'Ebute Metta Charge Yard',
    area: 'Murtala Muhammed Way, Ebute Metta, Lagos',
    distanceKm: 5.1,
    waitMin: 10,
    speedKw: 50,
    price: 214,
    status: 'ONLINE',
    available: 1,
    total: 3,
    activeSessions: 2,
    queueCount: 3,
    avgSessionMinutes: 34,
    lastUpdated: '2026-06-06T09:03:18Z',
    voltage: 216.4,
    frequency: 50,
    demand: 67,
    coords: { x: 35, y: 47 },
    position: [6.4889, 3.3847],
    amenities: ['Fleet bay'],
    connectors: ['Type 2'],
    reliability7d: 86,
    outageRiskNext6h: 31,
    image: '/station-charger.svg',
  },
  {
    id: 'NGR-GBG-008',
    name: 'Gbagada Smart Charger',
    area: 'Gbagada Expressway, Lagos',
    distanceKm: 4.2,
    waitMin: 0,
    speedKw: 100,
    price: 235,
    status: 'ONLINE',
    available: 3,
    total: 4,
    activeSessions: 1,
    queueCount: 2,
    avgSessionMinutes: 29,
    lastUpdated: '2026-06-06T09:02:44Z',
    voltage: 224.1,
    frequency: 50.3,
    demand: 76,
    coords: { x: 48, y: 58 },
    position: [6.5582, 3.3889],
    amenities: ['Cafe', 'Canopy'],
    connectors: ['CCS2'],
    reliability7d: 94,
    outageRiskNext6h: 15,
    image: '/station-charger.svg',
  },
  {
    id: 'NGR-FES-009',
    name: 'Festac Charging Bay',
    area: '2nd Avenue, Festac Town, Lagos',
    distanceKm: 18.4,
    waitMin: 18,
    speedKw: 70,
    price: 220,
    status: 'DEGRADED',
    available: 0,
    total: 3,
    activeSessions: 3,
    queueCount: 4,
    avgSessionMinutes: 36,
    lastUpdated: '2026-06-06T09:00:16Z',
    voltage: 190.3,
    frequency: 49.3,
    demand: 64,
    coords: { x: 16, y: 62 },
    position: [6.4694, 3.2847],
    amenities: ['Security'],
    connectors: ['CCS2', 'Type 2'],
    reliability7d: 79,
    outageRiskNext6h: 46,
    image: '/station-charger.svg',
  },
  {
    id: 'NGR-IKO-010',
    name: 'Ikorodu EV Hub',
    area: 'Lagos Road, Ikorodu, Lagos',
    distanceKm: 20.6,
    waitMin: 9,
    speedKw: 90,
    price: 226,
    status: 'ONLINE',
    available: 2,
    total: 5,
    activeSessions: 3,
    queueCount: 4,
    avgSessionMinutes: 33,
    lastUpdated: '2026-06-06T09:01:09Z',
    voltage: 220.9,
    frequency: 50.4,
    demand: 72,
    coords: { x: 72, y: 38 },
    position: [6.6194, 3.5105],
    amenities: ['Restroom', 'Security'],
    connectors: ['CCS2'],
    reliability7d: 89,
    outageRiskNext6h: 25,
    image: '/station-charger.svg',
  },
  {
    id: 'NGR-ESP-011',
    name: 'Ayo ESP32 Smart Meter',
    area: 'ESP32 field station, Lagos',
    distanceKm: 26.4,
    waitMin: 0,
    speedKw: 22,
    price: 210,
    status: 'ONLINE',
    available: 1,
    total: 2,
    activeSessions: 1,
    queueCount: 0,
    avgSessionMinutes: 40,
    lastUpdated: '2026-06-06T09:20:00Z',
    voltage: 221.4,
    frequency: 50.21,
    demand: 42,
    coords: { x: 10, y: 26 },
    position: [6.661302477957246, 3.25106035421942],
    amenities: ['ESP32 meter', 'Field demo'],
    connectors: ['Type 2'],
    reliability7d: 98,
    outageRiskNext6h: 10,
    image: '/station-charger.svg',
  },
]

function asNumber(value: string | number | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function mapGridStatus(status: string | undefined): StationStatus {
  switch (status?.toUpperCase()) {
    case 'ON':
    case 'ONLINE':
      return 'ONLINE'
    case 'DEGRADED':
      return 'DEGRADED'
    case 'OFF':
    case 'OFFLINE':
      return 'OFFLINE'
    default:
      return 'UNKNOWN'
  }
}

function normalizeConnectors(connectors: string[] | undefined, fallback: string[]) {
  if (!Array.isArray(connectors) || connectors.length === 0) {
    return fallback
  }

  return connectors.map((connector) => (connector === 'Type2' ? 'Type 2' : connector))
}

export function normalizeApiStations(payload: unknown): Station[] {
  const rawStations = Array.isArray(payload)
    ? payload
    : typeof payload === 'object' && payload !== null && Array.isArray((payload as { stations?: unknown }).stations)
      ? (payload as { stations: unknown[] }).stations
      : typeof payload === 'object' && payload !== null && Array.isArray((payload as { items?: unknown }).items)
        ? (payload as { items: unknown[] }).items
        : []

  return rawStations
    .map((rawStation) => {
      const telemetry = rawStation as ApiTelemetryStation
      const stationId = telemetry.stationId
      const fallback = stations.find((station) => station.id === stationId) ?? stations[0]

      if (!stationId) {
        return null
      }

      const latitude = asNumber(telemetry.latitude, fallback.position[0])
      const longitude = asNumber(telemetry.longitude, fallback.position[1])
      const status = mapGridStatus(telemetry.status)
      const available = asNumber(telemetry.chargersAvailable, fallback.available)
      const total = asNumber(telemetry.chargersTotal, fallback.total)
      const activeSessions = asNumber(telemetry.activeSessions, fallback.activeSessions)
      const queueCount = asNumber(telemetry.queueCount, fallback.queueCount)
      const avgSessionMinutes = asNumber(telemetry.avgSessionMinutes, fallback.avgSessionMinutes)
      const apiWaitMin = asNumber(telemetry.estimatedWait, fallback.waitMin)
      const hasQueueSignals =
        telemetry.queueCount !== undefined ||
        telemetry.chargersAvailable !== undefined ||
        telemetry.chargersTotal !== undefined ||
        telemetry.avgSessionMinutes !== undefined
      const computedWaitMin = estimateQueueWaitMin({
        avgSessionMinutes,
        chargersAvailable: available,
        chargersTotal: total,
        queueCount,
      })

      return {
        ...fallback,
        id: stationId,
        name: telemetry.name ?? fallback.name,
        area: telemetry.address ?? fallback.area,
        status,
        voltage: asNumber(telemetry.voltage?.V1, fallback.voltage),
        frequency: asNumber(telemetry.avgFrequency, fallback.frequency),
        waitMin: hasQueueSignals ? computedWaitMin : apiWaitMin,
        available,
        total,
        activeSessions,
        queueCount,
        avgSessionMinutes,
        speedKw: asNumber(telemetry.chargeSpeedKw, fallback.speedKw),
        connectors: normalizeConnectors(telemetry.connectorTypes, fallback.connectors),
        lastUpdated: telemetry.lastReading ?? telemetry.lastUpdated ?? telemetry.timestamp ?? fallback.lastUpdated,
        position: [latitude, longitude] as [number, number],
      }
    })
    .filter((station): station is Station => station !== null)
}

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
