import { useEffect, useReducer, useState } from 'react'
import { applyMessage, initialLive } from './live'
import { connectLive, type ConnectionStatus } from './liveStream'

export const WS_URL: string = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000/ws'

export function useLive() {
  const [live, dispatch] = useReducer(applyMessage, initialLive)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => connectLive(WS_URL, dispatch, setStatus), [])

  return { live, status }
}
