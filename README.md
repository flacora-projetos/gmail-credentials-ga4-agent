# AGENTE GA4

Projeto independente para alimentar o GPT com dados do Google Analytics 4. **Nunca reutilize** o projeto `trae-appsaldos-473218-n7` nem o backend antigo.

## Projeto Cloud Run
- Projeto GCP: `gmail-credentials-474123`
- Serviço: `agente-ga4-api` (`us-central1`)
- URL: `https://agente-ga4-api-860407662159.us-central1.run.app`
- Token interno: `ga4-internal-token`
- Refresh token atual salvo em `GOOGLE_REFRESH_TOKEN` e em `backend/tokens/ga4.json` (não commitar).

## Repositório dedicado
Execute:
```bash
cd "AGENTE GA4"
# autentique antes: gh auth login
# então crie/publishe o repositório privado
# gh repo create gmail-credentials-ga4-agent --private --source=. --remote=origin --push
```

## Scripts importantes
- `backend/deploy-cloud-run.sh` / `backend/deploy-cloud-run.ps1`: verificam se o projeto ativo do gcloud é `gmail-credentials-474123` e executam build + deploy com as variáveis já preenchidas.
- `backend/scripts/list-account-summaries.mjs`: lista contas/propriedades GA4 disponíveis (usado para descobrir IDs).
- `backend/scripts/test-run-report.mjs` e `backend/scripts/call-cloud-run.mjs`: testes locais/Cloud Run para garantir que os endpoints estão respondendo.

## Documentação
- `documentação/DEPLOY.md`: passo a passo (com OAuth Playground) para atualizar Cloud Run.
- `documentação/GPT_SETUP.md`: preenchimento completo do GPT Builder usando o endpoint real.
- `openapi/ga4.openapi.json`: especificação atualizada com a URL pública.

## Comandos úteis
```bash
# instalar deps (no novo projeto apenas)
cd "AGENTE GA4/backend"
npm install

# testar chamadas locais
node scripts/list-account-summaries.mjs
node scripts/test-run-report.mjs

# testar Cloud Run
node scripts/call-cloud-run.mjs
```

> Atenção: sempre verifique o projeto ativo (`gcloud config list --format 'value(core.project)'`). Se for diferente de `gmail-credentials-474123`, execute `gcloud config set project gmail-credentials-474123` antes de qualquer deploy.
