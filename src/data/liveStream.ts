// Conexão WebSocket genérica: o servidor só envia ("snapshot" + eventos em ordem).
// Não conhece o domínio; cada seção do site decide o que fazer com as mensagens.

export type ConnectionStatus = 'connecting' | 'open' | 'reconnecting'

export function backoffDelay(attempt: number): number {
  return Math.min(10_000, 500 * 2 ** attempt)
}

export function connectLive(
  url: string,
  onMessage: (message: unknown) => void,
  onStatus: (status: ConnectionStatus) => void,
): () => void {
  let socket: WebSocket
  let timer: ReturnType<typeof setTimeout> | undefined
  let attempt = 0
  let stopped = false

  const open = () => {
    socket = new WebSocket(url)
    socket.onopen = () => {
      attempt = 0
      onStatus('open')
    }
    socket.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data))
      } catch {
        // mensagem que não é JSON: ignora
      }
    }
    socket.onclose = () => {
      if (stopped) return
      onStatus('reconnecting')
      timer = setTimeout(open, backoffDelay(attempt++) + Math.random() * 250)
    }
  }

  onStatus('connecting')
  open()

  return () => {
    stopped = true
    clearTimeout(timer)
    // Fechar um socket ainda conectando gera aviso no console; espera abrir.
    if (socket.readyState === WebSocket.CONNECTING) socket.onopen = () => socket.close()
    else socket.close()
  }
}
