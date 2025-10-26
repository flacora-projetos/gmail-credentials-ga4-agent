import axios from 'axios';
import { getAccessToken } from './googleAuth.js';
import { buildErrorResponse } from '../utils.js';

const ANALYTICS_DATA_BASE = 'https://analyticsdata.googleapis.com/v1beta';

function normalizePropertyId(propertyIdRaw) {
  const trimmed = String(propertyIdRaw ?? '').trim();
  if (!trimmed) {
    const err = new Error('propertyId obrigatorio.');
    err.status = 400;
    throw err;
  }
  if (trimmed.startsWith('properties/')) {
    return trimmed;
  }
  if (/^\d+$/.test(trimmed)) {
    return `properties/${trimmed}`;
  }
  const err = new Error(`propertyId invalido: ${propertyIdRaw}`);
  err.status = 400;
  throw err;
}

export async function fetchGa4Metadata(propertyId, params = {}) {
  const normalizedPropertyId = normalizePropertyId(propertyId);
  const { token } = await getAccessToken();

  const urlParams = new URLSearchParams();
  if (params.languageCode) {
    urlParams.set('languageCode', String(params.languageCode).trim());
  }

  const url = `${ANALYTICS_DATA_BASE}/${normalizedPropertyId}/metadata${urlParams.size ? `?${urlParams.toString()}` : ''}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    const normalized = buildErrorResponse(error);
    const err = new Error('Falha ao obter metadados GA4.');
    err.status = normalized.status ?? 500;
    err.details = normalized;
    throw err;
  }
}

export async function runGa4Report(propertyId, payload) {
  const normalizedPropertyId = normalizePropertyId(propertyId);
  const { token } = await getAccessToken();

  const url = `${ANALYTICS_DATA_BASE}/${normalizedPropertyId}:runReport`;

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    const normalized = buildErrorResponse(error);
    const err = new Error('Falha ao executar runReport.');
    err.status = normalized.status ?? 500;
    err.details = normalized;
    throw err;
  }
}
