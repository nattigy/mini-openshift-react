'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Loading, Alert, Input, Modal } from '@/components';
import { apiClient } from '@/services/api';
import { PodLogsModal } from '@/components/modals/PodLogsModal';

interface Deployment {
    name: string;
    namespace: string;
    image: string;
    replicas: number;
    ready_replicas: number;
    available_replicas: number;
    created_at: string;
}

interface Pod {
    name: string;
    status: string;
    ip?: string;
    node?: string;
    containers: Array<{
        name: string;
        restart_count: number;
    }>;
}

export default function DeploymentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const deploymentName = params.deploymentName as string;

    const [deployment, setDeployment] = useState<Deployment | null>(null);
    const [pods, setPods] = useState<Pod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedPod, setSelectedPod] = useState<string | null>(null);

    // Scaling modal state
    const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
    const [scaleReplicas, setScaleReplicas] = useState(1);
    const [isScaling, setIsScaling] = useState(false);

    // Update modal state
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateImage, setUpdateImage] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchData();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [projectId, deploymentName]);

    const fetchData = async () => {
        try {
            if (!isLoading) {
                // Only show loading on first fetch
                setError('');
            }

            // Fetch deployment details
            const deploymentData = await apiClient.getDeployment(projectId, deploymentName);
            setDeployment(deploymentData);

            // Fetch pods for this specific deployment (using label selector)
            const podsData = await apiClient.getPods(projectId, `app=${deploymentName}`);
            setPods(podsData.pods || []);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load deployment data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleScale = async () => {
        if (scaleReplicas < 0 || scaleReplicas > 100) {
            alert('Replicas must be between 0 and 100');
            return;
        }

        setIsScaling(true);
        try {
            await apiClient.scaleDeployment(projectId, deploymentName, scaleReplicas);
            setSuccess(`Deployment scaled to ${scaleReplicas} replicas`);
            setIsScaleModalOpen(false);
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            alert('Failed to scale deployment: ' + (err.response?.data?.detail || err.message));
        } finally {
            setIsScaling(false);
        }
    };

    const handleUpdate = async () => {
        if (!updateImage.trim()) {
            alert('Please enter a valid image name');
            return;
        }

        setIsUpdating(true);
        try {
            await apiClient.updateDeployment(projectId, deploymentName, { image: updateImage });
            setSuccess('Deployment image updated successfully');
            setIsUpdateModalOpen(false);
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            alert('Failed to update deployment: ' + (err.response?.data?.detail || err.message));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete deployment "${deploymentName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await apiClient.deleteDeployment(projectId, deploymentName);
            router.push(`/projects/${projectId}`);
        } catch (err: any) {
            alert('Failed to delete deployment: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleDeletePod = async (podName: string) => {
        if (!confirm('Are you sure you want to delete this pod? It will be recreated by the deployment.')) {
            return;
        }

        try {
            await apiClient.deletePod(projectId, podName);
            setSuccess('Pod deleted successfully');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            alert('Failed to delete pod: ' + (err.response?.data?.detail || err.message));
        }
    };

    const openScaleModal = () => {
        setScaleReplicas(deployment?.replicas || 1);
        setIsScaleModalOpen(true);
    };

    const openUpdateModal = () => {
        setUpdateImage(deployment?.image || '');
        setIsUpdateModalOpen(true);
    };

    if (isLoading && !deployment) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loading size="lg" label="Loading deployment..." />
            </div>
        );
    }

    if (error || !deployment) {
        return (
            <div className="space-y-6">
                <Alert
                    variant="error"
                    message={error || 'Deployment not found'}
                    onClose={() => router.push(`/projects/${projectId}`)}
                />
                <Button onClick={() => router.push(`/projects/${projectId}`)}>
                    Back to Project
                </Button>
            </div>
        );
    }

    const healthPercentage = deployment.replicas > 0
        ? Math.round((deployment.ready_replicas / deployment.replicas) * 100)
        : 0;

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
                <button
                    onClick={() => router.push(`/projects/${projectId}`)}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                    Project
                </button>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-white font-medium">{deploymentName}</span>
            </nav>

            {/* Deployment Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {deployment.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 font-mono text-sm">
                        {deployment.image}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Namespace: {deployment.namespace}
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        variant="secondary"
                        onClick={() => router.push(`/projects/${projectId}`)}
                    >
                        Back to Project
                    </Button>
                    <Button variant="secondary" onClick={openScaleModal}>
                        Scale
                    </Button>
                    <Button variant="secondary" onClick={openUpdateModal}>
                        Update Image
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Desired Replicas</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                            {deployment.replicas}
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ready Pods</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                            {deployment.ready_replicas}
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                            {deployment.available_replicas}
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Health</p>
                        <p className={`text-3xl font-bold mt-2 ${healthPercentage === 100
                            ? 'text-green-600 dark:text-green-400'
                            : healthPercentage > 50
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                            {healthPercentage}%
                        </p>
                    </div>
                </Card>
            </div>

            {/* Pods Section */}
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Pods ({pods.length})
                    </h2>
                </div>

                {pods.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">
                            No pods found for this deployment
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pods.map((pod) => (
                            <Card key={pod.name} className="p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {pod.name}
                                            </h3>
                                            <span
                                                className={`px-2 py-0.5 text-xs rounded-full font-medium ${pod.status === 'Running'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : pod.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}
                                            >
                                                {pod.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <p>IP: {pod.ip || 'Pending'}</p>
                                            <p>Node: {pod.node || 'Pending'}</p>
                                            <p>
                                                Restarts: {pod.containers.reduce((acc, c) => acc + c.restart_count, 0)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setSelectedPod(pod.name)}
                                        >
                                            View Logs
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDeletePod(pod.name)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>

            {/* Scale Modal */}
            <Modal
                isOpen={isScaleModalOpen}
                onClose={() => setIsScaleModalOpen(false)}
                title="Scale Deployment"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current replicas: <span className="font-semibold">{deployment.replicas}</span>
                    </p>
                    <Input
                        type="number"
                        label="New Replica Count"
                        value={scaleReplicas}
                        onChange={(e) => setScaleReplicas(parseInt(e.target.value) || 0)}
                        min={0}
                        max={100}
                        required
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setIsScaleModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleScale}
                            isLoading={isScaling}
                        >
                            Scale Deployment
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Update Image Modal */}
            <Modal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                title="Update Deployment Image"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current image: <span className="font-mono text-xs">{deployment.image}</span>
                    </p>
                    <Input
                        label="New Image"
                        value={updateImage}
                        onChange={(e) => setUpdateImage(e.target.value)}
                        placeholder="nginx:latest"
                        required
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setIsUpdateModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            isLoading={isUpdating}
                        >
                            Update Deployment
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Pod Logs Modal */}
            {selectedPod && (
                <PodLogsModal
                    isOpen={!!selectedPod}
                    onClose={() => setSelectedPod(null)}
                    projectId={projectId}
                    podName={selectedPod}
                />
            )}
        </div>
    );
}
