import axios from 'axios';
import { getAccessToken } from './googleAuth.js';
import { buildErrorResponse } from '../utils.js';

const ANALYTICS_ADMIN_BASE = 'https://analyticsadmin.googleapis.com/v1beta';
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

function normalizeAccount(accountRaw) {
  if (!accountRaw) return null;
  const trimmed = String(accountRaw).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('accounts/')) return trimmed;
  if (/^\d+$/.test(trimmed)) return `accounts/${trimmed}`;
  const err = new Error(`Parametro account invalido: ${accountRaw}`);
  err.status = 400;
  throw err;
}

function escapeFilterValue(value) {
  return String(value).replace(/"/g, '\\"');
}

function buildFilter({ name, account }) {
  const parts = [];
  if (account) parts.push(`parent:${account}`);
  if (name) parts.push(`displayName:"${escapeFilterValue(name)}"`);
  return parts.join(' ');
}

function clampPageSize(raw) {
  if (raw === undefined || raw === null) return DEFAULT_PAGE_SIZE;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(parsed, 1), MAX_PAGE_SIZE);
}

function normalizeProperty(property = {}) {
  const name = property.name ?? null;
  const propertyId = name && name.startsWith('properties/') ? name.split('/')[1] ?? null : null;
  return {
    name,
    propertyId,
    displayName: property.displayName ?? null,
    parent: property.parent ?? null,
    currencyCode: property.currencyCode ?? null,
    timeZone: property.timeZone ?? null,
    createTime: property.createTime ?? null,
    updateTime: property.updateTime ?? null
  };
}

export async function fetchGa4Properties(options = {}) {
  const name = String(options?.name ?? '').trim();
  if (!name) {
    const err = new Error('O parametro name e obrigatorio.');
    err.status = 400;
    throw err;
  }

  const account = normalizeAccount(options?.account);
  const pageSize = clampPageSize(options?.pageSize);
  const pageToken = options?.pageToken ? String(options.pageToken).trim() || null : null;

  const { token, scope } = await getAccessToken();

  try {
    if (account) {
      const filter = `parent:${account}`;
      const params = new URLSearchParams();
      params.set('pageSize', String(pageSize));
      params.set('filter', filter);
      if (pageToken) params.set('pageToken', pageToken);

      const url = `${ANALYTICS_ADMIN_BASE}/properties?${params.toString()}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const properties = Array.isArray(response.data?.properties)
        ? response.data.properties
            .map((property) => normalizeProperty(property))
            .filter((property) =>
              property.displayName ? property.displayName.toLowerCase().includes(name.toLowerCase()) : false
            )
        : [];

      return {
        ok: true,
        properties,
        nextPageToken: response.data?.nextPageToken ?? null,
        metadata: {
          filter,
          pageSize,
          pageToken,
          tokenScopes: scope ?? null
        }
      };
    }

    const summariesResponse = await axios.get(`${ANALYTICS_ADMIN_BASE}/accountSummaries`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const summaries = Array.isArray(summariesResponse.data?.accountSummaries)
      ? summariesResponse.data.accountSummaries
      : [];

    const matched = [];

    summaries.forEach((summary) => {
      const properties = summary.propertySummaries ?? [];
      properties.forEach((property) => {
        if (!property.displayName) {
          return;
        }
        if (property.displayName.toLowerCase().includes(name.toLowerCase())) {
          matched.push({
            name: property.property,
            propertyId: property.property?.split('/')[1] ?? null,
            displayName: property.displayName,
            parent: property.parent ?? summary.account ?? null,
            currencyCode: null,
            timeZone: null,
            createTime: null,
            updateTime: null
          });
        }
      });
    });

    return {
      ok: true,
      properties: matched,
      nextPageToken: null,
      metadata: {
        source: 'accountSummaries',
        tokenScopes: scope ?? null
      }
    };
  } catch (error) {
    const normalized = buildErrorResponse(error);
    const err = new Error('Falha ao listar properties GA4.');
    err.status = normalized.status ?? 500;
    err.details = normalized;
    throw err;
  }
}
