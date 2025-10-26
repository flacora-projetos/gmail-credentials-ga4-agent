import axios from "axios";

const baseUrl = "https://agente-ga4-api-860407662159.us-central1.run.app";
const headers = { "x-internal-token": "ga4-internal-token" };

async function main() {
  const props = await axios.get(`${baseUrl}/ga4/properties`, {
    headers,
    params: { name: 'Nanda', account: 'accounts/195680050' }
  });
  console.log('Properties:', JSON.stringify(props.data, null, 2));

  const baseReportBody = {
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
    dateRanges: [{ startDate: '2025-10-01', endDate: '2025-10-24' }]
  };

  const report = await axios.post(
    `${baseUrl}/ga4/properties/270511251/runReport`,
    { ...baseReportBody, limit: 10 },
    { headers }
  );
  console.log('Report:', JSON.stringify(report.data, null, 2));

  const pivot = await axios.post(
    `${baseUrl}/ga4/properties/270511251/runPivotReport`,
    {
      ...baseReportBody,
      pivots: [
        {
          fieldNames: ['date'],
          limit: 5,
          orderBys: [{ dimension: { dimensionName: 'date' }, desc: true }]
        }
      ]
    },
    { headers }
  );
  console.log('Pivot report:', JSON.stringify(pivot.data, null, 2));

  const batch = await axios.post(
    `${baseUrl}/ga4/properties/270511251/batchRunReports`,
    {
      requests: [
        { ...baseReportBody, limit: 10 },
        {
          dimensions: [{ name: 'city' }],
          metrics: [{ name: 'sessions' }],
          dateRanges: [{ startDate: '2025-10-01', endDate: '2025-10-24' }],
          limit: 3
        }
      ]
    },
    { headers }
  );
  console.log('Batch reports:', JSON.stringify(batch.data, null, 2));

  const realtime = await axios.post(
    `${baseUrl}/ga4/properties/270511251/runRealtimeReport`,
    {
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 5
    },
    { headers }
  );
  console.log('Realtime report:', JSON.stringify(realtime.data, null, 2));

  const compatibility = await axios.post(
    `${baseUrl}/ga4/properties/270511251/checkCompatibility`,
    {
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }]
    },
    { headers }
  );
  console.log('Compatibility:', JSON.stringify(compatibility.data, null, 2));
}

main().catch((err) => {
  console.error('Erro:', err.response?.data ?? err.message);
  process.exitCode = 1;
});
