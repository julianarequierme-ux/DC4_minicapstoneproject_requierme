export default function Alert({ type = 'error', children, onClose }) {
  if (!children) {
    return null;
  }

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{children}</span>
      {onClose && (
        <button
          className="alert-close"
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
