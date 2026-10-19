import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import { parseApiError } from '../services/errors';
import { fetchPackage, formatPrice } from '../services/packageService';

export default function PackageDetails() {
  const { id } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    fetchPackage(id)
      .then((data) => {
        if (active) {
          setResult({ id, travelPackage: data, error: '' });
        }
      })
      .catch((requestError) => {
        if (active) {
          setResult({
            id,
            travelPackage: null,
            error: requestError.response?.status === 404
              ? 'Package not found.'
              : parseApiError(requestError).message,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);
  const isCurrentResult = result?.id === id;
  const loading = !isCurrentResult;
  const travelPackage = isCurrentResult ? result.travelPackage : null;
  const error = isCurrentResult ? result.error : '';

  return (
    <div className="container">
      <Link to="/packages">← Back to packages</Link>
      {loading && <Spinner label="Loading package..." />}
      <Alert type="error">{error}</Alert>

      {travelPackage && (
        <article className="card detail">
          <div className="card-top">
            <h2>{travelPackage.title}</h2>
            <StatusBadge status={travelPackage.status} />
          </div>
          <p className="muted">📍 {travelPackage.destination}</p>
          <p>{travelPackage.description || 'No description provided.'}</p>
          <ul className="detail-list">
            <li><strong>Price:</strong> {formatPrice(travelPackage.price)} per guest</li>
            <li><strong>Duration:</strong> {travelPackage.duration_days} day(s)</li>
            <li><strong>Availability:</strong> {travelPackage.availability}</li>
          </ul>
          <Link className="btn btn-primary" to={`/packages/${travelPackage.id}/book`}>
            Book this package
          </Link>
        </article>
      )}
    </div>
  );
}
