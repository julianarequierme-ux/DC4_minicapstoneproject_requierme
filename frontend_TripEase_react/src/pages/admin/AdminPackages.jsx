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
  const packageList = usePackageList(9);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [deletingPackage, setDeletingPackage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const openCreateForm = () => {
    setEditingPackage(null);
    setIsFormOpen(true);
  };

  const openEditForm = (travelPackage) => {
    setEditingPackage(travelPackage);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (!isSaving) {
      setIsFormOpen(false);
      setEditingPackage(null);
    }
  };

  const handleSave = async (payload) => {
    setIsSaving(true);
    setSuccessMessage('');

    try {
      if (editingPackage) {
        await updatePackage(editingPackage.id, payload);
        setSuccessMessage('Package updated successfully.');
      } else {
        await createPackage(payload);
        setSuccessMessage('Package created successfully.');
      }
      setIsFormOpen(false);
      setEditingPackage(null);
      packageList.reload();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPackage) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    setSuccessMessage('');

    try {
      await deletePackage(deletingPackage.id);
      setSuccessMessage('Package deleted successfully.');
      setDeletingPackage(null);

      if (packageList.items.length === 1 && packageList.page > 1) {
        packageList.setPage(packageList.page - 1);
      } else {
        packageList.reload();
      }
    } catch (error) {
      setDeleteError(parseApiError(error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'destination', label: 'Destination' },
    {
      key: 'price',
      label: 'Price',
      render: (travelPackage) => formatPrice(travelPackage.price),
    },
    {
      key: 'duration_days',
      label: 'Duration',
      render: (travelPackage) => `${travelPackage.duration_days} day(s)`,
    },
    { key: 'availability', label: 'Availability' },
    {
      key: 'status',
      label: 'Status',
      render: (travelPackage) => <StatusBadge status={travelPackage.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (travelPackage) => (
        <div className="row-actions">
          <Button
            variant="secondary"
            onClick={() => openEditForm(travelPackage)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setDeleteError('');
              setDeletingPackage(travelPackage);
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
        <Button onClick={openCreateForm}>Add package</Button>
      </div>

      <PackageFilters
        search={packageList.search}
        onSearch={packageList.setSearch}
        status={packageList.status}
        onStatus={packageList.setStatus}
      />

      <Alert type="success" onClose={() => setSuccessMessage('')}>
        {successMessage}
      </Alert>
      <Alert type="error">{packageList.error}</Alert>

      <DataTable
        columns={columns}
        data={packageList.items}
        loading={packageList.loading}
        emptyMessage="No packages found. Try a different search or filter."
      />

      <Pagination
        page={packageList.page}
        lastPage={packageList.lastPage}
        onChange={packageList.setPage}
      />
      {!packageList.loading && packageList.total > 0 && (
        <p className="state-msg">{packageList.total} package(s) total</p>
      )}

      <Modal
        isOpen={isFormOpen}
        title={editingPackage ? 'Edit package' : 'Add package'}
        onClose={closeForm}
      >
        <PackageForm
          key={editingPackage?.id ?? 'new-package'}
          initialValues={editingPackage}
          onSubmit={handleSave}
          onCancel={closeForm}
          submitting={isSaving}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deletingPackage)}
        title="Delete package"
        onClose={() => {
          if (!isDeleting) {
            setDeletingPackage(null);
            setDeleteError('');
          }
        }}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={isDeleting}
              onClick={() => {
                setDeletingPackage(null);
                setDeleteError('');
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" loading={isDeleting} onClick={handleDelete}>
              Delete package
            </Button>
          </>
        }
      >
        <Alert type="error">{deleteError}</Alert>
        <p>
          Are you sure you want to delete{' '}
          <strong>{deletingPackage?.title}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
