import { isDrop, type PricesState } from '../data/prices'
import { formatDelta, formatPrice } from '../format'

export function PriceTable({ prices }: { prices: PricesState }) {
  const stores = [...new Set(prices.products.map((p) => p.store))].sort()
  const names = [...new Set(prices.products.map((p) => p.name))].sort()

  if (!prices.ready) return <p className="empty">Aguardando o snapshot do servidor…</p>

  return (
    <table className="prices">
      <thead>
        <tr>
          <th scope="col">Produto</th>
          {stores.map((store) => (
            <th key={store} scope="col">
              {store}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {names.map((name) => {
          const row = prices.products.filter((p) => p.name === name)
          const lowest = Math.min(...row.map((p) => Number(p.price)))
          return (
            <tr key={name}>
              <th scope="row">{name}</th>
              {stores.map((store) => {
                const product = row.find((p) => p.store === store)
                if (!product) return <td key={store} data-store={store} />
                const change = prices.lastChange[product.id]
                const direction = change ? (isDrop(change) ? 'drop' : 'rise') : ''
                return (
                  <td key={store} data-store={store}>
                    {/* key = id do evento: remonta e reinicia a animação a cada mudança */}
                    <div
                      key={change?.id}
                      className={`cell ${direction} ${Number(product.price) === lowest ? 'lowest' : ''}`}
                    >
                      <span className="price">{formatPrice(product.price)}</span>
                      <span className="delta">
                        {change
                          ? `${direction === 'drop' ? '▼' : '▲'} ${formatDelta(change.oldPrice, change.newPrice)}`
                          : ' '}
                      </span>
                    </div>
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
