'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Loading, Alert } from '@/components';
import { apiClient } from '@/services/api';
import { CreateDeploymentModal } from '@/components/modals/CreateDeploymentModal';

interface Project {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    owner_id: string;
}

interface Deployment {
    name: string;
    namespace: string;
    image: string;
    replicas: number;
    ready_replicas: number;
    available_replicas: number;
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Create deployment modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchProjectData();
    }, [projectId]);

    const fetchProjectData = async () => {
        try {
            setIsLoading(true);
            setError('');

            // Fetch project details
            const projectData = await apiClient.getProject(projectId);
            setProject(projectData);

            // Fetch deployments
            const deploymentsData = await apiClient.getDeployments(projectId);
            setDeployments(deploymentsData.deployments || []);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load project data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateDeployment = async (data: any) => {
        try {
            await apiClient.createDeployment(projectId, data);
            setSuccess('Deployment created successfully!');
            setIsCreateModalOpen(false);
            fetchProjectData(); // Refresh deployments list
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

    const totalPods = deployments.reduce((sum, d) => sum + (d.ready_replicas || 0), 0);
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
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Create Deployment
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ready Pods</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                            {totalPods}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Deployments Section */}
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Deployments
                    </h2>
                    {deployments.length > 0 && (
                        <Button
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Create Deployment
                        </Button>
                    )}
                </div>

                {deployments.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            No deployments yet
                        </p>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Create Your First Deployment
                        </Button>
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
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Replicas
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Ready
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {deployments.map((deployment) => (
                                    <tr
                                        key={deployment.name}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {deployment.name}
                                            </span>
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
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deployment.ready_replicas === deployment.replicas
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                    }`}
                                            >
                                                {deployment.ready_replicas} / {deployment.replicas}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    router.push(`/projects/${projectId}/deployments/${deployment.name}`)
                                                }
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
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
            />
        </div>
    );
}
