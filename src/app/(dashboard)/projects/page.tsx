'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input, Modal, Alert, Loading } from '@/components';
import { apiClient } from '@/services/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getProjects(0, 100);
      setProjects(data);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.createProject({
        name: formData.name,
        description: formData.description,
      });

      setSuccess('Project created successfully!');
      setFormData({ name: '', description: '' });
      setIsModalOpen(false);

      // Refresh projects
      await fetchProjects();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Failed to create project. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setError('');
    setDeletingId(id);

    try {
      await apiClient.deleteProject(id);
      setSuccess('Project deleted successfully!');
      setProjects((prev) => prev.filter((p) => p.id !== id));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Failed to delete project. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage your OpenShift projects and deployments</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
        >
          + New Project
        </Button>
      </div>

      {error && (
        <Alert
          variant="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {success && (
        <Alert
          variant="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loading size="lg" label="Loading projects..." />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No projects yet</p>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{project.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {project.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                        isLoading={deletingId === project.id}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ name: '', description: '' });
          setError('');
        }}
        title="Create New Project"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ name: '', description: '' });
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateProject}
              isLoading={isSubmitting}
            >
              Create Project
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          {error && (
            <Alert
              variant="error"
              message={error}
              onClose={() => setError('')}
              className="mb-4"
            />
          )}
          <Input
            label="Project Name"
            type="text"
            placeholder="my-project"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            helperText="Must be lowercase alphanumeric with hyphens"
            required
          />
          <Input
            label="Description (Optional)"
            type="text"
            placeholder="Describe your project..."
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </form>
      </Modal>
    </div>
  );
}
