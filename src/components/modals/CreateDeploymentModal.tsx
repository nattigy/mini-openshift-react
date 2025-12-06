import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { apiClient } from '@/services/api';

interface CreateDeploymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectDomain?: string;  // Base domain from project
    onSubmit: (data: {
        name: string;
        image: string;
        replicas: number;
        environment_id: string;
        subdomain: string;
        image_pull_policy?: string;
        env_vars?: Record<string, string>;
    }) => Promise<void>;
}

interface Environment {
    id: string;
    name: string;
    subdomain_prefix: string;
}

export function CreateDeploymentModal({ isOpen, onClose, onSubmit, projectDomain }: CreateDeploymentModalProps) {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [replicas, setReplicas] = useState(1);
    // containerPort removed per user request (defaults to 3000)
    const [subdomain, setSubdomain] = useState('');
    const [environmentId, setEnvironmentId] = useState('');
    const [imagePullPolicy, setImagePullPolicy] = useState('IfNotPresent');
    const [envKey, setEnvKey] = useState('');
    const [envValue, setEnvValue] = useState('');
    const [envVars, setEnvVars] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [loadingEnvironments, setLoadingEnvironments] = useState(false);

    // Fetch environments when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchEnvironments();
        }
    }, [isOpen]);

    const fetchEnvironments = async () => {
        setLoadingEnvironments(true);
        try {
            const data = await apiClient.getEnvironments();
            setEnvironments(data);
            // Auto-select first environment if available
            if (data.length > 0 && !environmentId) {
                setEnvironmentId(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch environments:', error);
        } finally {
            setLoadingEnvironments(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            await onSubmit({
                replicas,
                name,
                image,
                environment_id: environmentId,
                subdomain,
                image_pull_policy: imagePullPolicy,
                env_vars: Object.keys(envVars).length > 0 ? envVars : undefined,
            });
            // Reset form
            setName('');
            setImage('');
            setReplicas(1);
            setReplicas(1);
            setSubdomain('');
            setImagePullPolicy('IfNotPresent');
            setEnvVars({});
        } catch (error) {
            // Error handled by parent
        } finally {
            setIsLoading(false);
        }
    };

    const addEnvVar = () => {
        if (envKey && envValue) {
            setEnvVars({ ...envVars, [envKey]: envValue });
            setEnvKey('');
            setEnvValue('');
        }
    };

    const removeEnvVar = (key: string) => {
        const newEnv = { ...envVars };
        delete newEnv[key];
        setEnvVars(newEnv);
    };

    // Build full domain preview
    const getFullDomain = () => {
        if (!projectDomain) return 'Set project domain first';

        const selectedEnv = environments.find(env => env.id === environmentId);
        const envPrefix = selectedEnv?.subdomain_prefix || '';

        const parts = [];
        if (subdomain) parts.push(subdomain);
        if (envPrefix) parts.push(envPrefix);
        parts.push(projectDomain);

        return parts.join('.');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Deployment">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Deployment Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="admin-panel"
                    required
                />

                <Input
                    label="Container Image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="nginx:latest"
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Replicas"
                        type="number"
                        min={1}
                        value={replicas}
                        onChange={(e) => setReplicas(parseInt(e.target.value))}
                        required
                    />
                    {/* Container port removed - assuming standard port 3000 */}
                </div>

                {/* Environment Selection */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Environment *
                    </label>
                    <select
                        value={environmentId}
                        onChange={(e) => setEnvironmentId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                        disabled={loadingEnvironments}
                    >
                        {loadingEnvironments ? (
                            <option>Loading environments...</option>
                        ) : environments.length === 0 ? (
                            <option>No environments available</option>
                        ) : (
                            environments.map(env => (
                                <option key={env.id} value={env.id}>
                                    {env.name} {env.subdomain_prefix && `(${env.subdomain_prefix})`}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* Subdomain */}
                <div>
                    <Input
                        label="Subdomain"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                        placeholder="admin (leave empty for root domain)"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Leave empty to deploy at root domain
                    </p>
                </div>

                {/* Domain Preview */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                        📡 Deployment URL Preview
                    </p>
                    <code className="text-sm text-blue-800 dark:text-blue-200 break-all">
                        https://{getFullDomain()}
                    </code>
                </div>

                {/* Image Pull Policy */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Image Pull Policy
                    </label>
                    <select
                        value={imagePullPolicy}
                        onChange={(e) => setImagePullPolicy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="Always">Always</option>
                        <option value="IfNotPresent">IfNotPresent</option>
                        <option value="Never">Never</option>
                    </select>
                </div>

                {/* Environment Variables */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Environment Variables (Optional)
                    </label>
                    <div className="flex space-x-2">
                        <Input
                            value={envKey}
                            onChange={(e) => setEnvKey(e.target.value)}
                            placeholder="KEY"
                            className="flex-1"
                        />
                        <Input
                            value={envValue}
                            onChange={(e) => setEnvValue(e.target.value)}
                            placeholder="VALUE"
                            className="flex-1"
                        />
                        <Button type="button" onClick={addEnvVar} variant="secondary">
                            Add
                        </Button>
                    </div>

                    {Object.entries(envVars).length > 0 && (
                        <div className="mt-2 space-y-1">
                            {Object.entries(envVars).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                    <span className="text-gray-900 dark:text-white">{key}={value}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeEnvVar(key)}
                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Create Deployment
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
