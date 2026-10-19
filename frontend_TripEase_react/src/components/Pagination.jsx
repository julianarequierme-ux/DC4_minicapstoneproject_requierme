export default function Pagination({ page, lastPage, onChange }) {
  if (lastPage <= 1) {
    return null;
  }

  const start = Math.max(1, Math.min(page - 2, lastPage - 4));
  const end = Math.min(lastPage, start + 4);
  const pages = [];
  for (let currentPage = start; currentPage <= end; currentPage += 1) {
    pages.push(currentPage);
  }

  return (
    <nav className="pagination" aria-label="Package pages">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹ Prev
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
  );
}
