# Documentacao do AGENTE GA4

- `CREDENCIAIS GMAIL CONSOLE GOOGLE -.txt`: client ID/secret usados no fluxo OAuth.
- `DEPLOY.md`: passo a passo para atualizar o serviço Cloud Run (`gmail-credentials-474123`).
- `GPT_SETUP.md`: instruções com dados reais (URL, token, exemplos de cURL) para configurar o GPT.

## Informações rápidas
- **URL do serviço**: https://agente-ga4-api-860407662159.us-central1.run.app
- **Token interno**: `ga4-internal-token`
- **Projeto GCP**: `gmail-credentials-474123`

Para gerar/renovar refresh token manualmente execute `npm run device-flow` na pasta `backend/` ou faça uma chamada à API e copie o link/código exibidos nos logs do Cloud Run.
