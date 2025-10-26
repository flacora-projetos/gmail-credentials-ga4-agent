import { saveTokens } from '../src/tokenStore.js';
import { setGoogleRefreshToken } from '../src/config.js';

const refreshToken =
  '1//04ato9Jax1hp1CgYIARAAGAQSNwF-L9IrsGfS9xuF7hXFPbXuQhqAOf60fLMLt-etlLI5GsNgKIizZIgVj0nfDyiB4aNH7Timafo';

await saveTokens({
  refreshToken,
  accessToken: null,
  scope: 'https://www.googleapis.com/auth/analytics.readonly'
});
setGoogleRefreshToken(refreshToken);
console.log('Refresh token salvo localmente.');
