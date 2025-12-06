'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Loading, Alert } from '@/components';
import CreateEnvironmentModal from '@/components/modals/CreateEnvironmentModal';
import { apiClient } from '@/services/api';

interface Environment {
    id: string;
    name: string;
    subdomain_prefix: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export default function EnvironmentsPage() {
    const router = useRouter();
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchEnvironments();
    }, []);

    const fetchEnvironments = async () => {
        try {
            setIsLoading(true);
            const data = await apiClient.getEnvironments();
            setEnvironments(data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch environments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateEnvironment = async (data: {
        name: string;
        subdomain_prefix: string;
        description?: string;
    }) => {
        await apiClient.createEnvironment(data);
        setSuccess(`Environment "${data.name}" created successfully`);
        await fetchEnvironments();
    };

    const handleDeleteEnvironment = async (env: Environment) => {
        if (!confirm(`Are you sure you want to delete the environment "${env.name}"? This will fail if deployments exist in this environment.`)) {
            return;
        }

        try {
            await apiClient.deleteEnvironment(env.id);
            setSuccess(`Environment "${env.name}" deleted successfully`);
            await fetchEnvironments();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to delete environment');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loading size="lg" label="Loading environments..." />
            </div>
        );
    }

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

            {/* Error Message */}
            {error && (
                <Alert
                    variant="error"
                    message={error}
                    onClose={() => setError('')}
                />
            )}

            {/* Breadcrumbs */}
            <nav className="flex text-sm text-gray-600 dark:text-gray-400">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                    Dashboard
                </button>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-white font-medium">Environments</span>
            </nav>

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Environments
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage global deployment environments for all projects
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    Create Environment
                </Button>
            </div>

            {/* Environments List */}
            <Card>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Available Environments ({environments.length})
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        These environments are available system-wide for all projects
                    </p>
                </div>

                {environments.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 text-5xl mb-4">
                            🌍
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No environments yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Create your first environment to organize deployments
                        </p>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            Create Environment
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Subdomain Prefix
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        URL Example
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {environments.map((env) => (
                                    <tr key={env.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-3">
                                                    {env.subdomain_prefix === '' ? '🏭' : '🧪'}
                                                </span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {env.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        ID: {env.id.substring(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                {env.subdomain_prefix || '(none)'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {env.description || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-800 dark:text-gray-300">
                                                {env.subdomain_prefix ? `admin.${env.subdomain_prefix}.example.com` : 'admin.example.com'}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDeleteEnvironment(env)}
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

            {/* Create Environment Modal */}
            <CreateEnvironmentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateEnvironment}
            />
        </div>
    );
}
