import axios from 'axios';
import { config, setGoogleRefreshToken } from '../config.js';
import { buildErrorResponse } from '../utils.js';
import { getStoredRefreshToken, saveTokens } from '../tokenStore.js';
import { runDeviceAuthorizationFlow } from './googleDeviceAuth.js';

const GOOGLE_OAUTH_URL = 'https://oauth2.googleapis.com/token';

async function ensureRefreshToken() {
  if (config.google.refreshToken) {
    return config.google.refreshToken;
  }

  const stored = await getStoredRefreshToken();
  if (stored) {
    setGoogleRefreshToken(stored);
    return stored;
  }

  const generated = await runDeviceAuthorizationFlow();
  setGoogleRefreshToken(generated);
  return generated;
}

export async function getAccessToken() {
  const refreshToken = await ensureRefreshToken();

  const body = new URLSearchParams({
    client_id: config.google.clientId,
    client_secret: config.google.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    scope: config.google.scopes
  });

  try {
    const response = await axios.post(GOOGLE_OAUTH_URL, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const token = response.data?.access_token;
    if (!token) {
      throw new Error('OAuth response sem access_token');
    }

    await saveTokens({
      refreshToken,
      accessToken: token,
      scope: response.data?.scope ?? config.google.scopes,
      expiresIn: response.data?.expires_in ?? null
    });

    return {
      token,
      expiresIn: response.data?.expires_in ?? null,
      scope: response.data?.scope ?? null
    };
  } catch (error) {
    const normalized = buildErrorResponse(error);
    throw Object.assign(new Error('Falha ao obter token OAuth do Google.'), {
      status: normalized.status ?? 500,
      details: normalized
    });
  }
}
