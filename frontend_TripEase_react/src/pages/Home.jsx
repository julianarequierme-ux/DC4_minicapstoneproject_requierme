import { useState } from 'react';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import FormInput from '../components/FormInput';
import Modal from '../components/Modal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text, setText] = useState('');

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Component' },
  ];
  const rows = [
    { id: 1, name: 'Button' },
    { id: 2, name: 'FormInput' },
    { id: 3, name: 'Modal' },
    { id: 4, name: 'DataTable' },
  ];

  return (
    <div className="container">
      <h1>TripEase Frontend is running</h1>
      <p>React + Vite + Router + Axios + Context API</p>

      <FormInput
        label="Test input"
        name="test"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type here"
      />
      <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>

      <h3>Reusable components</h3>
      <DataTable columns={columns} data={rows} />

      <Modal
        isOpen={isModalOpen}
        title="Test Modal"
        onClose={() => setIsModalOpen(false)}
        footer={
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        }
      >
        Modal works.
      </Modal>
    </div>
  );
}
