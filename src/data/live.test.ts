import { expect, test } from 'vitest'
import { applyMessage, FEED_SIZE, initialLive, lastEventOf, type Product, type Stock } from './live'
import { backoffDelay } from './liveStream'

const product = (price: string): Product => ({ id: 1, name: 'Air Fryer 5L', store: 'Amazon', price, updatedAt: 't' })
const stock = (price: string): Stock => ({ symbol: 'NVDA', name: 'Nvidia', price, previousClose: '110.00', updatedAt: 't' })

const pricesSnapshot = (lastEventId: string, price = '100.00') => ({
  type: 'snapshot',
  topic: 'prices',
  lastEventId,
  items: [product(price)],
})

const priceEvent = (id: string, oldPrice: string, newPrice: string) => ({
  type: 'event',
  topic: 'prices',
  id,
  key: '1',
  item: product(newPrice),
  previous: product(oldPrice),
  at: 't',
})

test('snapshot preenche o tópico, indexado pela chave', () => {
  let state = applyMessage(initialLive, pricesSnapshot('10'))
  state = applyMessage(state, { type: 'snapshot', topic: 'stocks', lastEventId: '10', items: [stock('113.40')] })
  expect(state.lastEventId).toBe('10')
  expect(state.items.prices?.['1'].price).toBe('100.00')
  expect(state.items.stocks?.NVDA.price).toBe('113.40')
  expect(state.items.news).toBeUndefined()
})

test('event troca o item da chave e atualiza feed e contadores', () => {
  let state = applyMessage(initialLive, pricesSnapshot('10'))
  state = applyMessage(state, priceEvent('11', '100.00', '90.00'))
  state = applyMessage(state, priceEvent('12', '90.00', '95.00'))
  expect(state.items.prices?.['1'].price).toBe('95.00')
  expect(state.lastEventId).toBe('12')
  expect(state.priceFeed.map((e) => e.id)).toEqual(['12', '11'])
  expect(state.counts.prices).toBe(2)
  expect(lastEventOf(state, 'prices', 1)?.previous?.price).toBe('90.00')
})

test('event inclui item novo, mesmo em tópico que ainda não teve snapshot', () => {
  const news = { id: 7, title: 'Título', url: 'https://example.com', source: 'Fonte', publishedAt: 't' }
  const state = applyMessage(initialLive, { type: 'event', topic: 'news', id: '5', key: '7', item: news, previous: null, at: 't' })
  expect(state.items.news?.['7']).toEqual(news)
  expect(state.counts.news).toBe(1)
  expect(state.priceFeed).toHaveLength(0)
})

test('ignora evento com id menor ou igual ao lastEventId', () => {
  const start = applyMessage(initialLive, pricesSnapshot('10'))
  expect(applyMessage(start, priceEvent('10', '100.00', '1.00'))).toBe(start)
  expect(applyMessage(start, priceEvent('9', '100.00', '1.00'))).toBe(start)
})

test('compara ids como bigint, não como float nem como texto', () => {
  // 2^53 + 1 e 2^53 + 2 são iguais em float; '9' > '10' em texto
  let state = applyMessage(initialLive, pricesSnapshot('9007199254740993'))
  state = applyMessage(state, priceEvent('9007199254740994', '100.00', '90.00'))
  expect(state.counts.prices).toBe(1)

  state = applyMessage(initialLive, pricesSnapshot('9'))
  state = applyMessage(state, priceEvent('10', '100.00', '90.00'))
  expect(state.counts.prices).toBe(1)
})

test('snapshot novo (reconexão) repõe o tópico e mantém feed, contadores e os outros tópicos', () => {
  let state = applyMessage(initialLive, pricesSnapshot('10'))
  state = applyMessage(state, priceEvent('11', '100.00', '90.00'))
  state = applyMessage(state, { type: 'event', topic: 'stocks', id: '12', key: 'NVDA', item: stock('98.70'), previous: stock('113.40'), at: 't' })
  state = applyMessage(state, pricesSnapshot('20', '70.00'))
  expect(state.items.prices?.['1'].price).toBe('70.00')
  expect(lastEventOf(state, 'prices', 1)).toBeUndefined()
  expect(lastEventOf(state, 'stocks', 'NVDA')?.id).toBe('12')
  expect(state.priceFeed).toHaveLength(1)
  expect(state.counts.prices).toBe(1)
  expect(applyMessage(state, priceEvent('15', '70.00', '1.00'))).toBe(state)
})

test('feed é limitado; mensagens e tópicos desconhecidos são ignorados', () => {
  let state = applyMessage(initialLive, pricesSnapshot('0'))
  for (let i = 1; i <= FEED_SIZE + 5; i++) state = applyMessage(state, priceEvent(String(i), '100.00', '90.00'))
  expect(state.priceFeed).toHaveLength(FEED_SIZE)
  expect(applyMessage(state, { type: 'event', topic: 'layoffs', id: '999', key: 'x', item: {}, previous: null, at: 't' })).toBe(state)
  expect(applyMessage(state, { type: 'price_change', change: {} })).toBe(state)
  expect(applyMessage(state, null)).toBe(state)
})

test('backoff dobra até o teto de 10s', () => {
  expect([0, 1, 2, 3, 10].map(backoffDelay)).toEqual([500, 1000, 2000, 4000, 10_000])
})
