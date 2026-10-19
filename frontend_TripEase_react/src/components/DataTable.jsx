import Spinner from './Spinner';

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'No records found.',
}) {
  if (loading) {
    return <Spinner />;
  }
  if (!data || data.length === 0) {
    return <p className="state-msg">{emptyMessage}</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
