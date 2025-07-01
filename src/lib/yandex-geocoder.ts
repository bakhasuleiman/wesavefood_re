export async function geocode(address: string): Promise<[number, number] | null> {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY
  const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${encodeURIComponent(address)}`
  const res = await fetch(url)
  const data = await res.json()
  const pos = data.response.GeoObjectCollection.featureMember[0]?.GeoObject?.Point?.pos
  if (pos) {
    const [lng, lat] = pos.split(' ').map(Number)
    return [lng, lat]
  }
  return null
} 