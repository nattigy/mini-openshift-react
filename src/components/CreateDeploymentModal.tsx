import React, { useState } from 'react';
import { Modal, Input, Button, Alert } from './';
import { apiClient } from '../services/api';

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (deployment: any) => void;
}

const K8S_NAME_RE = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;

export const CreateDeploymentModal: React.FC<Props> = ({ projectId, isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [replicas, setReplicas] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name) return 'Deployment name is required';
    if (!K8S_NAME_RE.test(name)) return 'Name must be lowercase alphanumeric and may include dashes (-)';
    if (!image) return 'Container image is required';
    if (replicas < 1) return 'Replicas must be at least 1';
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      const created = await apiClient.createDeployment(projectId, { name, image, replicas });
      onCreated?.(created);
      setName('');
      setImage('');
      setReplicas(1);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to create deployment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Deployment" size="md">
      {error && <Alert variant="error" message={error} />}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Deployment Name</label>
          <Input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="web-backend" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Container Image</label>
          <Input value={image} onChange={(e: any) => setImage(e.target.value)} placeholder="nginx:latest or myrepo/app:1.0.0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Replicas</label>
          <Input type="number" value={replicas} onChange={(e: any) => setReplicas(Number(e.target.value))} />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating...' : 'Create Deployment'}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateDeploymentModal;
