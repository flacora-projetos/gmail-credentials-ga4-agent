import { fetchGa4Properties } from '../src/services/ga4AdminService.js';

async function main() {
  try {
    const result = await fetchGa4Properties({ name: 'Hannover', account: 'accounts/175492763' });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Erro:', error.status, error.message);
    console.error('Detalhes:', error.details);
  }
}

main();
