import React, { useEffect, useState } from 'react';
import { Modal, Button, Loading } from './';
import { apiClient } from '../services/api';
import CreateDeploymentModal from './CreateDeploymentModal';

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<Props> = ({ projectId, isOpen, onClose }) => {
  const [project, setProject] = useState<any | null>(null);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const p = await apiClient.getProject(projectId);
      setProject(p);
      const deps = await apiClient.getDeployments(projectId);
      setDeployments(deps || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, projectId]);

  const onCreated = (d: any) => {
    setDeployments(prev => [d, ...prev]);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Project Details" size="lg">
        {loading && <Loading />}
        {!loading && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{project?.name}</h3>
              <p className="text-sm text-gray-500">{project?.description}</p>
              <p className="text-xs text-gray-400">Owner: {project?.owner?.username || '—'}</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Deployments</h4>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => setShowCreate(true)}>Create Deployment</Button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {deployments.length === 0 && <p className="text-sm text-gray-500">No deployments yet.</p>}
                {deployments.map(d => (
                  <div key={d.id} className="p-3 border rounded-md flex items-center justify-between">
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-gray-500">Image: {d.image} • Replicas: {d.replicas}</div>
                    </div>
                    <div className="text-xs text-gray-400">Status: {d.status || 'unknown'}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </Modal>

      <CreateDeploymentModal projectId={projectId} isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={onCreated} />
    </>
  );
};

export default ProjectDetailModal;
