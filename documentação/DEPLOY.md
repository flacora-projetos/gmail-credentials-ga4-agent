# Guia de deploy (Cloud Run)

Serviço atual: **agente-ga4-api** (`gmail-credentials-474123`, região `us-central1`). URL em produção:
```
https://agente-ga4-api-860407662159.us-central1.run.app
```
Token interno exigido pelo backend: `ga4-internal-token` (header `x-internal-token`).

## Requisitos
- APIs habilitadas: `analyticsadmin.googleapis.com`, `analyticsdata.googleapis.com`, `run.googleapis.com`, `cloudbuild.googleapis.com`, `artifactregistry.googleapis.com`.
- `gcloud` configurado para o projeto correto:
  ```bash
  gcloud config set project gmail-credentials-474123
  ```

## Variáveis de ambiente
O deploy atual utiliza:
```
GOOGLE_CLIENT_ID=860407662159-em79blcv7tdnq0jos936c02majmu0pn6.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GA4_OAUTH_SCOPES=https://www.googleapis.com/auth/analytics.readonly
INTERNAL_API_TOKEN=ga4-internal-token
```
`GOOGLE_REFRESH_TOKEN` pode ser deixado em branco; o serviço inicia o Device Flow automaticamente e salva o token em `tokens/ga4.json`.

Para acionar o fluxo de autorização automaticamente:
```bash
curl -H "x-internal-token: ga4-internal-token" "https://agente-ga4-api-860407662159.us-central1.run.app/ga4/properties?name=teste"
```
Em seguida, abra os logs:
```bash
gcloud run services logs read agente-ga4-api --region us-central1 --limit 20
```
Copie `verification_url` e `user_code`, autorize a conta GA4 e aguarde pelo log `[GA4] Refresh token salvo em backend/tokens/ga4.json`.

Os clientes do tipo “Aplicativo da Web” não permitem Device Flow. Utilize o [OAuth Playground](https://developers.google.com/oauthplayground/) para gerar o refresh token:
1. Clique na engrenagem e marque **Use your own OAuth credentials**.
2. Informe:
   - Client ID: `860407662159-em79blcv7tdnq0jos936c02majmu0pn6.apps.googleusercontent.com`
   - Client secret: `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`
3. Em *Step 1*, adicione o escopo `https://www.googleapis.com/auth/analytics.readonly`, autorize e escolha a conta GA4.
4. Em *Step 2*, faça o *Exchange* e copie o `Refresh token`.
5. Execute `gcloud run services update agente-ga4-api --region us-central1 --set-env-vars GOOGLE_REFRESH_TOKEN='SEU_TOKEN'` para persistir.

## Atualizando a imagem
```
cd "AGENTE GA4/backend"
gcloud builds submit --pack image=gcr.io/gmail-credentials-474123/agente-ga4-api
```

## Deploy da imagem
```
gcloud run deploy agente-ga4-api \
  --image gcr.io/gmail-credentials-474123/agente-ga4-api \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLIENT_ID=...,GOOGLE_CLIENT_SECRET=...,GA4_OAUTH_SCOPES=https://www.googleapis.com/auth/analytics.readonly,INTERNAL_API_TOKEN=ga4-internal-token"
```

Após o deploy, confirme nos logs que o serviço iniciou (`[GA4] API ouvindo na porta 8080`) e execute a chamada de propriedades para gerar/renovar o refresh token, se necessário.
