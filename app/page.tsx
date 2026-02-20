'use client'

import Map from '@/components/Map'
import { useCallback, useState } from 'react'
import type { GeocodeInsights } from '@/components/Map'

export default function Home() {
  const [address, setAddress] = useState<string>('')
  const [searchAddress, setSearchAddress] = useState<string>('')
  const [insights, setInsights] = useState<GeocodeInsights | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearchAddress(address)
    setInsights(null)
  }

  const handleGeocodeData = useCallback(
    (data: { insights?: GeocodeInsights | null }) => {
      setInsights(data.insights ?? null)
    },
    [],
  )

  return (
    <main className="p-8 flex flex-col items-center justify-center gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-center gap-4"
      >
        <input
          type="text"
          value={address}
          placeholder="Enter an address"
          onChange={(e) => setAddress(e.target.value)}
          className="border border-gray-300 p-2 rounded-md text-xl min-w-[400px]"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          Search
        </button>
      </form>

      {searchAddress && insights && (
        <div className="flex gap-6 text-lg flex-col items-center">
          {insights.walking_score !== undefined && (
            <div>
              <span className="font-bold">Walking score:</span>{' '}
              {insights.walking_score} amenities (200m)
            </div>
          )}
          {insights.driving_score !== undefined && (
            <div>
              <span className="font-bold">Driving score:</span>{' '}
              {insights.driving_score} amenities (2km)
            </div>
          )}
          {insights.is_urban !== undefined && (
            <div className="flex items-center gap-2">
              {insights.is_urban ? (
                <div className="text-green-500">Urban</div>
              ) : (
                <div className="text-red-500">Suburban</div>
              )}
            </div>
          )}
        </div>
      )}

      <Map address={searchAddress} onData={handleGeocodeData} />
    </main>
  )
}
