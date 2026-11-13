import type { LiveEvent } from '../data/live'
import { formatDelta, formatPrice, formatTime } from '../format'

export function ChangeFeed({ feed }: { feed: LiveEvent<'prices'>[] }) {
  if (feed.length === 0) return <p className="empty">Nenhuma mudança recebida ainda.</p>

  return (
    <ol className="feed">
      {feed.map(({ id, item, previous, at }) => {
        const drop = previous !== null && Number(item.price) < Number(previous.price)
        return (
          <li key={id} className={drop ? 'good' : 'bad'}>
            <span className="feed-mark">{drop ? '▼' : '▲'}</span>
            <div className="feed-body">
              <strong>{item.name}</strong>
              <span className="feed-meta">
                {item.store} · {formatTime(at)}
              </span>
            </div>
            <div className="feed-price">
              <span className="price">{formatPrice(item.price)}</span>
              <span className="delta">{previous ? formatDelta(previous.price, item.price) : 'novo'}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
