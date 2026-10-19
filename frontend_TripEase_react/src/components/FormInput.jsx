export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
}) {
  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={error ? 'input-error' : ''}
      />
      {error && (
        <small className="error-text">
          {Array.isArray(error) ? error[0] : error}
        </small>
      )}
    </div>
  );
}
