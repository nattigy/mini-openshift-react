import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookie from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Add token to requests
    this.client.interceptors.request.use((config: any) => {
      const token = Cookie.get('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: AxiosError) => {
        console.error('API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          code: error.code,
        });

        if (error.response?.status === 401) {
          // Clear token and redirect to login
          Cookie.remove('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await this.client.post('/login/access-token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.access_token) {
        Cookie.set('access_token', response.data.access_token, { expires: 7 });
      }
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // User endpoints
  async getUsers(skip: number = 0, limit: number = 100) {
    const response = await this.client.get('/users/', {
      params: { skip, limit },
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async createUser(data: { email: string; username: string; password: string }) {
    const response = await this.client.post('/users/', data);
    return response.data;
  }

  async updateUser(userId: string, data: { username?: string; email?: string; role?: string }) {
    const response = await this.client.put(`/users/${userId}`, data);
    return response.data;
  }

  async getUser(userId: string) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await this.client.delete(`/users/${userId}`);
    return response.data;
  }

  async searchUsers(query: string, skip: number = 0, limit: number = 100) {
    const response = await this.client.get('/users/', {
      params: { q: query, skip, limit },
    });
    return response.data;
  }

  async changePassword(userId: string, data: { old_password: string; new_password: string }) {
    const response = await this.client.post(`/users/${userId}/change-password`, data);
    return response.data;
  }

  // Project endpoints
  async getProjects(skip: number = 0, limit: number = 100) {
    const response = await this.client.get('/projects/', {
      params: { skip, limit },
    });
    return response.data;
  }

  async searchProjects(query: string, skip: number = 0, limit: number = 100) {
    const response = await this.client.get('/projects/', {
      params: { q: query, skip, limit },
    });
    return response.data;
  }

  async createProject(data: { name: string; description?: string }) {
    const response = await this.client.post('/projects/', data);
    return response.data;
  }

  async deleteProject(projectId: string) {
    const response = await this.client.delete(`/projects/${projectId}`);
    return response.data;
  }

  async getProject(projectId: string) {
    const response = await this.client.get(`/projects/${projectId}`);
    return response.data;
  }

  async updateProject(projectId: string, data: { name?: string; description?: string; status?: string }) {
    const response = await this.client.put(`/projects/${projectId}`, data);
    return response.data;
  }

  // Deployment endpoints
  async getDeployments(projectId: string, skip: number = 0, limit: number = 100) {
    const response = await this.client.get(`/projects/${projectId}/deployments/`, {
      params: { skip, limit },
    });
    return response.data;
  }

  async getDeployment(projectId: string, deploymentName: string) {
    const response = await this.client.get(`/projects/${projectId}/deployments/${deploymentName}`);
    return response.data;
  }

  async createDeployment(projectId: string, data: { name: string; image: string; replicas?: number; environment?: Record<string, string> }) {
    const response = await this.client.post(`/projects/${projectId}/deployments/`, data);
    return response.data;
  }

  async updateDeployment(projectId: string, deploymentName: string, data: { image?: string; replicas?: number; environment?: Record<string, string> }) {
    const response = await this.client.put(`/projects/${projectId}/deployments/${deploymentName}`, data);
    return response.data;
  }

  async scaleDeployment(projectId: string, deploymentName: string, replicas: number) {
    const response = await this.client.patch(`/projects/${projectId}/deployments/${deploymentName}/scale`, { replicas });
    return response.data;
  }

  async deleteDeployment(projectId: string, deploymentName: string) {
    const response = await this.client.delete(`/projects/${projectId}/deployments/${deploymentName}`);
    return response.data;
  }

  // Pod endpoints
  async getPods(projectId: string, labelSelector?: string) {
    const response = await this.client.get(`/projects/${projectId}/pods/`, {
      params: { label_selector: labelSelector },
    });
    return response.data;
  }

  async getPod(projectId: string, podName: string) {
    const response = await this.client.get(`/projects/${projectId}/pods/${podName}`);
    return response.data;
  }

  async deletePod(projectId: string, podName: string) {
    const response = await this.client.delete(`/projects/${projectId}/pods/${podName}`);
    return response.data;
  }

  async getPodLogs(projectId: string, podName: string, container?: string, tailLines: number = 100) {
    const response = await this.client.get(`/projects/${projectId}/pods/${podName}/logs`, {
      params: { container, tail_lines: tailLines },
    });
    return response.data;
  }
}

export const apiClient = new APIClient();
