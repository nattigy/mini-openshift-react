'use client';

import { useState } from 'react';

interface CreateEnvironmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; subdomain_prefix: string; description?: string }) => Promise<void>;
}

export default function CreateEnvironmentModal({
    isOpen,
    onClose,
    onSubmit,
}: CreateEnvironmentModalProps) {
    const [name, setName] = useState('');
    const [subdomainPrefix, setSubdomainPrefix] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await onSubmit({
                name,
                subdomain_prefix: subdomainPrefix,
                description: description || undefined,
            });

            // Reset form
            setName('');
            setSubdomainPrefix('');
            setDescription('');
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create environment');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Create Environment
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    {error && (
                        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Environment Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="e.g., Staging, QA, Production"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Display name for the environment
                        </p>
                    </div>

                    <div>
                        <label htmlFor="subdomain_prefix" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Subdomain Prefix
                        </label>
                        <input
                            type="text"
                            id="subdomain_prefix"
                            value={subdomainPrefix}
                            onChange={(e) => setSubdomainPrefix(e.target.value.toLowerCase())}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="e.g., staging, qa (leave empty for production)"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Leave empty for production environment. This will be used in URLs like: admin.
                            <span className="font-semibold">{subdomainPrefix || '(empty)'}</span>
                            .clienta.com
                        </p>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Optional description..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Environment'}
                    </button>
                </div>
            </div>
        </div>
    );
}
