# Guia de criacao do GPT GA4

## Dados reais
- **Base URL**: https://agente-ga4-api-860407662159.us-central1.run.app
- **Token interno**: ga4-internal-token (header x-internal-token).
- **Projeto GCP**: gmail-credentials-474123
- **OpenAPI**: openapi/ga4.openapi.json

## 1. Preparacao
1. Verifique o projeto do gcloud: gcloud config set project gmail-credentials-474123.
2. Tenha o arquivo openapi/ga4.openapi.json pronto para upload.
3. Se precisar renovar o refresh token, siga o passo do OAuth Playground descrito em documentação/DEPLOY.md e atualize o Cloud Run.

## 2. Criar o GPT
1. Acesse https://chat.openai.com/gpts/new.
2. Nome sugerido: **GA4 Analytics Agent**.
3. Descricao: “Consulta propriedades e relatórios GA4 via API interna do Gmail Credentials”.
4. Aba **Instructions** → cole:
   `
   - Sempre use findGa4Properties antes de runGa4Report.
   - Use getGa4Metadata quando o usuario tiver duvidas sobre dimensoes/metricas.
   - Confirme o corpo final com o usuario antes de executar runGa4Report.
   - Resuma em secoes: Propriedade / Metricas principais / Observacoes.
   `
5. Aba **Knowledge** → carregue openapi/ga4.openapi.json.
6. Aba **Actions**:
   1. Clique em **Import** e selecione o mesmo arquivo OpenAPI.
   2. Preencha os campos:
      - **Base URL**: https://agente-ga4-api-860407662159.us-central1.run.app
      - **Auth Type**: Header
      - **Header Name**: x-internal-token
      - **Header Value**: ga4-internal-token (ou {{secrets.ga4_token}} se usar secrets)
   3. Salve e confirme que aparecem três endpoints: indGa4Properties, getGa4Metadata, unGa4Report.
7. Opcional: adicione ice breakers como “Quer ver o relatório GA4 de qual cliente hoje?”.

## 3. Secrets (opcional)
- Em **Secrets**, crie ga4_token com valor ga4-internal-token e referencie {{secrets.ga4_token}} na Action.
- Nunca salve client secret ou refresh token no GPT; ficam apenas no backend/Cloud Run.

## 4. Testes obrigatorios
1. Confirme o backend (terminal):
   `ash
   curl -H "x-internal-token: ga4-internal-token" \
        "https://agente-ga4-api-860407662159.us-central1.run.app/ga4/properties?name=Hannover&account=accounts/175492763"
   `
   - Deve retornar ok: true com as propriedades da Hannover.
2. No GPT (modo Test): “Quero um relatório de sessões e usuários dos últimos 7 dias da Loja Hannover”.
   - Verifique no painel que o LLM chamou indGa4Properties e depois unGa4Report, e que a resposta traz dimensionHeaders, metricHeaders, ows e resumo.

## 5. Publicacao
- Após validar, clique em **Publish**.
- Documente alterações futuras em AGENTE GA4/documentação/README.md.
