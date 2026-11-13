import { usePrices } from './data/usePrices'
import { ChangeFeed } from './sections/ChangeFeed'
import { PriceTable } from './sections/PriceTable'

const statusLabel = { connecting: 'Conectando', open: 'Ao vivo', reconnecting: 'Reconectando' }

function toggleTheme() {
  const root = document.documentElement
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches
  root.dataset.theme = dark ? 'light' : 'dark'
  localStorage.setItem('theme', root.dataset.theme)
}

export default function App() {
  const { prices, status } = usePrices()
  const { counts } = prices
  const count = new Intl.NumberFormat('pt-BR')

  return (
    <>
      <header className="topbar">
        <a className="brand" href="/">
          <span className="bubble" aria-hidden="true" />
          bolha da IA
        </a>
        <div className="topbar-right">
          <span className={`status ${status}`} role="status">
            <span className="dot" aria-hidden="true" />
            {statusLabel[status]}
          </span>
          <button className="theme" onClick={toggleTheme} aria-label="Alternar tema claro/escuro">
            ◐
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <h1>
            Tudo o que infla, <em>ao vivo</em>.
          </h1>
          <p>
            Painel em tempo real. A primeira seção no ar acompanha preços por loja, alimentada por um simulador de
            Black Friday enquanto os dados da bolha não chegam.
          </p>
          <dl className="stats">
            <div>
              <dt>Eventos recebidos</dt>
              <dd>{count.format(counts.total)}</dd>
            </div>
            <div className="drop">
              <dt>Quedas</dt>
              <dd>▼ {count.format(counts.drops)}</dd>
            </div>
            <div className="rise">
              <dt>Altas</dt>
              <dd>▲ {count.format(counts.rises)}</dd>
            </div>
            <div>
              <dt>Último evento</dt>
              <dd>{prices.ready ? `#${prices.lastEventId}` : '—'}</dd>
            </div>
          </dl>
        </section>

        {/* Cada seção do site entra aqui como mais um <section>. */}
        <section className="live">
          <div className="panel">
            <header>
              <h2>Preços por loja</h2>
              <span className="legend">
                <span className="lowest-chip">menor preço</span>
              </span>
            </header>
            <PriceTable prices={prices} />
          </div>
          <aside className="panel">
            <header>
              <h2>Últimas mudanças</h2>
            </header>
            <ChangeFeed feed={prices.feed} />
          </aside>
        </section>
      </main>

      <footer className="footer">bolhadaia.com.br · dados de demonstração</footer>
    </>
  )
}
