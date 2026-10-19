import { useEffect, useState } from 'react';
import { getActiveRequestCount } from '../services/api';
import Spinner from './Spinner';

export default function ApiRequestIndicator() {
  const [loading, setLoading] = useState(() => getActiveRequestCount() > 0);

  useEffect(() => {
    const handleRequestState = (event) => {
      setLoading(event.detail.loading);
    };

    window.addEventListener('api:request-state', handleRequestState);
    return () => window.removeEventListener('api:request-state', handleRequestState);
  }, []);

  return loading ? (
    <div className="api-request-indicator" aria-live="polite">
      <Spinner label="Loading..." />
    </div>
  ) : null;
}
