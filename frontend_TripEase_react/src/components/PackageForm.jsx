import { useState } from 'react';
import Button from './Button';
import FormInput from './FormInput';
import { STATUS_OPTIONS } from '../services/packageService';

const EMPTY = {
  title: '',
  destination: '',
  description: '',
  price: '',
  duration_days: '',
  availability: '',
  status: STATUS_OPTIONS[0],
};

export default function PackageForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
  serverErrors = {},
}) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });
  const [clientErrors, setClientErrors] = useState({});
  const [changedFields, setChangedFields] = useState({});

  const errors = { ...serverErrors, ...clientErrors };
  for (const field of Object.keys(errors)) {
    errors[field] = clientErrors[field] ?? (
      changedFields[field] ? undefined : serverErrors[field]
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setClientErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
    setChangedFields((currentFields) => ({ ...currentFields, [name]: true }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) {
      nextErrors.title = 'Title is required.';
    }
    if (!form.destination.trim()) {
      nextErrors.destination = 'Destination is required.';
    }
    if (!form.description.trim()) {
      nextErrors.description = 'Description is required.';
    }
    if (form.price === '' || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      nextErrors.price = 'Price must be greater than 0.';
    }
    if (!Number.isInteger(Number(form.duration_days)) || Number(form.duration_days) < 1) {
      nextErrors.duration_days = 'Duration must be at least 1 day.';
    }
    if (
      form.availability === ''
      || !Number.isInteger(Number(form.availability))
      || Number(form.availability) < 0
    ) {
      nextErrors.availability = 'Availability must be 0 or more.';
    }
    if (!STATUS_OPTIONS.includes(form.status)) {
      nextErrors.status = 'Choose a valid status.';
    }
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setClientErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setChangedFields({});
    onSubmit({
      ...form,
      price: Number(form.price),
      duration_days: Number(form.duration_days),
      availability: Number(form.availability),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="full">
          <FormInput
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            error={errors.title}
          />
        </div>
        <FormInput
          label="Destination"
          name="destination"
          value={form.destination}
          onChange={handleChange}
          error={errors.destination}
        />
        <FormInput
          label="Price (PHP)"
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          error={errors.price}
        />
        <FormInput
          label="Duration (days)"
          name="duration_days"
          type="number"
          value={form.duration_days}
          onChange={handleChange}
          error={errors.duration_days}
        />
        <FormInput
          label="Availability"
          name="availability"
          type="number"
          value={form.availability}
          onChange={handleChange}
          error={errors.availability}
        />
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
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
        <div className="form-group full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={form.description || ''}
            onChange={handleChange}
            className={errors.description ? 'input-error' : ''}
          />
          {errors.description && (
            <small className="error-text">
              {Array.isArray(errors.description)
                ? errors.description[0]
                : errors.description}
            </small>
          )}
        </div>
      </div>
      <div className="row-actions">
        <Button type="submit" loading={submitting}>Save</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
