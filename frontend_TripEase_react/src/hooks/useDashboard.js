import { useEffect, useState } from 'react';
import { parseApiError } from '../services/errors';
import { fetchDashboard } from '../services/dashboardService';

export default function useDashboard() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    fetchDashboard()
      .then((stats) => {
        if (active) {
          setResult({ stats, error: '' });
        }
      })
      .catch((requestError) => {
        if (active) {
          setResult({ stats: null, error: parseApiError(requestError).message });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    stats: result?.stats ?? null,
    loading: result === null,
    error: result?.error ?? '',
  };
}
