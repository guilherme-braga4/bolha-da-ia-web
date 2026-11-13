import { isDrop, type PriceChange } from '../data/prices'
import { formatDelta, formatPrice, formatTime } from '../format'

export function ChangeFeed({ feed }: { feed: PriceChange[] }) {
  if (feed.length === 0) return <p className="empty">Nenhuma mudança recebida ainda.</p>

  return (
    <ol className="feed">
      {feed.map((change) => {
        const direction = isDrop(change) ? 'drop' : 'rise'
        return (
          <li key={change.id} className={direction}>
            <span className="feed-mark">{direction === 'drop' ? '▼' : '▲'}</span>
            <div className="feed-body">
              <strong>{change.name}</strong>
              <span className="feed-meta">
                {change.store} · {formatTime(change.changedAt)}
              </span>
            </div>
            <div className="feed-price">
              <span className="price">{formatPrice(change.newPrice)}</span>
              <span className="delta">{formatDelta(change.oldPrice, change.newPrice)}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
