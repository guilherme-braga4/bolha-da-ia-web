// Estado de todos os tópicos: função pura (estado, mensagem) -> estado, sem React.
// Contrato: um "snapshot" por tópico ao conectar e, depois, "event" em ordem.

export type Product = { id: number; name: string; store: string; price: string; updatedAt: string }
export type Metric = { key: string; label: string; unit: string; value: string; updatedAt: string }
export type Stock = { symbol: string; name: string; price: string; previousClose: string; updatedAt: string }
export type News = { id: number; title: string; url: string; source: string; publishedAt: string }

export type Items = { prices: Product; metrics: Metric; stocks: Stock; news: News }
export type Topic = keyof Items

// Campo do item que é a chave dentro do tópico (o snapshot não manda a chave à parte).
const KEY_FIELD: { [T in Topic]: keyof Items[T] } = {
  prices: 'id',
  metrics: 'key',
  stocks: 'symbol',
  news: 'id',
}

export type LiveEvent<T extends Topic = Topic> = {
  id: string // bigint em texto, cresce em ordem entre todos os tópicos
  topic: T
  key: string
  item: Items[T]
  previous: Items[T] | null
  at: string
}

export type LiveState = {
  lastEventId: string
  // itens por chave; o tópico só existe depois do primeiro snapshot dele
  items: { [T in Topic]?: Record<string, Items[T]> }
  lastEvent: Record<string, LiveEvent> // por "tópico/chave", desde o snapshot atual
  priceFeed: LiveEvent<'prices'>[] // mais recente primeiro
  counts: Record<Topic, number> // eventos recebidos na sessão
}

export const FEED_SIZE = 40

export const initialLive: LiveState = {
  lastEventId: '0',
  items: {},
  lastEvent: {},
  priceFeed: [],
  counts: { prices: 0, metrics: 0, stocks: 0, news: 0 },
}

export function applyMessage(state: LiveState, message: unknown): LiveState {
  const msg = message as
    | { type: 'snapshot'; topic: Topic; lastEventId: string; items: Items[Topic][] }
    | ({ type: 'event' } & LiveEvent)
    | { type?: undefined }
    | null

  // tipos de mensagem e tópicos desconhecidos são ignorados
  if (!msg?.type || !(msg.topic in KEY_FIELD)) return state

  if (msg.type === 'snapshot') {
    // Snapshot repõe o estado do tópico; feed e contadores são da sessão.
    const keyField = KEY_FIELD[msg.topic] as keyof Items[Topic]
    const prefix = `${msg.topic}/`
    return {
      ...state,
      lastEventId: msg.lastEventId,
      items: {
        ...state.items,
        [msg.topic]: Object.fromEntries(msg.items.map((item) => [String(item[keyField]), item])),
      },
      lastEvent: Object.fromEntries(Object.entries(state.lastEvent).filter(([k]) => !k.startsWith(prefix))),
    }
  }

  if (msg.type === 'event') {
    if (BigInt(msg.id) <= BigInt(state.lastEventId)) return state
    return {
      ...state,
      lastEventId: msg.id,
      items: { ...state.items, [msg.topic]: { ...state.items[msg.topic], [msg.key]: msg.item } },
      lastEvent: { ...state.lastEvent, [`${msg.topic}/${msg.key}`]: msg },
      priceFeed:
        msg.topic === 'prices'
          ? [msg as LiveEvent<'prices'>, ...state.priceFeed].slice(0, FEED_SIZE)
          : state.priceFeed,
      counts: { ...state.counts, [msg.topic]: state.counts[msg.topic] + 1 },
    }
  }

  return state
}

// Último evento de um item, para a tela sinalizar a mudança.
export function lastEventOf<T extends Topic>(state: LiveState, topic: T, key: string | number) {
  return state.lastEvent[`${topic}/${key}`] as LiveEvent<T> | undefined
}
