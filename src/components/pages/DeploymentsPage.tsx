import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { Deployment, Project } from '@/types';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { NotificationCenter } from '@/components/NotificationCenter';
import { CreateDeploymentModal } from '@/components/modals/CreateDeploymentModal';
import { useNotificationStore } from '@/store/notificationStore';

interface DeploymentsPageProps {
    projectId: string;
}

export default function DeploymentsPage({ projectId }: DeploymentsPageProps) {
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<Project | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { addNotification } = useNotificationStore();

    const fetchProject = async () => {
        try {
            const data = await apiClient.getProject(projectId);
            setProject(data);
        } catch (error) {
            addNotification('Failed to fetch project details', 'error');
        }
    };

    const fetchDeployments = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getDeployments(projectId, (page - 1) * 10, 10);
            // Filter by search query if needed (client-side for now as API doesn't support search yet)
            let filtered = data;
            if (searchQuery) {
                filtered = data.filter((d: Deployment) =>
                    d.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            setDeployments(filtered);
            // Mock total pages for now since API returns list
            setTotalPages(Math.ceil(filtered.length / 10) || 1);
        } catch (error) {
            addNotification('Failed to fetch deployments', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchProject();
            fetchDeployments();
        }
    }, [projectId, page, searchQuery]);

    const handleCreateDeployment = async (data: any) => {
        try {
            await apiClient.createDeployment(projectId, data);
            addNotification('Deployment created successfully', 'success');
            setIsCreateModalOpen(false);
            fetchDeployments();
        } catch (error) {
            addNotification('Failed to create deployment', 'error');
        }
    };

    const handleDeleteDeployment = async (name: string) => {
        if (!confirm('Are you sure you want to delete this deployment?')) return;
        try {
            await apiClient.deleteDeployment(projectId, name);
            addNotification('Deployment deleted successfully', 'success');
            fetchDeployments();
        } catch (error) {
            addNotification('Failed to delete deployment', 'error');
        }
    };

    const handleScaleDeployment = async (name: string, currentReplicas: number) => {
        const replicas = prompt('Enter new number of replicas:', currentReplicas.toString());
        if (replicas === null) return;

        const numReplicas = parseInt(replicas);
        if (isNaN(numReplicas) || numReplicas < 0) {
            addNotification('Invalid number of replicas', 'error');
            return;
        }

        try {
            await apiClient.scaleDeployment(projectId, name, numReplicas);
            addNotification('Deployment scaled successfully', 'success');
            fetchDeployments();
        } catch (error) {
            addNotification('Failed to scale deployment', 'error');
        }
    };

    if (loading && !project) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {project?.name} / Deployments
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage your application deployments
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    Create Deployment
                </Button>
            </div>

            <div className="flex justify-between items-center">
                <SearchBar
                    onSearch={setSearchQuery}
                    placeholder="Search deployments..."
                />
            </div>

            <div className="grid gap-4">
                {deployments.map((deployment) => (
                    <Card key={deployment.name} className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {deployment.name}
                                </h3>
                                <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                    <p>Image: {deployment.image}</p>
                                    <p>Replicas: {deployment.available_replicas} / {deployment.replicas}</p>
                                    <p>Status: <span className={`font-medium ${deployment.status === 'Available' ? 'text-green-600' :
                                        deployment.status === 'Progressing' ? 'text-blue-600' : 'text-red-600'
                                        }`}>{deployment.status}</span></p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleScaleDeployment(deployment.name, deployment.replicas)}
                                >
                                    Scale
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteDeployment(deployment.name)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                {deployments.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No deployments found. Create one to get started.
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}

            <CreateDeploymentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateDeployment}
            />

            <NotificationCenter />
        </div>
    );
}
