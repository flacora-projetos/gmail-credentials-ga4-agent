# AGENTE GA4

Projeto independente para alimentar um agente GPT com dados do Google Analytics 4.

## Status atual
- **Projeto GCP**: `gmail-credentials-474123` (billing ativo).
- **Cloud Run**: serviço `agente-ga4-api` rodando em `us-central1`.
- **URL**: https://agente-ga4-api-860407662159.us-central1.run.app
- **Token interno**: `ga4-internal-token` (enviar no header `x-internal-token`).

## Estrutura
- `backend/`: API Express que gera automaticamente o refresh token via OAuth Device Flow.
  - Scripts úteis:
    - `npm run dev` — ambiente local.
    - `npm run device-flow` — dispara o Device Flow localmente (usa `GOOGLE_CLIENT_ID/SECRET`).
- `openapi/ga4.openapi.json`: spec usada pelo GPT.
- `documentação/`: guias (Deploy, GPT_SETUP, Credenciais).

## Como gerar o refresh token pela primeira vez
1. Opcionalmente, rode localmente: `cd "AGENTE GA4/backend" && npm run device-flow`.
2. Siga o link e informe o código exibido no console.
3. O token é salvo em `backend/tokens/ga4.json`. Adicione o valor em `GOOGLE_REFRESH_TOKEN` se quiser fixá-lo no Cloud Run.
4. Em produção, basta fazer uma chamada (ex.: `curl -H "x-internal-token: ga4-internal-token" "https://agente-ga4-api-860407662159.us-central1.run.app/ga4/properties?name=teste"`) e copiar link/código do log do Cloud Run.

## Rotas disponíveis
| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/ga4/properties` | Busca propriedades GA4 pelo `displayName` e/ou `account`. |
| GET | `/ga4/properties/:propertyId/metadata` | Lista dimensões e métricas disponíveis. |
| POST | `/ga4/properties/:propertyId/runReport` | Executa relatórios personalizados. |

Veja `documentação/GPT_SETUP.md` para configurar o agente GPT com esses endpoints.
