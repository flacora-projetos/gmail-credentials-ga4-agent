import axios from 'axios';
import { getAccessToken } from '../src/services/googleAuth.js';

async function main() {
  try {
    const { token } = await getAccessToken();
    const response = await axios.get('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data ?? error.message;
    console.error('Erro ao listar accountSummaries:', status, message);
    process.exitCode = 1;
  }
}

main();
