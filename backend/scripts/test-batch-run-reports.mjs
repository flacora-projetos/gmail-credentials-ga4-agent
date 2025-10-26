import { batchRunGa4Reports } from '../src/services/ga4AnalyticsService.js';

async function main() {
  const propertyId = 'properties/270511251';

  const response = await batchRunGa4Reports(propertyId, {
    requests: [
      {
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }],
        dateRanges: [{ startDate: '2025-10-01', endDate: '2025-10-07' }]
      },
      {
        dimensions: [{ name: 'city' }],
        metrics: [{ name: 'totalUsers' }],
        dateRanges: [{ startDate: '2025-10-01', endDate: '2025-10-24' }],
        limit: 5
      }
    ]
  });

  console.log(JSON.stringify(response, null, 2));
}

main().catch((error) => {
  console.error('Erro:', error.status, error.message);
  console.error('Detalhes:', error.details ?? error);
  process.exitCode = 1;
});
