import { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';

interface CreateDeploymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        image: string;
        replicas: number;
        port?: number;
        image_pull_policy?: string;
        service_type?: string;
        environment?: Record<string, string>
    }) => Promise<void>;
}

export function CreateDeploymentModal({ isOpen, onClose, onSubmit }: CreateDeploymentModalProps) {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [replicas, setReplicas] = useState(1);
    const [port, setPort] = useState<number | ''>('');
    const [imagePullPolicy, setImagePullPolicy] = useState('IfNotPresent');
    const [serviceType, setServiceType] = useState('ClusterIP');
    const [envKey, setEnvKey] = useState('');
    const [envValue, setEnvValue] = useState('');
    const [environment, setEnvironment] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit({
                name,
                image,
                replicas,
                port: port ? Number(port) : undefined,
                image_pull_policy: imagePullPolicy,
                service_type: serviceType,
                environment
            });
            // Reset form
            setName('');
            setImage('');
            setReplicas(1);
            setPort('');
            setImagePullPolicy('IfNotPresent');
            setServiceType('ClusterIP');
            setEnvironment({});
        } catch (error) {
            // Error handled by parent
        } finally {
            setIsLoading(false);
        }
    };

    const addEnvVar = () => {
        if (envKey && envValue) {
            setEnvironment({ ...environment, [envKey]: envValue });
            setEnvKey('');
            setEnvValue('');
        }
    };

    const removeEnvVar = (key: string) => {
        const newEnv = { ...environment };
        delete newEnv[key];
        setEnvironment(newEnv);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Deployment">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Deployment Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="my-app"
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
                    <Input
                        label="Container Port"
                        type="number"
                        min={1}
                        max={65535}
                        value={port}
                        onChange={(e) => setPort(e.target.value ? parseInt(e.target.value) : '')}
                        placeholder="80"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Service Type
                        </label>
                        <select
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="ClusterIP">ClusterIP</option>
                            <option value="NodePort">NodePort</option>
                            <option value="LoadBalancer">LoadBalancer</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Environment Variables
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

                    {Object.entries(environment).length > 0 && (
                        <div className="mt-2 space-y-1">
                            {Object.entries(environment).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                    <span>{key}={value}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeEnvVar(key)}
                                        className="text-red-500 hover:text-red-700"
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
