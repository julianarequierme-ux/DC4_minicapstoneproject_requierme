export function parseApiError(error) {
  const data = error?.response?.data;

  if (error?.response?.status === 422) {
    return {
      message: data?.message || 'Please fix the errors below.',
      errors: data?.errors || {},
    };
  }

  if (data?.message) {
    return { message: data.message, errors: {} };
  }

  if (!error?.response) {
    return {
      message: 'Cannot reach the server. Is Laravel running?',
      errors: {},
    };
  }

  return { message: 'Something went wrong. Please try again.', errors: {} };
}
