'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Modal, Alert, Loading, SearchBar, Pagination } from '@/components';
import { apiClient } from '@/services/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Filter projects based on search query
    if (searchQuery.trim()) {
      const filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, projects]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getProjects(0, 100);
      setProjects(data);
      setFilteredProjects(data);
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

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditFormData({
      name: project.name,
      description: project.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setError('');

    if (!editFormData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.updateProject(selectedProject.id, {
        name: editFormData.name,
        description: editFormData.description,
      });

      setSuccess('Project updated successfully!');
      setIsEditModalOpen(false);
      setSelectedProject(null);

      // Refresh projects
      await fetchProjects();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Failed to update project. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also delete the Kubernetes namespace and all resources.')) {
      return;
    }

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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

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

      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search projects by name or description..."
        />
        <div className="text-sm text-gray-600">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loading size="lg" label="Loading projects..." />
          </div>
        ) : currentProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              {searchQuery ? 'No projects found matching your search' : 'No projects yet'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
                Create Your First Project
              </Button>
            )}
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
                {currentProjects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {project.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {project.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          isLoading={deletingId === project.id}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

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

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
          setEditFormData({ name: '', description: '' });
          setError('');
        }}
        title="Edit Project"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedProject(null);
                setEditFormData({ name: '', description: '' });
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateProject}
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUpdateProject} className="space-y-4">
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
            value={editFormData.name}
            onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
            helperText="Must be lowercase alphanumeric with hyphens"
            required
          />
          <Input
            label="Description (Optional)"
            type="text"
            placeholder="Describe your project..."
            value={editFormData.description}
            onChange={(e) =>
              setEditFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </form>
      </Modal>
    </div>
  );
}
