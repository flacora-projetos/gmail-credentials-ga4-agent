param(
  [string]$Project = "gmail-credentials-474123"
)

$active = (gcloud config get-value project) -replace '\s',''
if ($active -ne $Project) {
  Write-Error "[GA4] Projeto ativo ($active) diferente do esperado ($Project). Rode 'gcloud config set project $Project' e tente de novo."
  exit 1
}

Write-Host "[GA4] Buildando imagem para projeto $Project"
gcloud builds submit --pack image="gcr.io/$Project/agente-ga4-api"

Write-Host "[GA4] Deploy Cloud Run"
gcloud run deploy agente-ga4-api `
  --region us-central1 `
  --image "gcr.io/$Project/agente-ga4-api" `
  --allow-unauthenticated `
  --update-env-vars "GOOGLE_CLIENT_ID=860407662159-em79blcv7tdnq0jos936c02majmu0pn6.apps.googleusercontent.com,GOOGLE_CLIENT_SECRET=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,GA4_OAUTH_SCOPES=https://www.googleapis.com/auth/analytics.readonly,INTERNAL_API_TOKEN=ga4-internal-token,GOOGLE_REFRESH_TOKEN=1//04ato9Jax1hp1CgYIARAAGAQSNwF-L9IrsGfS9xuF7hXFPbXuQhqAOf60fLMLt-etlLI5GsNgKIizZIgVj0nfDyiB4aNH7Timafo"
