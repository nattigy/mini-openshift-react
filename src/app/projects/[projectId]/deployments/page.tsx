"use client";

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DeploymentsPage from '@/components/pages/DeploymentsPage';

export default function ProjectDeployments() {
    const params = useParams();
    const projectId = params.projectId as string;

    return (
        <DashboardLayout>
            <DeploymentsPage projectId={projectId} />
        </DashboardLayout>
    );
}
