import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import PackageFilters from '../components/PackageFilters';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import usePackageList from '../hooks/usePackageList';
import { formatPrice } from '../services/packageService';
import Button from '../components/Button';

export default function Packages() {
  const packageList = usePackageList(9);

  return (
    <div className="container">
      <h2>Travel Packages</h2>
      <PackageFilters
        search={packageList.search}
        onSearch={packageList.setSearch}
        category={packageList.category}
        onCategory={packageList.setCategory}
        status={packageList.status}
        onStatus={packageList.setStatus}
        onClear={packageList.clearFilters}
      />

      <Alert type="error">{packageList.error}</Alert>
      {packageList.loading && <p className="state-msg">Loading packages...</p>}

      {!packageList.loading && !packageList.error && packageList.items.length === 0 && (
        <div className="state-msg empty-state">
          <p>No packages found. Try a different search or filter.</p>
          <Button variant="secondary" onClick={packageList.clearFilters}>Clear filters</Button>
        </div>
      )}

      <div className="card-grid">
        {!packageList.loading && packageList.items.map((travelPackage) => (
          <article className="card" key={travelPackage.id}>
            <div className="card-top">
              <h3>{travelPackage.title}</h3>
              <StatusBadge status={travelPackage.status} />
            </div>
            <p className="muted">📍 {travelPackage.destination}</p>
            <p className="muted">🕒 {travelPackage.duration_days} day(s)</p>
            <p className="price">{formatPrice(travelPackage.price)}</p>
            <Link className="btn btn-primary" to={`/packages/${travelPackage.id}`}>
              View details
            </Link>
          </article>
        ))}
      </div>

      <Pagination
        page={packageList.page}
        lastPage={packageList.lastPage}
        from={packageList.from}
        to={packageList.to}
        total={packageList.total}
        onChange={packageList.setPage}
      />
    </div>
  );
}
