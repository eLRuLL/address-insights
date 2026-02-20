'use client'

import Map from '@/components/Map'
import { useState } from 'react'

export default function Home() {
  const [address, setAddress] = useState<string>('')
  const [searchAddress, setSearchAddress] = useState<string>('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearchAddress(address)
  }

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

      <Map address={searchAddress} />
    </main>
  )
}
