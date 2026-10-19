import { useCallback, useEffect, useState } from 'react';
import { parseApiError } from '../services/errors';
import { fetchBookings } from '../services/bookingService';

export default function useBookingList(perPage = 10) {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = JSON.stringify([status, page, perPage, reloadKey]);

  useEffect(() => {
    let active = true;

    fetchBookings({ status, page, per_page: perPage })
      .then((data) => {
        if (active) {
          setResult({ requestKey, data, error: '' });
        }
      })
      .catch((requestError) => {
        if (active) {
          setResult({
            requestKey,
            data: { items: [], lastPage: 1, from: null, to: null, total: 0 },
            error: parseApiError(requestError).message,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [status, page, perPage, reloadKey, requestKey]);

  const reload = useCallback(() => setReloadKey((currentKey) => currentKey + 1), []);
  const updateStatus = useCallback((value) => {
    setStatus(value);
    setPage(1);
  }, []);
  const isCurrentResult = result?.requestKey === requestKey;

  return {
    ...(isCurrentResult ? result.data : { items: [], lastPage: 1, total: 0 }),
    page,
    setPage,
    status,
    setStatus: updateStatus,
    loading: !isCurrentResult,
    error: isCurrentResult ? result.error : '',
    reload,
  };
}
