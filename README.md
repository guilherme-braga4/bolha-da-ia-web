# bolha-da-ia-web

Frontend em tempo real do bolhadaia.com.br. Vite + React + TypeScript, sem biblioteca de componentes.

Hoje mostra a primeira seção: preços por produto x loja, vindos do backend
[`realtime-notifications-api`](https://github.com/guilherme-braga4/realtime-notifications-api) por WebSocket.

## Como rodar

1. Backend (em `../realtime-notifications-api`):

   ```bash
   docker compose up -d --wait
   npm run start:dev      # API e WebSocket na porta 3000
   npm run simulate       # em outro terminal: gera as mudanças de preço
   ```

2. Este app:

   ```bash
   npm install
   npm run dev            # http://localhost:5173
   ```

O endereço do WebSocket vem de `VITE_WS_URL` (padrão `ws://localhost:3000/ws`). Para mudar, crie um `.env.local`:

```
VITE_WS_URL=ws://outro-host:3000/ws
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — checagem de tipos + build de produção
- `npm run lint` — oxlint
- `npm test` — testes (vitest) da camada de dados

## Estrutura

```
src/data/liveStream.ts   conexão WebSocket genérica, com reconexão e backoff (500 ms → 10 s)
src/data/prices.ts       estado dos preços: função pura (estado, mensagem) → estado
src/data/usePrices.ts    liga os dois ao React
src/sections/            componentes de tela de cada seção
src/App.tsx              página: topo, números e seções
src/index.css            todo o visual (tema claro/escuro, responsivo)
```

O fluxo é sempre "snapshot + eventos em ordem": o snapshot repõe o estado (inclusive ao reconectar) e
eventos com `id` menor ou igual ao `lastEventId` são ignorados (ids comparados como `BigInt`).
Uma seção nova segue o mesmo molde: um arquivo de estado em `src/data/` e um componente em `src/sections/`.
