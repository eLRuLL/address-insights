'use client'

import Map from '@/components/Map'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import type { GeocodeInsights } from '@/components/Map'
import { useSearchHistory } from '@/hooks/useSearchHistory'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlAddress = searchParams.get('address') ?? ''
  const [address, setAddress] = useState(() => urlAddress)
  const [searchAddress, setSearchAddress] = useState(() => urlAddress)
  const [insights, setInsights] = useState<GeocodeInsights | null>(null)
  const { history, addToHistory, clearHistory } = useSearchHistory()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearchAddress(address)
    setInsights(null)
    router.replace(`/?address=${encodeURIComponent(address)}`)
  }

  const handleGeocodeData = useCallback(
    (data: { insights?: GeocodeInsights | null }) => {
      setInsights(data.insights ?? null)
      addToHistory(searchAddress, data.insights ?? undefined)
    },
    [searchAddress, addToHistory],
  )

  return (
    <main className="p-8 flex flex-row items-center justify-between gap-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
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
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md"
          >
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
      </div>
      <div className="flex flex-col items-center justify-center gap-4 border border-gray-300 p-4 rounded-md h-full">
        <span className="font-bold text-lg">Search History:</span>
        <ul className="flex flex-col items-center justify-center w-full p-0 m-0 rounded-md overflow-hidden">
          {history.map((item, index) => (
            <li
              key={`${index}-${item.address}`}
              className="text-lg odd:bg-gray-700 even:bg-gray-800 p-2 w-full"
            >
              {item.address}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => clearHistory()}
          className="bg-red-500 text-white p-2 rounded-md"
        >
          Clear history
        </button>
      </div>
    </main>
  )
}
