import { checkGa4Compatibility } from '../src/services/ga4AnalyticsService.js';

async function main() {
  const propertyId = 'properties/270511251';

  const response = await checkGa4Compatibility(propertyId, {
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }]
  });

  console.log(JSON.stringify(response, null, 2));
}

main().catch((error) => {
  console.error('Erro:', error.status, error.message);
  console.error('Detalhes:', error.details ?? error);
  process.exitCode = 1;
});
