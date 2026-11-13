import type { LiveState } from '../data/live'
import { formatTime } from '../format'

export function NewsList({ live }: { live: LiveState }) {
  if (!live.items.news) return <p className="empty">Aguardando o snapshot do servidor…</p>

  const news = Object.values(live.items.news)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 50)
  if (news.length === 0) return <p className="empty">Nenhuma notícia ainda.</p>

  return (
    <ol className="feed news">
      {news.map((item) => (
        <li key={item.id}>
          <div className="feed-body">
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.title}
            </a>
            <span className="feed-meta">
              {item.source} · {formatTime(item.publishedAt)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}
