#!/usr/bin/env bash
set -euo pipefail
PROJECT=$(gcloud config get-value project 2>/dev/null)
EXPECTED="gmail-credentials-474123"
if [[ "$PROJECT" != "$EXPECTED" ]]; then
  echo "[GA4] Projeto ativo ($PROJECT) diferente do esperado ($EXPECTED). Execute 'gcloud config set project $EXPECTED' e tente novamente." >&2
  exit 1
fi

echo "[GA4] Buildando imagem para projeto $PROJECT"
gcloud builds submit --pack image=gcr.io/$PROJECT/agente-ga4-api

echo "[GA4] Fazendo deploy no Cloud Run"
gcloud run deploy agente-ga4-api \
  --region us-central1 \
  --image gcr.io/$PROJECT/agente-ga4-api \
  --allow-unauthenticated \
  --update-env-vars GOOGLE_CLIENT_ID=860407662159-em79blcv7tdnq0jos936c02majmu0pn6.apps.googleusercontent.com,GOOGLE_CLIENT_SECRET=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,GA4_OAUTH_SCOPES=https://www.googleapis.com/auth/analytics.readonly,INTERNAL_API_TOKEN=ga4-internal-token,GOOGLE_REFRESH_TOKEN=1//04ato9Jax1hp1CgYIARAAGAQSNwF-L9IrsGfS9xuF7hXFPbXuQhqAOf60fLMLt-etlLI5GsNgKIizZIgVj0nfDyiB4aNH7Timafo
