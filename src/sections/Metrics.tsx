import { lastEventOf, type LiveState } from '../data/live'
import { formatNumber } from '../format'

export function Metrics({ live }: { live: LiveState }) {
  if (!live.items.metrics) return <p className="empty">Aguardando o snapshot do servidor…</p>

  return (
    <dl className="metrics">
      {Object.values(live.items.metrics).map((metric) => (
        <div key={metric.key}>
          <dt>{metric.label}</dt>
          {/* key = id do evento: reinicia a animação a cada mudança */}
          <dd key={lastEventOf(live, 'metrics', metric.key)?.id} className="tick">
            {formatNumber(metric.value, Number(metric.value) >= 1000 ? 0 : 2)}
            <small>{metric.unit}</small>
          </dd>
        </div>
      ))}
    </dl>
  )
}
