'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Loading, Alert } from '@/components';
import { apiClient } from '@/services/api';
import { CreateDeploymentModal } from '@/components/modals/CreateDeploymentModal';
import { UpdateProjectModal } from '@/components/modals/UpdateProjectModal';

interface Project {
    id: string;
    name: string;
    description?: string;
    domain?: string;
    created_at: string;
    owner_id: string;
}

interface Deployment {
    id: string;
    name: string;
    image: string;
    replicas: number;
    subdomain: string;
    environment_id: string;
    full_domain?: string;
}

interface Environment {
    id: string;
    name: string;
    subdomain_prefix: string;
}


export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Create deployment modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // Update project modal
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    useEffect(() => {
        fetchProjectData();
        fetchEnvironments();
    }, [projectId]);

    // Fetch deployments when environment filter changes
    useEffect(() => {
        if (project) {
            fetchDeployments();
        }
    }, [selectedEnvironment, project]);

    const fetchEnvironments = async () => {
        try {
            const data = await apiClient.getEnvironments();
            setEnvironments(data);
        } catch (err) {
            console.error('Failed to fetch environments:', err);
        }
    };

    const fetchProjectData = async () => {
        try {
            setIsLoading(true);
            setError('');

            // Fetch project details
            const projectData = await apiClient.getProject(projectId);
            setProject(projectData);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load project data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDeployments = async () => {
        try {
            // Fetch deployments with optional environment filter
            const params = selectedEnvironment !== 'all' ? { environment_id: selectedEnvironment } : {};
            const deploymentsData = await apiClient.getDeployments(projectId, params);
            setDeployments(deploymentsData || []);
        } catch (err: any) {
            console.error('Failed to fetch deployments:', err);
        }
    };

    const handleCreateDeployment = async (data: any) => {
        try {
            await apiClient.createDeployment(projectId, data);
            setSuccess('Deployment created successfully!');
            setIsCreateModalOpen(false);
            fetchDeployments(); // Refresh deployments list
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            throw err; // Let the modal handle the error
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loading size="lg" label="Loading project..." />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="space-y-6">
                <Alert
                    variant="error"
                    message={error || 'Project not found'}
                    onClose={() => router.push('/projects')}
                />
                <Button onClick={() => router.push('/projects')}>
                    Back to Projects
                </Button>
            </div>
        );
    }

    const totalReplicas = deployments.reduce((sum, d) => sum + d.replicas, 0);

    return (
        <div className="space-y-6">
            {/* Success Message */}
            {success && (
                <Alert
                    variant="success"
                    message={success}
                    onClose={() => setSuccess('')}
                />
            )}

            {/* Breadcrumbs */}
            <nav className="flex text-sm text-gray-600 dark:text-gray-400">
                <button
                    onClick={() => router.push('/projects')}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                    Projects
                </button>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-white font-medium">{project.name}</span>
            </nav>

            {/* Project Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {project.name}
                    </h1>
                    {project.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {project.description}
                        </p>
                    )}
                    {project.domain && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            🌐 {project.domain}
                        </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        variant="secondary"
                        onClick={() => router.push('/projects')}
                    >
                        Back to Projects
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setIsUpdateModalOpen(true)}
                    >
                        Edit Project
                    </Button>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={!project.domain}
                    >
                        Create Deployment
                    </Button>
                </div>
            </div>

            {!project.domain && (
                <Alert
                    variant="warning"
                    message="Project domain is required to create deployments with Ingress routing. Please update the project to add a domain."
                />
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Deployments</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                            {deployments.length}
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Replicas</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                            {totalReplicas}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Deployments Section */}
            <Card>
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Deployments
                        </h2>
                        {deployments.length > 0 && (
                            <Button
                                variant="secondary"
                                onClick={() => setIsCreateModalOpen(true)}
                                disabled={!project.domain}
                            >
                                Create Deployment
                            </Button>
                        )}
                    </div>

                    {/* Environment Filter */}
                    {environments.length > 0 && (
                        <div className="flex items-center space-x-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filter by Environment:
                            </label>
                            <select
                                value={selectedEnvironment}
                                onChange={(e) => setSelectedEnvironment(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Environments</option>
                                {environments.map((env) => (
                                    <option key={env.id} value={env.id}>
                                        {env.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {deployments.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {selectedEnvironment !== 'all'
                                ? 'No deployments in this environment'
                                : 'No deployments yet'}
                        </p>
                        {selectedEnvironment === 'all' && (
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                disabled={!project.domain}
                            >
                                Create Your First Deployment
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Domain
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Environment
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Replicas
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {deployments.map((deployment) => {
                                    const env = environments.find(e => e.id === deployment.environment_id);
                                    return (
                                        <tr
                                            key={deployment.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {deployment.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {deployment.full_domain ? (
                                                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-blue-600 dark:text-blue-400">
                                                        {deployment.full_domain}
                                                    </code>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No domain</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {env && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                                                        {env.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                    {deployment.image}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {deployment.replicas}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(`/projects/${projectId}/deployments/${deployment.name}`)
                                                    }
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Create Deployment Modal */}
            <CreateDeploymentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateDeployment}
                projectDomain={project.domain}
            />

            {/* Update Project Modal */}
            {project && (
                <UpdateProjectModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    project={project}
                    onUpdated={() => {
                        fetchProjectData();
                        setSuccess('Project updated successfully');
                        setTimeout(() => setSuccess(''), 3000);
                    }}
                />
            )}
        </div>
    );
}
