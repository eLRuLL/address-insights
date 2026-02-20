import { NextRequest, NextResponse } from 'next/server'

const WALKING_RADIUS_M = 200
const TILEQUERY_LIMIT = 50
const DRIVING_MAX_KM = 2
const DRIVING_OFFSET_M = DRIVING_MAX_KM * 1000 - WALKING_RADIUS_M
const DRIVING_OFFSET_DEG = DRIVING_OFFSET_M / 111_000
const URBAN_THRESHOLD = 10

const tilequeryUrl = (
  lon: number,
  lat: number,
  radius: number,
  token: string,
) =>
  `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lon},${lat}.json?access_token=${token}&radius=${radius}&limit=${TILEQUERY_LIMIT}&layers=poi_label&geometry=point`

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')
  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 })
  }

  const token = process.env.MAPBOX_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'Server misconfigured: missing MAPBOX_ACCESS_TOKEN' },
      { status: 500 },
    )
  }

  const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1`
  const geocodeRes = await fetch(geocodeUrl)
  const geocodeData = await geocodeRes.json()

  const feature = geocodeData.features?.[0]
  if (!feature) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }

  const [lng, lat] = feature.center

  const cardinalPoints = [
    { lat: lat + DRIVING_OFFSET_DEG, lng },
    { lat: lat - DRIVING_OFFSET_DEG, lng },
    { lat, lng: lng + DRIVING_OFFSET_DEG },
    { lat, lng: lng - DRIVING_OFFSET_DEG },
  ]

  const [walkingRes, ...cardinalRes] = await Promise.all([
    fetch(tilequeryUrl(lng, lat, WALKING_RADIUS_M, token)),
    ...cardinalPoints.map((p) =>
      fetch(tilequeryUrl(p.lng, p.lat, WALKING_RADIUS_M, token)),
    ),
  ])

  const walkingData = await walkingRes.json()
  const walkingPoints =
    walkingData.features?.map(
      (f: { geometry: { coordinates: [number, number] } }) =>
        f.geometry.coordinates,
    ) ?? []
  const walkingCount = walkingData.features?.length ?? 0

  const cardinalDatas = await Promise.all(cardinalRes.map((r) => r.json()))
  const seenIds = new Set<string | number>()
  for (const f of walkingData.features ?? []) {
    if (f.id != null) seenIds.add(f.id)
  }
  for (const data of cardinalDatas) {
    for (const f of data.features ?? []) {
      if (f.id != null) seenIds.add(f.id)
    }
  }
  const drivingCount = seenIds.size

  return NextResponse.json({
    lng,
    lat,
    insights: {
      walking_score: walkingCount,
      walking_points: walkingPoints,
      driving_score: drivingCount,
      is_urban: walkingCount > URBAN_THRESHOLD,
    },
  })
}
