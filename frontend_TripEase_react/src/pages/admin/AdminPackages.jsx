import { useState } from 'react';
import Alert from '../../components/Alert';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import PackageFilters from '../../components/PackageFilters';
import PackageForm from '../../components/PackageForm';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import usePackageList from '../../hooks/usePackageList';
import {
  createPackage,
  deletePackage,
  formatPrice,
  updatePackage,
} from '../../services/packageService';
import { parseApiError } from '../../services/errors';

export default function AdminPackages() {
  const list = usePackageList(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState('');
  const [pageError, setPageError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setServerErrors({});
    setFormMessage('');
    setFormOpen(true);
  };

  const openEdit = (travelPackage) => {
    setEditing(travelPackage);
    setServerErrors({});
    setFormMessage('');
    setFormOpen(true);
  };

  const closeForm = () => {
    if (!saving) {
      setFormOpen(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    setServerErrors({});
    setFormMessage('');
    setPageError('');

    try {
      if (editing) {
        await updatePackage(editing.id, values);
      } else {
        await createPackage(values);
      }
      setFormOpen(false);
      setSuccess(editing ? 'Package updated successfully.' : 'Package created successfully.');
      list.reload();
    } catch (error) {
      const parsed = parseApiError(error);
      setFormMessage(parsed.message);
      setServerErrors(parsed.errors);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) {
      return;
    }

    setDeleting(true);
    setPageError('');
    setSuccess('');

    try {
      await deletePackage(toDelete.id);
      setToDelete(null);
      setSuccess('Package deleted successfully.');
      if (list.items.length === 1 && list.page > 1) {
        list.setPage(list.page - 1);
      } else {
        list.reload();
      }
    } catch (error) {
      setToDelete(null);
      setPageError(parseApiError(error).message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'destination', label: 'Destination' },
    { key: 'price', label: 'Price', render: (row) => formatPrice(row.price) },
    { key: 'duration_days', label: 'Days' },
    { key: 'availability', label: 'Availability' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="row-actions">
          <Button variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
          <Button
            variant="danger"
            onClick={() => {
              setPageError('');
              setToDelete(row);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <div className="toolbar">
        <h2>Manage Packages</h2>
        <Button onClick={openCreate}>+ New package</Button>
      </div>

      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>
      <Alert type="error" onClose={() => setPageError('')}>
        {pageError || list.error}
      </Alert>

      <PackageFilters
        search={list.search}
        onSearch={list.setSearch}
        category={list.category}
        onCategory={list.setCategory}
        status={list.status}
        onStatus={list.setStatus}
        onClear={list.clearFilters}
      />

      <DataTable
        columns={columns}
        data={list.items}
        loading={list.loading}
        emptyMessage="No packages found. Create one or change your search."
      />
      <Pagination
        page={list.page}
        lastPage={list.lastPage}
        from={list.from}
        to={list.to}
        total={list.total}
        onChange={list.setPage}
      />

      <Modal
        isOpen={formOpen}
        title={editing ? 'Edit package' : 'New package'}
        onClose={closeForm}
      >
        <Alert type="error">{formMessage}</Alert>
        <PackageForm
          key={editing?.id ?? 'new'}
          initial={editing}
          onSubmit={handleSave}
          onCancel={closeForm}
          submitting={saving}
          serverErrors={serverErrors}
        />
      </Modal>

      <Modal
        isOpen={Boolean(toDelete)}
        title="Delete package"
        onClose={() => {
          if (!deleting) {
            setToDelete(null);
          }
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Yes, delete
            </Button>
          </>
        }
      >
        Delete <strong>{toDelete?.title}</strong>? This cannot be undone.
      </Modal>
    </div>
  );
}
