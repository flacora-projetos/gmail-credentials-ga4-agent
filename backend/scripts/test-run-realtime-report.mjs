import { runGa4RealtimeReport } from '../src/services/ga4AnalyticsService.js';

async function main() {
  const propertyId = 'properties/270511251';

  const response = await runGa4RealtimeReport(propertyId, {
    dimensions: [{ name: 'country' }],
    metrics: [{ name: 'activeUsers' }],
    limit: 10
  });

  console.log(JSON.stringify(response, null, 2));
}

main().catch((error) => {
  console.error('Erro:', error.status, error.message);
  console.error('Detalhes:', error.details ?? error);
  process.exitCode = 1;
});
