# Documentacao do AGENTE GA4

- `CREDENCIAIS GMAIL CONSOLE GOOGLE -.txt`: client ID/secret usados no fluxo OAuth.
- `DEPLOY.md`: passo a passo para atualizar o servico Cloud Run (`gmail-credentials-474123`).
- `GPT_SETUP.md`: guia para configurar o GPT (URL, token, exemplos de cURL).
- `INSTRUCOES_GPT.md`: texto final das instrucoes que devem ser coladas na aba Instructions do GPT.
- `GA4_ACESSOS.md`: lista atual das contas e properties com acesso via refresh token.
- `POLITICA_DE_PRIVACIDADE.md`: politica de privacidade publicada para o projeto.

## Informacoes rapidas
- **URL do servico**: https://agente-ga4-api-860407662159.us-central1.run.app
- **Token interno**: `ga4-internal-token`
- **Projeto GCP**: `gmail-credentials-474123`

### Scripts uteis (backend/scripts)
- `test-fetch-properties.mjs`: lista propriedades usando o token atual.
- `test-run-report.mjs`: executa um runReport padrão.
- `test-run-pivot-report.mjs`: exemplo de runPivotReport.
- `test-batch-run-reports.mjs`: executa o endpoint batchRunReports.
- `test-batch-run-pivot-reports.mjs`: executa o endpoint batchRunPivotReports.
- `test-run-realtime-report.mjs`: consulta dados em tempo real.
- `test-check-compatibility.mjs`: valida combinações de dimensões e métricas.
- `call-cloud-run.mjs`: fluxo completo chamando os endpoints publicados no Cloud Run.

Para gerar ou renovar o refresh token manualmente, execute `npm run device-flow` na pasta `backend/` ou faca uma chamada a API e copie o link/codigo exibidos nos logs do Cloud Run.
