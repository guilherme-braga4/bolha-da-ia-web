import { lastEventOf, type LiveState } from '../data/live'
import { formatDelta, formatNumber } from '../format'

export function Stocks({ live }: { live: LiveState }) {
  if (!live.items.stocks) return <p className="empty">Aguardando o snapshot do servidor…</p>

  return (
    <ul className="stocks">
      {Object.values(live.items.stocks).map((stock) => {
        const event = lastEventOf(live, 'stocks', stock.symbol)
        const before = event?.previous?.price
        const tick = before ? (Number(stock.price) >= Number(before) ? 'good' : 'bad') : ''
        const day = Number(stock.price) >= Number(stock.previousClose) ? 'good' : 'bad'
        return (
          // key = id do evento: reinicia a animação a cada mudança
          <li key={`${stock.symbol}/${event?.id}`} className={`cell ${tick}`}>
            <strong>{stock.symbol}</strong>
            <span className="stock-name">{stock.name}</span>
            <span className="price">{formatNumber(stock.price, 2)}</span>
            <span className={`delta ${day}`}>
              {day === 'good' ? '▲' : '▼'} {formatDelta(stock.previousClose, stock.price)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
