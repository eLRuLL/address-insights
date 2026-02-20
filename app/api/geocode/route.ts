import { NextRequest, NextResponse } from 'next/server'

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

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1`

  const res = await fetch(url)
  const data = await res.json()

  const feature = data.features?.[0]
  if (!feature) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }

  const [lng, lat] = feature.center
  return NextResponse.json({ lng, lat })
}
