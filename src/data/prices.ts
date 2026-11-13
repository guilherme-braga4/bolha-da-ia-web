// Estado da seção de preços: função pura (mensagem -> novo estado), sem React.

export type Product = {
  id: number
  name: string
  store: string
  price: string // decimal em texto
  updatedAt: string
}

export type PriceChange = {
  id: string // bigint em texto
  productId: number
  name: string
  store: string
  oldPrice: string
  newPrice: string
  changedAt: string
}

export type PricesState = {
  ready: boolean // já chegou algum snapshot
  lastEventId: string
  products: Product[]
  lastChange: Record<number, PriceChange> // por productId, desde o snapshot atual
  feed: PriceChange[] // mais recente primeiro
  counts: { total: number; drops: number; rises: number }
}

export const FEED_SIZE = 40

export const initialPrices: PricesState = {
  ready: false,
  lastEventId: '0',
  products: [],
  lastChange: {},
  feed: [],
  counts: { total: 0, drops: 0, rises: 0 },
}

export function isDrop(change: PriceChange): boolean {
  return Number(change.newPrice) < Number(change.oldPrice)
}

export function applyMessage(state: PricesState, message: unknown): PricesState {
  const msg = message as
    | { type: 'snapshot'; lastEventId: string; products: Product[] }
    | { type: 'price_change'; change: PriceChange }
    | { type?: undefined }

  if (msg?.type === 'snapshot') {
    // Snapshot repõe o estado dos produtos; feed e contadores são da sessão.
    return {
      ...state,
      ready: true,
      lastEventId: msg.lastEventId,
      products: msg.products,
      lastChange: {},
    }
  }

  if (msg?.type === 'price_change') {
    const change = msg.change
    if (BigInt(change.id) <= BigInt(state.lastEventId)) return state

    const updated = { price: change.newPrice, updatedAt: change.changedAt }
    const known = state.products.some((p) => p.id === change.productId)
    const drop = isDrop(change)
    return {
      ...state,
      lastEventId: change.id,
      products: known
        ? state.products.map((p) => (p.id === change.productId ? { ...p, ...updated } : p))
        : [...state.products, { id: change.productId, name: change.name, store: change.store, ...updated }],
      lastChange: { ...state.lastChange, [change.productId]: change },
      feed: [change, ...state.feed].slice(0, FEED_SIZE),
      counts: {
        total: state.counts.total + 1,
        drops: state.counts.drops + (drop ? 1 : 0),
        rises: state.counts.rises + (drop ? 0 : 1),
      },
    }
  }

  return state // tipos de mensagem desconhecidos (futuras seções) são ignorados
}
