import type { ReactNode } from 'react'
import { useLive } from './data/useLive'
import { formatNumber } from './format'
import { ChangeFeed } from './sections/ChangeFeed'
import { Metrics } from './sections/Metrics'
import { NewsList } from './sections/NewsList'
import { PriceTable } from './sections/PriceTable'
import { Stocks } from './sections/Stocks'

const statusLabel = { connecting: 'Conectando', open: 'Ao vivo', reconnecting: 'Reconectando' }

function toggleTheme() {
  const root = document.documentElement
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches
  root.dataset.theme = dark ? 'light' : 'dark'
  localStorage.setItem('theme', root.dataset.theme)
}

function Panel({ title, events, children }: { title: string; events?: number; children: ReactNode }) {
  return (
    <section className="panel">
      <header>
        <h2>{title}</h2>
        {events !== undefined && <span className="count">{formatNumber(events)} eventos</span>}
      </header>
      {children}
    </section>
  )
}

export default function App() {
  const { live, status } = useLive()
  const { counts } = live
  const total = counts.prices + counts.metrics + counts.stocks + counts.news

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
            Indicadores, ações, notícias e preços chegando em tempo real.{' '}
            <strong>Fase de testes: todos os valores desta página são simulados</strong>, inclusive os das empresas
            citadas.
          </p>
          <dl className="stats">
            <div>
              <dt>Eventos recebidos</dt>
              <dd>{formatNumber(total)}</dd>
            </div>
            <div>
              <dt>Último evento</dt>
              <dd>{live.lastEventId === '0' ? '—' : `#${live.lastEventId}`}</dd>
            </div>
          </dl>
        </section>

        {/* Cada tópico do backend é um <Panel>; as linhas abaixo só definem a grade. */}
        <div className="row">
          <div className="stack">
            <Panel title="Indicadores" events={counts.metrics}>
              <Metrics live={live} />
            </Panel>
            <Panel title="Ações" events={counts.stocks}>
              <Stocks live={live} />
            </Panel>
          </div>
          <Panel title="Notícias" events={counts.news}>
            <NewsList live={live} />
          </Panel>
        </div>

        <div className="row">
          <Panel title="Preços por loja" events={counts.prices}>
            <PriceTable live={live} />
          </Panel>
          <Panel title="Últimas mudanças de preço">
            <ChangeFeed feed={live.priceFeed} />
          </Panel>
        </div>
      </main>

      <footer className="footer">bolhadaia.com.br · dados simulados</footer>
    </>
  )
}
