import axios from 'axios';
import { config, setGoogleRefreshToken } from '../config.js';
import { saveTokens } from '../tokenStore.js';

const DEVICE_CODE_URL = 'https://oauth2.googleapis.com/device/code';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printDeviceInstructions(data) {
  const message = [
    '\n[GA4] Nenhum refresh_token encontrado. Siga as instrucoes abaixo para autorizar o acesso:',
    `1. Acesse: ${data.verification_url}`,
    `2. Informe o codigo: ${data.user_code}`,
    '3. Conceda permissao para o escopo analytics.readonly.',
    ''
  ].join('\n');
  console.log(message);
}

export async function runDeviceAuthorizationFlow() {
  const params = new URLSearchParams({
    client_id: config.google.clientId,
    client_secret: config.google.clientSecret,
    scope: config.google.scopes
  });

  const deviceResponse = await axios.post(DEVICE_CODE_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const {
    device_code: deviceCode,
    user_code: userCode,
    verification_url: verificationUrl,
    expires_in: expiresIn,
    interval
  } = deviceResponse.data;

  printDeviceInstructions({ user_code: userCode, verification_url: verificationUrl });

  const pollInterval = Math.max(Number(interval ?? 5), 5) * 1000;
  const deadline = Date.now() + Number(expiresIn ?? 300) * 1000;
  console.log('[GA4] Aguardando aprovacao. Monitore o console ate o token ser registrado.');

  while (Date.now() < deadline) {
    await sleep(pollInterval);

    try {
      const tokenResponse = await axios.post(
        TOKEN_URL,
        new URLSearchParams({
          client_id: config.google.clientId,
          client_secret: config.google.clientSecret,
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (tokenResponse.data?.refresh_token) {
        await saveTokens({
          refreshToken: tokenResponse.data.refresh_token,
          accessToken: tokenResponse.data.access_token ?? null,
          scope: tokenResponse.data.scope ?? config.google.scopes
        });
        setGoogleRefreshToken(tokenResponse.data.refresh_token);
        console.log('[GA4] Refresh token salvo em backend/tokens/ga4.json');
        return tokenResponse.data.refresh_token;
      }

      if (tokenResponse.data?.error) {
        throw new Error(tokenResponse.data.error);
      }
    } catch (error) {
      const err = error.response?.data?.error ?? error.message;
      if (err === 'authorization_pending') {
        continue;
      }
      if (err === 'slow_down') {
        await sleep(pollInterval);
        continue;
      }
      throw new Error(`Fluxo de device authorization falhou: ${err}`);
    }
  }

  throw new Error('Tempo esgotado para concluir a autorizacao. Tente novamente.');
}
