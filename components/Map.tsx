'use client'

import { useEffect, useRef } from 'react'

function useLatestRef<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export interface GeocodeInsights {
  walking_score?: number
  driving_score?: number
  is_urban?: boolean
  walking_points?: [number, number][]
}

interface GeocodeData {
  lng: number
  lat: number
  insights?: GeocodeInsights
}

interface MapProps {
  address?: string
  onData?: (data: GeocodeData) => void
}

export default function Map({ address, onData }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const onDataRef = useLatestRef(onData)

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

    if (!mapRef.current || mapInstance.current) return

    const defaultCenter: [number, number] = [-80, 25]

    mapInstance.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter,
      zoom: 12,
    })

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapInstance.current?.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 15,
          })
        },
        () => {},
      )
    }

    return () => {
      markerRef.current?.remove()
      markerRef.current = null
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [])

  useEffect(() => {
    if (!address || !mapInstance.current) return

    fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      .then((res) => res.json())
      .then((data: GeocodeData & { error?: string }) => {
        if (data.error) return
        const { lng, lat, insights } = data
        const { walking_points = [] } = insights ?? {}

        onDataRef.current?.(data)

        const map = mapInstance.current!
        map.flyTo({ center: [lng, lat], zoom: 16 })

        markerRef.current?.remove()
        markerRef.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map)

        const radiusLatDeg = 200 / 111_000
        const radiusLonDeg = radiusLatDeg / Math.cos((lat * Math.PI) / 180)

        const addLayers = () => {
          if (walking_points.length > 0) {
            if (map.getSource('amenities')) map.removeSource('amenities')
            if (map.getLayer('amenities-circles'))
              map.removeLayer('amenities-circles')

            map.addSource('amenities', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection' as const,
                features: walking_points.map((coords) => ({
                  type: 'Feature' as const,
                  properties: {},
                  geometry: {
                    type: 'Point' as const,
                    coordinates: coords,
                  },
                })),
              },
            })
            map.addLayer({
              id: 'amenities-circles',
              type: 'circle',
              source: 'amenities',
              paint: {
                'circle-radius': 5,
                'circle-color': '#3b82f6',
                'circle-opacity': 0.7,
              },
            })
          }

          const circlePoints: [number, number][] = []
          for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * 2 * Math.PI
            circlePoints.push([
              lng + radiusLonDeg * Math.cos(angle),
              lat + radiusLatDeg * Math.sin(angle),
            ])
          }
          circlePoints.push(circlePoints[0])

          if (map.getSource('walking-radius'))
            map.removeSource('walking-radius')
          if (map.getLayer('walking-radius-fill'))
            map.removeLayer('walking-radius-fill')
          if (map.getLayer('walking-radius-line'))
            map.removeLayer('walking-radius-line')

          map.addSource('walking-radius', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [circlePoints],
              },
            },
          })
          map.addLayer({
            id: 'walking-radius-fill',
            type: 'fill',
            source: 'walking-radius',
            paint: {
              'fill-color': '#3b82f6',
              'fill-opacity': 0.15,
            },
          })
          map.addLayer({
            id: 'walking-radius-line',
            type: 'line',
            source: 'walking-radius',
            paint: {
              'line-color': '#3b82f6',
              'line-width': 2,
            },
          })
        }

        if (map.isStyleLoaded()) {
          addLayers()
        } else {
          map.once('load', addLayers)
        }
      })
      .catch(console.error)

    return () => {
      const map = mapInstance.current
      if (map?.getSource('amenities')) map.removeSource('amenities')
      if (map?.getLayer('amenities-circles'))
        map.removeLayer('amenities-circles')
      if (map?.getLayer('walking-radius-line'))
        map.removeLayer('walking-radius-line')
      if (map?.getLayer('walking-radius-fill'))
        map.removeLayer('walking-radius-fill')
      if (map?.getSource('walking-radius')) map.removeSource('walking-radius')
    }
  }, [address, onDataRef])

  return <div ref={mapRef} className="h-[400px] w-full rounded-lg" />
}
