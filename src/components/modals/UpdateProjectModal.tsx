import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { apiClient } from '@/services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: (project: any) => void;
    project: {
        id: string;
        name: string;
        description?: string;
        domain?: string;
    };
}

export const UpdateProjectModal: React.FC<Props> = ({ isOpen, onClose, onUpdated, project }) => {
    const [description, setDescription] = useState(project.description || '');
    const [domain, setDomain] = useState(project.domain || '');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Update state when project prop changes
    useEffect(() => {
        if (isOpen && project) {
            setDescription(project.description || '');
            setDomain(project.domain || '');
        }
    }, [isOpen, project]);

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);
        try {
            const updated = await apiClient.updateProject(project.id, {
                description,
                domain: domain || undefined
            });
            onUpdated?.(updated);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.detail || err.message || 'Failed to update project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
            {error && <div className="mb-4"><Alert variant="error" message={error} /></div>}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Project Name
                    </label>
                    <Input value={project.name} disabled className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-500" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Project name cannot be changed</p>
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
                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
