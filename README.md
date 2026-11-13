# bolha-da-ia-web

Frontend em tempo real do bolhadaia.com.br. Vite + React + TypeScript, sem biblioteca de componentes.

Mostra, ao vivo, os quatro tópicos do backend
[`realtime-notifications-api`](https://github.com/guilherme-braga4/realtime-notifications-api), recebidos por
WebSocket: indicadores (`metrics`), ações (`stocks`), notícias (`news`) e preços por loja (`prices`).
Enquanto não há fontes reais, todos os valores vêm do simulador do backend e são fictícios.

## Como rodar

1. Backend (em `../realtime-notifications-api`):

   ```bash
   docker compose up -d --wait
   npm run start:dev      # API e WebSocket na porta 3000
   npm run simulate       # em outro terminal: gera as mudanças (valores fictícios)
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
src/data/live.ts         estado de todos os tópicos: função pura (estado, mensagem) → estado
src/data/useLive.ts      liga os dois ao React
src/sections/            um componente de tela por seção
src/App.tsx              página: topo, números e grade das seções
src/index.css            todo o visual (tema claro/escuro, responsivo)
```

O fluxo é "snapshot + eventos em ordem", por tópico: o snapshot repõe os itens do tópico (inclusive ao
reconectar), cada evento troca ou inclui o item da sua `key`, e eventos com `id` menor ou igual ao
`lastEventId` são ignorados (ids comparados como `BigInt`). Tópicos e tipos de mensagem desconhecidos são ignorados.

Para um tópico novo: o tipo do item e o campo-chave em `src/data/live.ts`, e um componente em `src/sections/`.
