import { useState } from 'react';
import Alert from './Alert';
import Button from './Button';
import FormInput from './FormInput';
import { STATUS_OPTIONS } from '../services/packageService';
import { parseApiError } from '../services/errors';

const emptyForm = {
  title: '',
  destination: '',
  description: '',
  price: '',
  duration_days: '',
  availability: '',
  status: 'active',
};

function getFormValues(initialValues) {
  return initialValues
    ? {
        title: initialValues.title ?? '',
        destination: initialValues.destination ?? '',
        description: initialValues.description ?? '',
        price: initialValues.price ?? '',
        duration_days: initialValues.duration_days ?? '',
        availability: initialValues.availability ?? '',
        status: initialValues.status ?? 'active',
      }
    : emptyForm;
}

export default function PackageForm({
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState(() => getFormValues(initialValues));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const clientErrors = {};
    if (!form.title.trim()) {
      clientErrors.title = 'Title is required.';
    }
    if (!form.destination.trim()) {
      clientErrors.destination = 'Destination is required.';
    }
    if (!form.description.trim()) {
      clientErrors.description = 'Description is required.';
    }
    if (form.price === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      clientErrors.price = 'Enter a valid price of zero or more.';
    }
    if (!Number.isInteger(Number(form.duration_days)) || Number(form.duration_days) < 1) {
      clientErrors.duration_days = 'Duration must be at least 1 day.';
    }
    if (
      form.availability === ''
      || !Number.isInteger(Number(form.availability))
      || Number(form.availability) < 0
    ) {
      clientErrors.availability = 'Availability must be zero or more slots.';
    }

    setErrors(clientErrors);
    setMessage('');
    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        duration_days: Number(form.duration_days),
        availability: Number(form.availability),
      });
    } catch (error) {
      const parsedError = parseApiError(error);
      setMessage(parsedError.message);
      setErrors(parsedError.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Alert type="error">{message}</Alert>
      <div className="form-grid">
        <FormInput
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          required
        />
        <FormInput
          label="Destination"
          name="destination"
          value={form.destination}
          onChange={handleChange}
          error={errors.destination}
          required
        />
        <div className="form-group full">
          <label htmlFor="package-description">Description</label>
          <textarea
            id="package-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className={errors.description ? 'input-error' : ''}
            required
            rows="4"
          />
          {errors.description && (
            <small className="error-text">
              {Array.isArray(errors.description) ? errors.description[0] : errors.description}
            </small>
          )}
        </div>
        <FormInput
          label="Price (PHP)"
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          error={errors.price}
          required
        />
        <FormInput
          label="Duration (days)"
          name="duration_days"
          type="number"
          value={form.duration_days}
          onChange={handleChange}
          error={errors.duration_days}
          required
        />
        <FormInput
          label="Availability (slots)"
          name="availability"
          type="number"
          value={form.availability}
          onChange={handleChange}
          error={errors.availability}
          required
        />
        <div className="form-group">
          <label htmlFor="package-status">Status</label>
          <select
            id="package-status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className={errors.status ? 'input-error' : ''}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          {errors.status && (
            <small className="error-text">
              {Array.isArray(errors.status) ? errors.status[0] : errors.status}
            </small>
          )}
        </div>
      </div>
      <div className="modal-footer">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save package
        </Button>
      </div>
    </form>
  );
}
