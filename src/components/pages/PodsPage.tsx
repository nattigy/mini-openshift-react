import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { Pod, Project } from '@/types';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SearchBar } from '@/components/SearchBar';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useNotificationStore } from '@/store/notificationStore';
import { PodLogsModal } from '@/components/modals/PodLogsModal';

interface PodsPageProps {
    projectId: string;
}

export default function PodsPage({ projectId }: PodsPageProps) {
    const [pods, setPods] = useState<Pod[]>([]);
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<Project | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPod, setSelectedPod] = useState<string | null>(null);
    const { addNotification } = useNotificationStore();

    const fetchProject = async () => {
        try {
            const data = await apiClient.getProject(projectId);
            setProject(data);
        } catch (error) {
            addNotification('Failed to fetch project details', 'error');
        }
    };

    const fetchPods = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getPods(projectId);
            // Filter by search query
            let filtered = data;
            if (searchQuery) {
                filtered = data.filter((p: Pod) =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            setPods(filtered);
        } catch (error) {
            addNotification('Failed to fetch pods', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchProject();
            fetchPods();
            // Poll for updates every 5 seconds
            const interval = setInterval(fetchPods, 5000);
            return () => clearInterval(interval);
        }
    }, [projectId, searchQuery]);

    const handleDeletePod = async (name: string) => {
        if (!confirm('Are you sure you want to delete this pod?')) return;
        try {
            await apiClient.deletePod(projectId, name);
            addNotification('Pod deleted successfully', 'success');
            fetchPods();
        } catch (error) {
            addNotification('Failed to delete pod', 'error');
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
                        {project?.name} / Pods
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Monitor your application pods
                    </p>
                </div>
                <Button onClick={fetchPods} variant="secondary">
                    Refresh
                </Button>
            </div>

            <div className="flex justify-between items-center">
                <SearchBar
                    onSearch={setSearchQuery}
                    placeholder="Search pods..."
                />
            </div>

            <div className="grid gap-4">
                {pods.map((pod) => (
                    <Card key={pod.name} className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {pod.name}
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${pod.status === 'Running' ? 'bg-green-100 text-green-800' :
                                        pod.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {pod.status}
                                    </span>
                                </h3>
                                <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                    <p>IP: {pod.ip || 'Pending'}</p>
                                    <p>Node: {pod.node || 'Pending'}</p>
                                    <p>Restarts: {pod.containers.reduce((acc, c) => acc + c.restart_count, 0)}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setSelectedPod(pod.name)}
                                >
                                    Logs
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

                {pods.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No pods found.
                    </div>
                )}
            </div>

            {selectedPod && (
                <PodLogsModal
                    isOpen={!!selectedPod}
                    onClose={() => setSelectedPod(null)}
                    projectId={projectId}
                    podName={selectedPod}
                />
            )}

            <NotificationCenter />
        </div>
    );
}
