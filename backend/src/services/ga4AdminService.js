import axios from 'axios';
import { getAccessToken } from './googleAuth.js';
import { buildErrorResponse } from '../utils.js';

const ANALYTICS_ADMIN_BASE = 'https://analyticsadmin.googleapis.com/v1beta';

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
  const { token, scope } = await getAccessToken();

  try {
    const summariesResponse = await axios.get(`${ANALYTICS_ADMIN_BASE}/accountSummaries`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const summaries = Array.isArray(summariesResponse.data?.accountSummaries)
      ? summariesResponse.data.accountSummaries
      : [];

    const matched = [];

    summaries.forEach((summary) => {
      if (account && summary.account !== account) {
        return;
      }
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
        tokenScopes: scope ?? null,
        filteredAccount: account ?? null
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
