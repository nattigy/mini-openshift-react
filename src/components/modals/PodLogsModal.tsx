import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/services/api';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';

interface PodLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    podName: string;
}

export function PodLogsModal({ isOpen, onClose, projectId, podName }: PodLogsModalProps) {
    const [logs, setLogs] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const fetchLogs = async () => {
        try {
            const data = await apiClient.getPodLogs(projectId, podName);
            setLogs(data.logs);
        } catch (error) {
            setLogs('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen, projectId, podName]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen && autoRefresh) {
            interval = setInterval(fetchLogs, 3000);
        }
        return () => clearInterval(interval);
    }, [isOpen, autoRefresh]);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Logs: ${podName}`} size="lg">
            <div className="flex justify-end mb-2 space-x-2">
                <Button
                    variant={autoRefresh ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                >
                    {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
                </Button>
                <Button variant="secondary" size="sm" onClick={fetchLogs}>
                    Refresh
                </Button>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm h-[60vh] overflow-y-auto whitespace-pre-wrap">
                {loading ? 'Loading logs...' : logs || 'No logs available'}
                <div ref={logsEndRef} />
            </div>

            <div className="flex justify-end mt-4">
                <Button variant="ghost" onClick={onClose}>
                    Close
                </Button>
            </div>
        </Modal>
    );
}
