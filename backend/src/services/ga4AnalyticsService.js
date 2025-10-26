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

  async function requestMetadata(useLanguage = true) {
    const urlParams = new URLSearchParams();
    if (useLanguage && params.languageCode) {
      urlParams.set('languageCode', String(params.languageCode).trim());
    }
    const url = `${ANALYTICS_DATA_BASE}/${normalizedPropertyId}/metadata${urlParams.size ? `?${urlParams.toString()}` : ''}`;

    return axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  try {
    const response = await requestMetadata(true);
    return applyMetadataFilters({ ...response.data }, params);
  } catch (error) {
    const responseMessage = error.response?.data?.error?.message ?? '';
    const invalidLanguage =
      error.response?.status === 400 &&
      typeof responseMessage === 'string' &&
      responseMessage.includes('languageCode');

    if (invalidLanguage && params.languageCode) {
      try {
        const fallback = await requestMetadata(false);
        return applyMetadataFilters({ ...fallback.data }, params);
      } catch (fallbackError) {
        const normalized = buildErrorResponse(fallbackError);
        const err = new Error('Falha ao obter metadados GA4.');
        err.status = normalized.status ?? 500;
        err.details = normalized;
        throw err;
      }
    }

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

function buildAnalyticsRequestUrl(propertyId, suffix) {
  const normalizedPropertyId = normalizePropertyId(propertyId);
  return `${ANALYTICS_DATA_BASE}/${normalizedPropertyId}:${suffix}`;
}

async function postAnalyticsRequest(url, payload) {
  const { token } = await getAccessToken();
  try {
    const response = await axios.post(url, payload ?? {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    const normalized = buildErrorResponse(error);
    const err = new Error('Falha ao executar consulta GA4.');
    err.status = normalized.status ?? 500;
    err.details = normalized;
    throw err;
  }
}

export async function runGa4PivotReport(propertyId, payload) {
  const url = buildAnalyticsRequestUrl(propertyId, 'runPivotReport');
  return postAnalyticsRequest(url, payload);
}

export async function batchRunGa4Reports(propertyId, payload) {
  const url = buildAnalyticsRequestUrl(propertyId, 'batchRunReports');
  return postAnalyticsRequest(url, payload);
}

export async function batchRunGa4PivotReports(propertyId, payload) {
  const url = buildAnalyticsRequestUrl(propertyId, 'batchRunPivotReports');
  return postAnalyticsRequest(url, payload);
}

export async function runGa4RealtimeReport(propertyId, payload) {
  const url = buildAnalyticsRequestUrl(propertyId, 'runRealtimeReport');
  const safePayload = { ...(payload ?? {}) };

  if (!Array.isArray(safePayload.dimensions) || safePayload.dimensions.length === 0) {
    safePayload.dimensions = [{ name: 'country' }];
  }
  if (!Array.isArray(safePayload.metrics) || safePayload.metrics.length === 0) {
    safePayload.metrics = [{ name: 'activeUsers' }];
  }

  return postAnalyticsRequest(url, safePayload);
}

export async function checkGa4Compatibility(propertyId, payload) {
  const url = buildAnalyticsRequestUrl(propertyId, 'checkCompatibility');
  const safePayload = payload ?? {};

  if (!Array.isArray(safePayload.dimensions) || safePayload.dimensions.length === 0) {
    const err = new Error('Informe pelo menos uma dimensao na requisição.');
    err.status = 400;
    err.details = {
      expected: {
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }]
      }
    };
    throw err;
  }

  if (!Array.isArray(safePayload.metrics) || safePayload.metrics.length === 0) {
    const err = new Error('Informe pelo menos uma metrica na requisição.');
    err.status = 400;
    err.details = {
      expected: {
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }]
      }
    };
    throw err;
  }

  return postAnalyticsRequest(url, safePayload);
}

function applyMetadataFilters(metadata, params) {
  const searchTerm = typeof params.search === 'string' ? params.search.trim().toLowerCase() : '';
  const includeDimensions = normalizeNameList(params.includeDimensions);
  const includeMetrics = normalizeNameList(params.includeMetrics);
  const maxDimensions = toPositiveInt(params.maxDimensions, params.maxItems);
  const maxMetrics = toPositiveInt(params.maxMetrics, params.maxItems);

  if (Array.isArray(metadata.dimensions)) {
    let dims = metadata.dimensions;
    if (searchTerm) {
      dims = dims.filter((item) => matchesSearch(item, searchTerm));
    }
    if (includeDimensions.size) {
      dims = dims.filter((item) => includeDimensions.has((item.apiName ?? '').toLowerCase()));
    }
    metadata.dimensions = dims.slice(0, maxDimensions ?? dims.length);
  }

  if (Array.isArray(metadata.metrics)) {
    let mets = metadata.metrics;
    if (searchTerm) {
      mets = mets.filter((item) => matchesSearch(item, searchTerm));
    }
    if (includeMetrics.size) {
      mets = mets.filter((item) => includeMetrics.has((item.apiName ?? '').toLowerCase()));
    }
    metadata.metrics = mets.slice(0, maxMetrics ?? mets.length);
  }

  return metadata;
}

function matchesSearch(item, term) {
  return [item.apiName, item.uiName, item.description]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(term));
}

function normalizeNameList(value) {
  if (!value) return new Set();
  if (Array.isArray(value)) {
    return new Set(
      value
        .map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : ''))
        .filter(Boolean)
    );
  }
  if (typeof value === 'string') {
    return new Set(
      value
        .split(',')
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean)
    );
  }
  return new Set();
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value ?? fallback ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
