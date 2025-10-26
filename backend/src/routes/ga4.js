import express from 'express';
import { fetchGa4Properties } from '../services/ga4AdminService.js';
import { fetchGa4Metadata, runGa4Report } from '../services/ga4AnalyticsService.js';
import { config } from '../config.js';

const router = express.Router();

function ensureInternalToken(req, res) {
  if (!config.internalToken) {
    return true;
  }

  const provided = req.headers['x-internal-token'];
  if (typeof provided === 'string' && provided.trim() === config.internalToken) {
    return true;
  }

  res.status(401).json({
    ok: false,
    error: {
      message: 'Token interno invalido ou ausente.'
    }
  });
  return false;
}

router.use(express.json({ limit: '1mb' }));

router.get('/properties', async (req, res) => {
  try {
    const result = await fetchGa4Properties({
      name: req.query.name,
      account: req.query.account,
      pageSize: req.query.pageSize,
      pageToken: req.query.pageToken
    });
    res.json(result);
  } catch (error) {
    res.status(error.status ?? 500).json({
      ok: false,
      error: {
        message: error.message,
        details: error.details ?? null
      }
    });
  }
});

router.get('/properties/:propertyId/metadata', async (req, res) => {
  try {
    if (!ensureInternalToken(req, res)) return;
    const data = await fetchGa4Metadata(req.params.propertyId, {
      languageCode: req.query.languageCode
    });
    res.json({ ok: true, data });
  } catch (error) {
    res.status(error.status ?? 500).json({
      ok: false,
      error: {
        message: error.message,
        details: error.details ?? null
      }
    });
  }
});

router.post('/properties/:propertyId/runReport', async (req, res) => {
  try {
    if (!ensureInternalToken(req, res)) return;
    const data = await runGa4Report(req.params.propertyId, req.body ?? {});
    res.json({ ok: true, data });
  } catch (error) {
    res.status(error.status ?? 500).json({
      ok: false,
      error: {
        message: error.message,
        details: error.details ?? null
      }
    });
  }
});

export default router;
