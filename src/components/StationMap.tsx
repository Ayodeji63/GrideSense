import 'mapbox-gl/dist/mapbox-gl.css'

import { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Map, { Layer, Marker, Popup, Source, type MapRef } from 'react-map-gl'

type GridStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN'

type Station = {
  stationId: string
  name: string
  address: string
  lat: number
  lng: number
  gridStatus: GridStatus
  voltage: number
  frequency: number
  lastUpdated: string
  estimatedWait: number
  chargersAvailable: number
  chargersTotal: number
  chargeSpeedKw: number
  activeSessions?: number
  queueCount?: number
  connectorTypes?: string[]
}

type StationUpdate = Partial<Station> & {
  stationId: string
}

type StationMapProps = {
  stations: Station[]
  onStationSelect?: (station: Station) => void
  routeRequest?: {
    requestId: number
    stationId: string
  } | null
}

type RouteFeature = {
  type: 'Feature'
  properties: {
    distanceKm: number
    durationMin: number
  }
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]
  }
}

type DirectionsResponse = {
  routes?: Array<{
    distance: number
    duration: number
    geometry: {
      type: 'LineString'
      coordinates: [number, number][]
    }
  }>
}

type RuntimeEnv = {
  REACT_APP_MAPBOX_TOKEN?: string
  REACT_APP_WS_URL?: string
  VITE_MAPBOX_TOKEN?: string
  VITE_WS_URL?: string
  VITE_REACT_MAPBOX_TOKEN?: string
  VITE_REACT_WS_URL?: string
}

const statusColors: Record<GridStatus, string> = {
  ONLINE: '#22c55e',
  DEGRADED: '#f59e0b',
  OFFLINE: '#ef4444',
  UNKNOWN: '#6b7280',
}

const defaultViewState = {
  longitude: 3.3792,
  latitude: 6.5244,
  zoom: 12,
}
const driverLocation = {
  longitude: 3.3792,
  latitude: 6.5244,
}
const routeLayer = {
  id: 'selected-station-route',
  type: 'line',
  paint: {
    'line-blur': 1,
    'line-color': '#22c55e',
    'line-opacity': 0.9,
    'line-width': 5,
  },
} as const

const cameraPadding = {
  bottom: 86,
  left: 54,
  right: 54,
  top: 86,
}

function getRuntimeEnv() {
  return import.meta.env as RuntimeEnv
}

function formatRelativeTime(timestamp: string) {
  const updatedAt = new Date(timestamp).getTime()

  if (Number.isNaN(updatedAt)) {
    return 'Unknown'
  }

  const seconds = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000))

  if (seconds < 45) {
    return 'just now'
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function getMarkerStyle(gridStatus: GridStatus, selected: boolean) {
  const color = statusColors[gridStatus] ?? statusColors.UNKNOWN
  const glow = gridStatus === 'ONLINE' ? `0 0 0 8px ${color}22, 0 0 22px ${color}88` : `0 8px 18px #00000055`

  return {
    alignItems: 'center',
    background: color,
    border: '3px solid #ffffff',
    borderRadius: '16px 16px 16px 4px',
    boxShadow: glow,
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    fontSize: selected ? 18 : 15,
    height: selected ? 44 : 36,
    justifyContent: 'center',
    transform: 'rotate(-45deg)',
    transition: 'all 160ms ease',
    width: selected ? 44 : 36,
  } as const
}

function getMarkerIconStyle() {
  return {
    display: 'block',
    lineHeight: 1,
    transform: 'rotate(45deg)',
  } as const
}

function mergeStationUpdate(station: Station, update: StationUpdate) {
  if (station.stationId !== update.stationId) {
    return station
  }

  return {
    ...station,
    ...update,
  }
}

function distanceBetweenKm(from: { latitude: number; longitude: number }, to: Station) {
  const earthRadiusKm = 6371
  const latDelta = ((to.lat - from.latitude) * Math.PI) / 180
  const lngDelta = ((to.lng - from.longitude) * Math.PI) / 180
  const fromLat = (from.latitude * Math.PI) / 180
  const toLat = (to.lat * Math.PI) / 180
  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2)

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

function getCoordinateBounds(coordinates: [number, number][]) {
  const lngValues = coordinates.map(([longitude]) => longitude)
  const latValues = coordinates.map(([, latitude]) => latitude)

  return [
    [Math.min(...lngValues), Math.min(...latValues)],
    [Math.max(...lngValues), Math.max(...latValues)],
  ] as [[number, number], [number, number]]
}

function StationMap({ onStationSelect, routeRequest, stations }: StationMapProps) {
  const mapRef = useRef<MapRef | null>(null)
  const [stationData, setStationData] = useState<Station[]>(stations)
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [routeStationId, setRouteStationId] = useState<string | null>(null)
  const [routeFeature, setRouteFeature] = useState<RouteFeature | null>(null)
  const [routeStatus, setRouteStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const env = getRuntimeEnv()
  const mapboxToken =
    env.VITE_REACT_MAPBOX_TOKEN ?? env.VITE_MAPBOX_TOKEN ?? env.REACT_APP_MAPBOX_TOKEN
  const websocketUrl = env.VITE_REACT_WS_URL ?? env.VITE_WS_URL ?? env.REACT_APP_WS_URL
  const selectedStation = stationData.find((station) => station.stationId === selectedStationId)
  const routeStation = stationData.find((station) => station.stationId === routeStationId)
  const routeDistanceKm = routeFeature?.properties.distanceKm ?? (routeStation ? distanceBetweenKm(driverLocation, routeStation) : 0)
  const routeEtaMin = routeFeature?.properties.durationMin ?? Math.max(3, Math.round((routeDistanceKm / 28) * 60))

  const fitMapToCoordinates = useCallback((coordinates: [number, number][]) => {
    if (!mapRef.current || coordinates.length === 0) {
      return
    }

    if (coordinates.length === 1) {
      mapRef.current.flyTo({
        center: coordinates[0],
        duration: 650,
        essential: true,
        zoom: 14,
      })
      return
    }

    mapRef.current.fitBounds(getCoordinateBounds(coordinates), {
      duration: 700,
      essential: true,
      maxZoom: 15,
      padding: cameraPadding,
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (!cancelled) {
        setStationData(stations)
      }
    })

    return () => {
      cancelled = true
    }
  }, [stations])

  useEffect(() => {
    if (!websocketUrl) {
      return undefined
    }

    const socket = new WebSocket(websocketUrl)

    socket.addEventListener('message', (event) => {
      try {
        const update = JSON.parse(event.data) as StationUpdate

        if (!update.stationId) {
          return
        }

        setStationData((currentStations) =>
          currentStations.map((station) => mergeStationUpdate(station, update)),
        )
      } catch {
        // Ignore malformed live telemetry messages.
      }
    })

    return () => {
      socket.close()
    }
  }, [websocketUrl])

  const handleStationClick = (station: Station) => {
    setSelectedStationId(station.stationId)
    onStationSelect?.(station)
  }

  const startInAppRoute = useCallback(async (station: Station) => {
    setRouteStationId(station.stationId)
    setSelectedStationId(station.stationId)
    setRouteFeature(null)
    setRouteStatus('loading')
    fitMapToCoordinates([
      [driverLocation.longitude, driverLocation.latitude],
      [station.lng, station.lat],
    ])

    if (!mapboxToken) {
      setRouteStatus('error')
      return
    }

    const coordinates = `${driverLocation.longitude},${driverLocation.latitude};${station.lng},${station.lat}`
    const routeUrl = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`)
    routeUrl.searchParams.set('access_token', mapboxToken)
    routeUrl.searchParams.set('geometries', 'geojson')
    routeUrl.searchParams.set('overview', 'full')
    routeUrl.searchParams.set('steps', 'false')

    try {
      const response = await fetch(routeUrl)

      if (!response.ok) {
        throw new Error('Directions request failed')
      }

      const data = (await response.json()) as DirectionsResponse
      const route = data.routes?.[0]

      if (!route) {
        throw new Error('No route found')
      }

      setRouteFeature({
        type: 'Feature',
        properties: {
          distanceKm: route.distance / 1000,
          durationMin: Math.max(1, Math.round(route.duration / 60)),
        },
        geometry: route.geometry,
      })
      fitMapToCoordinates(route.geometry.coordinates)
      setRouteStatus('ready')
    } catch {
      setRouteStatus('error')
    }
  }, [fitMapToCoordinates, mapboxToken])

  useEffect(() => {
    if (!routeRequest) {
      return
    }

    const station = stationData.find((currentStation) => currentStation.stationId === routeRequest.stationId)

    if (!station) {
      return
    }

    queueMicrotask(() => {
      void startInAppRoute(station)
    })
  }, [routeRequest, stationData, startInAppRoute])

  return (
    <div style={{ height: '100%', minHeight: 320, position: 'relative', width: '100%' }}>
      {!mapboxToken && (
        <div
          style={{
            background: '#1a1a2e',
            borderRadius: 12,
            color: '#ffffff',
            left: 12,
            padding: '10px 12px',
            position: 'absolute',
            right: 12,
            top: 12,
            zIndex: 2,
          }}
        >
          Missing VITE_REACT_MAPBOX_TOKEN
        </div>
      )}

      <Map
        initialViewState={defaultViewState}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
      >
        {routeFeature && (
          <Source data={routeFeature} id="selected-station-route-source" type="geojson">
            <Layer {...routeLayer} />
          </Source>
        )}

        <Marker anchor="center" latitude={driverLocation.latitude} longitude={driverLocation.longitude}>
          <span
            aria-label="Driver location"
            role="img"
            style={{
              alignItems: 'center',
              background: '#0ea5e9',
              border: '3px solid #ffffff',
              borderRadius: 999,
              boxShadow: '0 0 0 8px #0ea5e933, 0 8px 18px #00000044',
              color: '#ffffff',
              display: 'flex',
              fontSize: 14,
              height: 34,
              justifyContent: 'center',
              width: 34,
            }}
          >
            ●
          </span>
        </Marker>

        {stationData.map((station) => {
          const isSelected = selectedStationId === station.stationId

          return (
            <Marker
              anchor="bottom"
              key={station.stationId}
              latitude={station.lat}
              longitude={station.lng}
              onClick={(event) => {
                event.originalEvent.stopPropagation()
                handleStationClick(station)
              }}
            >
              <button
                aria-label={`${station.name} ${station.gridStatus}`}
                style={{
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  padding: 0,
                }}
                type="button"
              >
                <span style={getMarkerStyle(station.gridStatus, isSelected)}>
                  <span aria-hidden="true" style={getMarkerIconStyle()}>
                    ⚡
                  </span>
                </span>
              </button>
            </Marker>
          )
        })}

        {selectedStation && (
          <Popup
            anchor="top"
            closeButton
            closeOnClick={false}
            latitude={selectedStation.lat}
            longitude={selectedStation.lng}
            maxWidth="280px"
            offset={18}
            onClose={() => setSelectedStationId(null)}
          >
            <div
              style={{
                background: '#1a1a2e',
                borderRadius: 12,
                color: '#ffffff',
                margin: -10,
                padding: 14,
                width: 260,
              }}
            >
              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: 15, lineHeight: 1.2 }}>
                    {selectedStation.name}
                  </strong>
                  <span style={{ color: '#c7d2fe', display: 'block', fontSize: 12, marginTop: 4 }}>
                    {selectedStation.address}
                  </span>
                </div>
                <span
                  style={{
                    alignSelf: 'start',
                    background: statusColors[selectedStation.gridStatus],
                    borderRadius: 999,
                    color: '#ffffff',
                    flex: '0 0 auto',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '4px 8px',
                  }}
                >
                  {selectedStation.gridStatus}
                </span>
              </div>

              <dl
                style={{
                  display: 'grid',
                  gap: 8,
                  gridTemplateColumns: '1fr 1fr',
                  margin: '14px 0',
                }}
              >
                <div>
                  <dt style={{ color: '#94a3b8', fontSize: 11 }}>Voltage</dt>
                  <dd style={{ margin: 0 }}>{selectedStation.voltage.toFixed(1)}V</dd>
                </div>
                <div>
                  <dt style={{ color: '#94a3b8', fontSize: 11 }}>Frequency</dt>
                  <dd style={{ margin: 0 }}>{selectedStation.frequency.toFixed(2)} Hz</dd>
                </div>
                <div>
                  <dt style={{ color: '#94a3b8', fontSize: 11 }}>Wait</dt>
                  <dd style={{ margin: 0 }}>{selectedStation.estimatedWait} mins</dd>
                </div>
                <div>
                  <dt style={{ color: '#94a3b8', fontSize: 11 }}>Queue</dt>
                  <dd style={{ margin: 0 }}>{selectedStation.queueCount ?? 0} drivers</dd>
                </div>
                <div>
                  <dt style={{ color: '#94a3b8', fontSize: 11 }}>Chargers</dt>
                  <dd style={{ margin: 0 }}>
                    {selectedStation.chargersAvailable} / {selectedStation.chargersTotal}
                  </dd>
                </div>
                <div>
                  <dt style={{ color: '#94a3b8', fontSize: 11 }}>Sessions</dt>
                  <dd style={{ margin: 0 }}>{selectedStation.activeSessions ?? 0} active</dd>
                </div>
                <div>
                  <dt style={{ color: '#94a3b8', fontSize: 11 }}>Speed</dt>
                  <dd style={{ margin: 0 }}>{selectedStation.chargeSpeedKw} kW</dd>
                </div>
                <div>
                  <dt style={{ color: '#94a3b8', fontSize: 11 }}>Updated</dt>
                  <dd style={{ margin: 0 }}>{formatRelativeTime(selectedStation.lastUpdated)}</dd>
                </div>
              </dl>

              {selectedStation.connectorTypes && selectedStation.connectorTypes.length > 0 && (
                <div style={{ color: '#c7d2fe', fontSize: 12, margin: '-4px 0 12px' }}>
                  {selectedStation.connectorTypes.join(' / ')}
                </div>
              )}

              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr auto' }}>
                <button
                  onClick={() => void startInAppRoute(selectedStation)}
                  style={{
                    background: '#22c55e',
                    border: 0,
                    borderRadius: 10,
                    color: '#052e16',
                    cursor: 'pointer',
                    fontWeight: 800,
                    minHeight: 38,
                  }}
                  type="button"
                >
                  {routeStatus === 'loading' && routeStationId === selectedStation.stationId ? 'Routing...' : 'Start route'}
                </button>
                <button
                  onClick={() => setSelectedStationId(null)}
                  style={{
                    background: '#272747',
                    border: '1px solid #3f3f66',
                    borderRadius: 10,
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 800,
                    minHeight: 38,
                    padding: '0 12px',
                  }}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>
      {routeStation && (
        <div
          style={{
            background: '#1a1a2e',
            border: '1px solid #2f2f55',
            borderRadius: 14,
            boxShadow: '0 14px 34px #00000055',
            color: '#ffffff',
            display: 'grid',
            gap: 10,
            gridTemplateColumns: '1fr auto',
            left: 14,
            padding: 12,
            position: 'absolute',
            right: 14,
            top: 14,
            zIndex: 2,
          }}
        >
          <div>
            <strong style={{ display: 'block', fontSize: 14 }}>
              {routeStatus === 'error' ? 'Road route unavailable' : `Navigating to ${routeStation.name}`}
            </strong>
            <span style={{ color: '#c7d2fe', display: 'block', fontSize: 12, marginTop: 3 }}>
              {routeStatus === 'loading'
                ? 'Finding a road route...'
                : routeStatus === 'error'
                  ? 'Mapbox Directions could not return a drivable route.'
                  : `${routeDistanceKm.toFixed(1)} km · approx. ${routeEtaMin} mins`}
            </span>
          </div>
          <button
            onClick={() => {
              setRouteStationId(null)
              setRouteFeature(null)
              setRouteStatus('idle')
            }}
            style={{
              background: '#272747',
              border: '1px solid #3f3f66',
              borderRadius: 10,
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 800,
              padding: '0 12px',
            }}
            type="button"
          >
            End
          </button>
        </div>
      )}
    </div>
  )
}

StationMap.propTypes = {
  onStationSelect: PropTypes.func,
  routeRequest: PropTypes.shape({
    requestId: PropTypes.number.isRequired,
    stationId: PropTypes.string.isRequired,
  }),
  stations: PropTypes.array.isRequired,
}

export default StationMap
