export function buildErrorResponse(error) {
  if (!error) {
    return {
      status: 500,
      message: 'Erro desconhecido'
    };
  }

  if (error.response) {
    return {
      status: error.response.status ?? 500,
      message: error.response.data?.error?.message ?? error.response.data?.message ?? error.message,
      details: error.response.data ?? null
    };
  }

  return {
    status: error.status ?? 500,
    message: error.message ?? 'Falha desconhecida',
    details: error.details ?? null
  };
}
