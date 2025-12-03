export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  role: 'admin' | 'developer' | string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
}

export interface Deployment {
  name: string;
  namespace: string;
  replicas: number;
  available_replicas: number;
  image: string;
  created_at: string;
  labels: Record<string, string>;
  status: 'Available' | 'Progressing' | 'ReplicaFailure' | 'Unknown';
}

export interface DeploymentCreate {
  name: string;
  image: string;
  replicas?: number;
  environment?: Record<string, string>;
}

export interface Pod {
  name: string;
  namespace: string;
  status: string;
  ip?: string;
  node?: string;
  start_time?: string;
  labels: Record<string, string>;
  containers: ContainerStatus[];
  conditions: PodCondition[];
}

export interface ContainerStatus {
  name: string;
  state: string;
  ready: boolean;
  restart_count: number;
  image: string;
}

export interface PodCondition {
  type: string;
  status: string;
  last_transition_time: string;
  reason?: string;
  message?: string;
}

export interface ApiError {
  detail: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
