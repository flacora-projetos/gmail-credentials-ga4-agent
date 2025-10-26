import { runDeviceAuthorizationFlow } from '../src/services/googleDeviceAuth.js';
import { config } from '../src/config.js';
import { saveTokens } from '../src/tokenStore.js';
import { setGoogleRefreshToken } from '../src/config.js';

async function main() {
  try {
    const refresh = await runDeviceAuthorizationFlow();
    setGoogleRefreshToken(refresh);
    await saveTokens({ refreshToken: refresh, accessToken: null, scope: config.google.scopes });
    console.log('\n[GA4] Token registrado com sucesso. Atualize a variavel GOOGLE_REFRESH_TOKEN se quiser fixa-lo.');
  } catch (error) {
    console.error('[GA4] Falha ao executar device flow:', error.message);
    process.exitCode = 1;
  }
}

main();
