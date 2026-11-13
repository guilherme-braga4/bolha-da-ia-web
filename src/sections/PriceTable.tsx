import { lastEventOf, type LiveState } from '../data/live'
import { formatDelta, formatPrice } from '../format'

export function PriceTable({ live }: { live: LiveState }) {
  if (!live.items.prices) return <p className="empty">Aguardando o snapshot do servidor…</p>

  const products = Object.values(live.items.prices)
  const stores = [...new Set(products.map((p) => p.store))].sort()
  const names = [...new Set(products.map((p) => p.name))].sort()

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
          const row = products.filter((p) => p.name === name)
          const lowest = Math.min(...row.map((p) => Number(p.price)))
          return (
            <tr key={name}>
              <th scope="row">{name}</th>
              {stores.map((store) => {
                const product = row.find((p) => p.store === store)
                if (!product) return <td key={store} data-store={store} />
                const event = lastEventOf(live, 'prices', product.id)
                const before = event?.previous?.price
                // preço caindo é bom para quem compra
                const tone = before ? (Number(product.price) < Number(before) ? 'good' : 'bad') : ''
                return (
                  <td key={store} data-store={store}>
                    {/* key = id do evento: remonta e reinicia a animação a cada mudança */}
                    <div
                      key={event?.id}
                      className={`cell ${tone} ${Number(product.price) === lowest ? 'lowest' : ''}`}
                    >
                      <span className="price">{formatPrice(product.price)}</span>
                      <span className="delta">
                        {before ? `${tone === 'good' ? '▼' : '▲'} ${formatDelta(before, product.price)}` : ' '}
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
