# Guia de criacao do GPT GA4

## Dados reais
- **Base URL**: https://agente-ga4-api-860407662159.us-central1.run.app
- **Token interno**: ga4-internal-token (header x-internal-token).
- **Projeto GCP**: gmail-credentials-474123
- **OpenAPI**: openapi/ga4.openapi.json

## 1. Preparacao
1. Confirme que o Cloud Run esta ativo (gcloud run services describe agente-ga4-api --region us-central1).
2. Tenha o arquivo openapi/ga4.openapi.json atualizado.
3. Caso precise gerar um novo refresh token, utilize o OAuth Playground conforme DEPLOY.md e atualize a variavel GOOGLE_REFRESH_TOKEN no Cloud Run (gcloud run services update agente-ga4-api --region us-central1 --set-env-vars GOOGLE_REFRESH_TOKEN='...).

## 2. Criar o GPT no Builder
1. Acesse https://chat.openai.com/gpts/new.
2. **Nome**: "GA4 Analytics Agent".
3. **Descricao**: "Consulta propriedades e relatórios GA4 via API interna do Gmail Credentials".
4. Em **Instructions**, inclua:
   `
   - Sempre use findGa4Properties para descobrir o propertyId antes de qualquer relatorio.
   - Valide dimensoes/metricas com getGa4Metadata quando necessario.
   - Confirme com o usuario o corpo final antes de executar runGa4Report.
   - Estruture a resposta em secoes (Propriedade, Metricas principais, Observacoes).
   `
5. **Knowledge**: envie openapi/ga4.openapi.json.
6. **Actions**:
   - Importar o mesmo arquivo.
   - Base URL: https://agente-ga4-api-860407662159.us-central1.run.app
   - Header padrao: x-internal-token: ga4-internal-token (ou {{secrets.ga4_token}}).
   - Salve e confirme que indGa4Properties, getGa4Metadata, unGa4Report aparecem.
7. Opcional: adicione ice-breakers como "Quer ver o relatorio GA4 de qual cliente hoje?".

## 3. Secrets (opcional)
- Em **Secrets**, cadastre ga4_token com valor ga4-internal-token e use {{secrets.ga4_token}} nas acoes.
- Nao exponha client secret ou refresh token ao GPT.

## 4. Testes obrigatorios
1. Teste manual da API:
   `ash
   curl -H "x-internal-token: ga4-internal-token" \
        "https://agente-ga4-api-860407662159.us-central1.run.app/ga4/properties?name=teste"
   `
   - Resposta deve conter "ok": true. Se ocorrer 401, gere novo refresh token conforme DEPLOY.md.
2. No GPT (modo Test), pergunte: "Quero um relatorio de sessoes e usuarios dos ultimos 7 dias da Loja X".
   - Verifique o log/visor de acoes para garantir que indGa4Properties foi chamado antes de unGa4Report e que o retorno inclui dimensionHeaders, metricHeaders, ows e resumo textual.

## 5. Publicacao
- Clique em **Publish** apos validar.
- Documente quaisquer alteracoes futuras em AGENTE GA4/documentacao/README.md.
