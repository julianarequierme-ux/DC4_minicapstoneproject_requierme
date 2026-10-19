import { useCallback, useEffect, useState } from 'react';
import { parseApiError } from '../services/errors';
import { fetchPackages } from '../services/packageService';
import useDebounce from './useDebounce';

export default function usePackageList(perPage = 9) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebounce(search);
  const requestKey = JSON.stringify([debouncedSearch, category, status, page, perPage, reloadKey]);

  useEffect(() => {
    let active = true;

    fetchPackages({ search: debouncedSearch, category, status, page, per_page: perPage })
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
  }, [debouncedSearch, category, status, page, perPage, reloadKey, requestKey]);

  const reload = useCallback(() => setReloadKey((currentKey) => currentKey + 1), []);
  const updateSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);
  const updateStatus = useCallback((value) => {
    setStatus(value);
    setPage(1);
  }, []);
  const updateCategory = useCallback((value) => {
    setCategory(value);
    setPage(1);
  }, []);
  const clearFilters = useCallback(() => {
    setSearch('');
    setCategory('');
    setStatus('');
    setPage(1);
  }, []);
  const isCurrentResult = result?.requestKey === requestKey;

  return {
    ...(isCurrentResult ? result.data : { items: [], lastPage: 1, total: 0 }),
    page,
    setPage,
    search,
    setSearch: updateSearch,
    category,
    setCategory: updateCategory,
    status,
    setStatus: updateStatus,
    clearFilters,
    loading: !isCurrentResult,
    error: isCurrentResult ? result.error : '',
    reload,
  };
}
