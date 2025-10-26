import axios from "axios";

const baseUrl = "https://agente-ga4-api-860407662159.us-central1.run.app";
const headers = { "x-internal-token": "ga4-internal-token" };

async function main() {
  const props = await axios.get(`${baseUrl}/ga4/properties`, {
    headers,
    params: { name: 'Hannover', account: 'accounts/175492763' }
  });
  console.log('Properties:', JSON.stringify(props.data, null, 2));

  const report = await axios.post(
    `${baseUrl}/ga4/properties/398907411/runReport`,
    {
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }],
      dateRanges: [{ startDate: '2025-10-01', endDate: '2025-10-24' }],
      limit: 10
    },
    { headers }
  );
  console.log('Report:', JSON.stringify(report.data, null, 2));
}

main().catch((err) => {
  console.error('Erro:', err.response?.data ?? err.message);
  process.exitCode = 1;
});
