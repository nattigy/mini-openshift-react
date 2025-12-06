import React, { useState } from 'react';
import { Modal, Input, Button, Alert } from './';
import { apiClient } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: any) => void;
}

// Kubernetes-compatible name: lowercase alphanumeric and '-' , start/end alnum, max 253
const K8S_NAME_RE = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;

export const CreateProjectModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name) return 'Project name is required';
    if (name.length > 253) return 'Name must be 253 characters or less';
    if (!K8S_NAME_RE.test(name)) return 'Name must be lowercase alphanumeric and may include dashes (-)';
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      const created = await apiClient.createProject({
        name,
        description,
        domain: domain || undefined  // Send domain if provided
      });
      onCreated?.(created);
      setName('');
      setDescription('');
      setDomain('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="md">
      {error && <Alert variant="error" message={error} />}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Name *
          </label>
          <Input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="my-app-prod" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lowercase, alphanumeric, dashes allowed</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Domain
          </label>
          <Input
            value={domain}
            onChange={(e: any) => setDomain(e.target.value)}
            placeholder="example.com"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Base domain for deployments. Required to use Ingress routing.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <Input value={description} onChange={(e: any) => setDescription(e.target.value)} placeholder="Optional description" />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateProjectModal;
