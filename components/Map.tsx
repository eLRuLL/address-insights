'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type MapProps = {
  address?: string
}

export default function Map({ address }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

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
      .then((data) => {
        if (data.error) return
        const { lng, lat } = data

        mapInstance.current?.flyTo({ center: [lng, lat], zoom: 14 })

        markerRef.current?.remove()
        markerRef.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(mapInstance.current!)
      })
      .catch(console.error)
  }, [address])

  return <div ref={mapRef} className="h-[400px] w-full rounded-lg" />
}
