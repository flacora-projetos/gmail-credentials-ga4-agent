import express from 'express';
import cors from 'cors';
import { config, assertConfig } from './config.js';
import ga4Router from './routes/ga4.js';

assertConfig();

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/ga4', ga4Router);

const port = Number.isFinite(config.port) ? config.port : 4201;
app.listen(port, () => {
  console.log(`[GA4] API ouvindo na porta ${port}`);
});
