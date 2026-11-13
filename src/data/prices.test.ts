import { expect, test } from 'vitest'
import { backoffDelay } from './liveStream'
import { applyMessage, FEED_SIZE, initialPrices, type PriceChange } from './prices'

const snapshot = (lastEventId: string, price = '100.00') => ({
  type: 'snapshot',
  lastEventId,
  products: [{ id: 1, name: 'Air Fryer 5L', store: 'Amazon', price, updatedAt: '2026-11-12T00:00:00Z' }],
})

const change = (id: string, oldPrice: string, newPrice: string): { type: string; change: PriceChange } => ({
  type: 'price_change',
  change: { id, productId: 1, name: 'Air Fryer 5L', store: 'Amazon', oldPrice, newPrice, changedAt: '2026-11-12T00:00:01Z' },
})

test('snapshot preenche os produtos', () => {
  const state = applyMessage(initialPrices, snapshot('10'))
  expect(state.ready).toBe(true)
  expect(state.lastEventId).toBe('10')
  expect(state.products).toHaveLength(1)
})

test('price_change atualiza preço, feed e contadores', () => {
  let state = applyMessage(initialPrices, snapshot('10'))
  state = applyMessage(state, change('11', '100.00', '90.00'))
  state = applyMessage(state, change('12', '90.00', '95.00'))
  expect(state.products[0].price).toBe('95.00')
  expect(state.lastEventId).toBe('12')
  expect(state.feed.map((c) => c.id)).toEqual(['12', '11'])
  expect(state.counts).toEqual({ total: 2, drops: 1, rises: 1 })
  expect(state.lastChange[1].id).toBe('12')
})

test('ignora evento com id menor ou igual ao lastEventId', () => {
  const start = applyMessage(initialPrices, snapshot('10'))
  expect(applyMessage(start, change('10', '100.00', '1.00'))).toBe(start)
  expect(applyMessage(start, change('9', '100.00', '1.00'))).toBe(start)
})

test('compara ids como bigint, não como float nem como texto', () => {
  // 2^53 + 1 e 2^53 + 2 são iguais em float; '9' > '10' em texto
  let state = applyMessage(initialPrices, snapshot('9007199254740993'))
  state = applyMessage(state, change('9007199254740994', '100.00', '90.00'))
  expect(state.counts.total).toBe(1)

  state = applyMessage(initialPrices, snapshot('9'))
  state = applyMessage(state, change('10', '100.00', '90.00'))
  expect(state.counts.total).toBe(1)
})

test('snapshot novo (reconexão) substitui os produtos e mantém feed e contadores', () => {
  let state = applyMessage(initialPrices, snapshot('10'))
  state = applyMessage(state, change('11', '100.00', '90.00'))
  state = applyMessage(state, snapshot('20', '70.00'))
  expect(state.products[0].price).toBe('70.00')
  expect(state.lastChange).toEqual({})
  expect(state.feed).toHaveLength(1)
  expect(state.counts.total).toBe(1)
  expect(applyMessage(state, change('15', '70.00', '1.00'))).toBe(state)
})

test('feed é limitado e mensagens desconhecidas são ignoradas', () => {
  let state = applyMessage(initialPrices, snapshot('0'))
  for (let i = 1; i <= FEED_SIZE + 5; i++) state = applyMessage(state, change(String(i), '100.00', '90.00'))
  expect(state.feed).toHaveLength(FEED_SIZE)
  expect(applyMessage(state, { type: 'news', item: {} })).toBe(state)
  expect(applyMessage(state, null)).toBe(state)
})

test('backoff dobra até o teto de 10s', () => {
  expect([0, 1, 2, 3, 10].map(backoffDelay)).toEqual([500, 1000, 2000, 4000, 10_000])
})
