'use client'
import { useEffect, useRef } from 'react'

interface YandexMapProps {
  center?: [number, number]
  zoom?: number
  markers?: [number, number][]
}

export default function YandexMap({ center = [69.2797, 41.3112], zoom = 12, markers = [] }: YandexMapProps) {
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
        markers.forEach((marker) => {
          map.geoObjects.add(new (window as any).ymaps.Placemark(marker))
        })
      })
    }
    // eslint-disable-next-line
  }, [center, zoom, markers])

  return <div ref={mapRef} style={{ width: '100%', height: 400 }} />
} 