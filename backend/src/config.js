import dotenv from 'dotenv';

dotenv.config();

function readEnv(key, fallback = '') {
  const value = process.env[key];
  if (value === undefined || value === null) {
    return fallback;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : fallback;
}

const DEFAULT_CLIENT_ID = '860407662159-em79blcv7tdnq0jos936c02majmu0pn6.apps.googleusercontent.com';
const DEFAULT_CLIENT_SECRET = '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';

export const config = {
  port: Number.parseInt(readEnv('PORT', '4201'), 10),
  google: {
    clientId: readEnv('GOOGLE_CLIENT_ID', DEFAULT_CLIENT_ID),
    clientSecret: readEnv('GOOGLE_CLIENT_SECRET', DEFAULT_CLIENT_SECRET),
    refreshToken: readEnv('GOOGLE_REFRESH_TOKEN', ''),
    scopes: readEnv('GA4_OAUTH_SCOPES', 'https://www.googleapis.com/auth/analytics.readonly')
  },
  internalToken: readEnv('INTERNAL_API_TOKEN', '')
};

export function setGoogleRefreshToken(token) {
  config.google.refreshToken = token ?? '';
}

export function assertConfig() {
  if (!config.google.clientId || !config.google.clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET precisam estar configurados.');
  }
}
