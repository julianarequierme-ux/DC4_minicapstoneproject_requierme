import { CATEGORY_OPTIONS, STATUS_OPTIONS } from '../services/packageService';

export default function PackageFilters({
  search,
  onSearch,
  category,
  onCategory,
  status,
  onStatus,
  onClear,
}) {
  return (
    <div className="filters">
      <input
        type="search"
        aria-label="Search packages"
        placeholder="Search title, destination, or description..."
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
      <select
        aria-label="Filter by category"
        value={category}
        onChange={(event) => onCategory(event.target.value)}
      >
        <option value="">All categories</option>
        {CATEGORY_OPTIONS.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
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
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onClear}
        disabled={!search && !category && !status}
      >
        Clear filters
      </button>
    </div>
  );
}
