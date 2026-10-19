import { STATUS_OPTIONS } from '../services/packageService';

export default function PackageFilters({ search, onSearch, status, onStatus }) {
  return (
    <div className="filters">
      <input
        type="search"
        aria-label="Search packages"
        placeholder="Search title or destination..."
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
      <select
        aria-label="Filter by status"
        value={status}
        onChange={(event) => onStatus(event.target.value)}
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
