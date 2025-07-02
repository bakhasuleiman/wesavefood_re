'use client'
import React, { useEffect, useRef } from 'react'

interface YandexMapStore {
  location: [number, number]
  name: string
  address: string
  [key: string]: any // для передачи дополнительных данных
}

interface YandexMapProps {
  center?: [number, number]
  zoom?: number
  stores?: YandexMapStore[]
  onStoreSelect?: (store: YandexMapStore) => void
}

export default function YandexMap({ center = [69.2797, 41.3112], zoom = 12, stores = [], onStoreSelect }: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const placemarksRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let mapInstance: any = null
    let ymapsScript: HTMLScriptElement | null = null

    function clearPlacemarks() {
      placemarksRef.current.forEach((pm: any) => mapInstance?.geoObjects.remove(pm))
      placemarksRef.current = []
    }

    function initMap() {
      (window as any).ymaps.ready(() => {
        mapInstance = new (window as any).ymaps.Map(mapRef.current, {
          center,
          zoom,
          controls: ['zoomControl', 'geolocationControl'],
        })
        addPlacemarks()
      })
    }

    function addPlacemarks() {
      if (!mapInstance) return
      clearPlacemarks()
      stores.forEach((store) => {
        const placemark = new (window as any).ymaps.Placemark(store.location, {
          balloonContent: `<strong>${store.name}</strong><br/>${store.address}`
        }, {
          preset: 'islands#icon',
          iconColor: '#0095b6',
        })
        placemark.events.add('click', () => {
          if (onStoreSelect) onStoreSelect(store)
        })
        mapInstance.geoObjects.add(placemark)
        placemarksRef.current.push(placemark)
      })
    }

    if (!(window as any).ymaps) {
      ymapsScript = document.createElement('script')
      ymapsScript.src = `https://api-maps.yandex.ru/2.1/?apikey=${(process.env as any).NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&lang=ru_RU`
      ymapsScript.type = 'text/javascript'
      ymapsScript.onload = () => initMap()
      document.head.appendChild(ymapsScript)
    } else {
      initMap()
    }

    return () => {
      if (mapInstance) mapInstance.destroy()
      if (ymapsScript) ymapsScript.remove()
    }
    // eslint-disable-next-line
  }, [center, zoom])

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ymaps) return
    (window as any).ymaps.ready(() => {
      const mapInstance = (window as any).ymaps.Map && (window as any).ymaps.Map.get && (window as any).ymaps.Map.get(mapRef.current)
      if (mapInstance) {
        // Обновляем маркеры при изменении списка магазинов
        placemarksRef.current.forEach((pm: any) => mapInstance.geoObjects.remove(pm))
        placemarksRef.current = []
        stores.forEach((store) => {
          const placemark = new (window as any).ymaps.Placemark(store.location, {
            balloonContent: `<strong>${store.name}</strong><br/>${store.address}`
          }, {
            preset: 'islands#icon',
            iconColor: '#0095b6',
          })
          placemark.events.add('click', () => {
            if (onStoreSelect) onStoreSelect(store)
          })
          mapInstance.geoObjects.add(placemark)
          placemarksRef.current.push(placemark)
        })
      }
    })
    // eslint-disable-next-line
  }, [stores])

  return (<div ref={mapRef} style={{ width: '100%', height: 500, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />)
} 