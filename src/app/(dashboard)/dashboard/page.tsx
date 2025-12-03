'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button, Loading } from '@/components';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface Stats {
  totalProjects: number;
  totalUsers: number;
  activeDeployments: number;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalUsers: 0,
    activeDeployments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects count
        const projects = await apiClient.getProjects(0, 100);
        setStats((prev) => ({
          ...prev,
          totalProjects: projects.length,
        }));
        setRecentProjects(projects.slice(0, 5));

        // Fetch users count
        const users = await apiClient.getUsers(0, 100);
        setStats((prev) => ({
          ...prev,
          totalUsers: users.length,
        }));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your projects</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 text-xl font-bold">
              📦
            </div>
            <p className="text-gray-600 text-sm mt-2">Total Projects</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.totalProjects}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600 text-xl font-bold">
              👥
            </div>
            <p className="text-gray-600 text-sm mt-2">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.totalUsers}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 text-purple-600 text-xl font-bold">
              🚀
            </div>
            <p className="text-gray-600 text-sm mt-2">Active Deployments</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.activeDeployments}
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card title="Recent Projects" subtitle="Your latest projects">
        {recentProjects.length > 0 ? (
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.description || 'No description'}
                  </p>
                </div>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No projects yet</p>
            <Link href="/projects">
              <Button variant="primary">Create Your First Project</Button>
            </Link>
          </div>
        )}
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center">
          <Link href="/projects">
            <Button variant="ghost">View All Projects →</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
