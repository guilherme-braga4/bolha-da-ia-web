import { useEffect, useReducer, useState } from 'react'
import { connectLive, type ConnectionStatus } from './liveStream'
import { applyMessage, initialPrices } from './prices'

export const WS_URL: string = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000/ws'

export function usePrices() {
  const [prices, dispatch] = useReducer(applyMessage, initialPrices)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => connectLive(WS_URL, dispatch, setStatus), [])

  return { prices, status }
}
