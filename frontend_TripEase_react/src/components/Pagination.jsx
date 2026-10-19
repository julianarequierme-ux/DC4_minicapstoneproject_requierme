export default function Pagination({
  page = 1,
  lastPage = 1,
  from = null,
  to = null,
  total = 0,
  onChange,
}) {
  const displayFrom = total > 0 ? from ?? 0 : 0;
  const displayTo = total > 0 ? to ?? 0 : 0;

  const start = Math.max(1, Math.min(page - 2, lastPage - 4));
  const end = Math.min(lastPage, start + 4);
  const pages = [];
  for (let currentPage = start; currentPage <= end; currentPage += 1) {
    pages.push(currentPage);
  }

  return (
    <div className="pagination">
      <p className="pagination-summary">Showing {displayFrom}-{displayTo} of {total}</p>
      {lastPage > 1 && (
        <nav className="pagination-controls" aria-label="Pagination">
          <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
            ‹ Previous
          </button>
          {pages.map((currentPage) => (
            <button
              key={currentPage}
              type="button"
              className={currentPage === page ? 'active' : ''}
              aria-current={currentPage === page ? 'page' : undefined}
              onClick={() => onChange(currentPage)}
            >
              {currentPage}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= lastPage}
            onClick={() => onChange(page + 1)}
          >
            Next ›
          </button>
        </nav>
      )}
    </div>
  );
}
