import { runGa4PivotReport } from '../src/services/ga4AnalyticsService.js';

async function main() {
  const propertyId = 'properties/270511251';

  const response = await runGa4PivotReport(propertyId, {
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }],
    pivots: [
      {
        fieldNames: ['date'],
        limit: 7,
        orderBys: [
          {
            dimension: { dimensionName: 'date' },
            desc: true
          }
        ]
      }
    ],
    dateRanges: [{ startDate: '2025-10-01', endDate: '2025-10-24' }]
  });

  console.log(JSON.stringify(response, null, 2));
}

main().catch((error) => {
  console.error('Erro:', error.status, error.message);
  console.error('Detalhes:', error.details ?? error);
  process.exitCode = 1;
});
