'use client'

import { useCallback, useMemo } from 'react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { GeocodeInsights } from '@/components/Map'

const STORAGE_KEY = 'address-insights-search-history'
const MAX_ITEMS = 10

interface SearchHistoryItem {
  address: string
  insights?: GeocodeInsights
}

export function useSearchHistory() {
  const [history, setHistory] = useLocalStorage<SearchHistoryItem[]>(
    STORAGE_KEY,
    [],
  )

  const addToHistory = useCallback(
    (address: string, insights?: GeocodeInsights) => {
      setHistory((prev) => [{ address, insights }, ...prev].slice(0, MAX_ITEMS))
    },
    [setHistory],
  )

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [setHistory])

  return useMemo(
    () => ({ history, addToHistory, clearHistory }),
    [history, addToHistory, clearHistory],
  )
}
