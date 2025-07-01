'use client'
import { useEffect, useRef } from 'react'

interface YandexMapStore {
  location: [number, number]
  name: string
  address: string
}

interface YandexMapProps {
  center?: [number, number]
  zoom?: number
  stores?: YandexMapStore[]
}

export default function YandexMap({ center = [69.2797, 41.3112], zoom = 12, stores = [] }: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!(window as any).ymaps) {
      const script = document.createElement('script')
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&lang=ru_RU`
      script.type = 'text/javascript'
      script.onload = () => initMap()
      document.head.appendChild(script)
    } else {
      initMap()
    }

    function initMap() {
      (window as any).ymaps.ready(() => {
        const map = new (window as any).ymaps.Map(mapRef.current, {
          center,
          zoom,
        })
        stores.forEach((store) => {
          const placemark = new (window as any).ymaps.Placemark(store.location, {
            balloonContent: `<strong>${store.name}</strong><br/>${store.address}`
          })
          map.geoObjects.add(placemark)
        })
      })
    }
    // eslint-disable-next-line
  }, [center, zoom, stores])

  return <div ref={mapRef} style={{ width: '100%', height: 400 }} />
} 