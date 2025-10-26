import { runGa4Report } from '../src/services/ga4AnalyticsService.js';

async function main() {
  try {
    const result = await runGa4Report('properties/270511251', {
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      dateRanges: [{ startDate: '2025-10-01', endDate: '2025-10-24' }],
      limit: 10
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Erro:', error.status, error.message);
    console.error('Detalhes:', error.details);
  }
}

main();
