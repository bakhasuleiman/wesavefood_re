'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Store } from '@/lib/github'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface MapProps {
  stores: Store[]
  onStoreSelect?: (store: Store) => void
}

export default function Map({ stores, onStoreSelect }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [lng] = useState(69.2401) // Tashkent longitude
  const [lat] = useState(41.2995) // Tashkent latitude
  const [zoom] = useState(11)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
    })

    map.current.addControl(new mapboxgl.NavigationControl())
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }))

    return () => {
      map.current?.remove()
    }
  }, [lng, lat, zoom])

  useEffect(() => {
    if (!map.current) return

    // Удаляем существующие маркеры перед добавлением новых
    const markers = document.getElementsByClassName('mapboxgl-marker')
    while(markers[0]) {
      markers[0].remove()
    }

    stores.forEach(store => {
      const marker = new mapboxgl.Marker()
        .setLngLat([store.location.lng, store.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <h3 class="font-semibold">${store.name}</h3>
              <p class="text-sm text-gray-600">${store.address}</p>
            `)
        )
        .addTo(map.current!)

      marker.getElement().addEventListener('click', () => {
        onStoreSelect?.(store)
      })
    })
  }, [stores, onStoreSelect])

  return (
    <div ref={mapContainer} className="w-full h-[500px] rounded-lg shadow-soft" />
  )
} 