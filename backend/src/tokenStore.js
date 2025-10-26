import fs from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = join(__dirname, '..', 'tokens');
const TOKENS_FILE = join(TOKENS_DIR, 'ga4.json');

async function ensureDir() {
  await fs.mkdir(TOKENS_DIR, { recursive: true });
}

export async function getStoredTokens() {
  try {
    const raw = await fs.readFile(TOKENS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export async function getStoredRefreshToken() {
  const tokens = await getStoredTokens();
  return tokens?.refreshToken ?? null;
}

export async function saveTokens(tokens) {
  if (!tokens || typeof tokens !== 'object') {
    return;
  }
  await ensureDir();
  const payload = {
    ...tokens,
    savedAt: new Date().toISOString()
  };
  await fs.writeFile(TOKENS_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

export { TOKENS_FILE };
