"use client";

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PodsPage from '@/components/pages/PodsPage';

export default function ProjectPods() {
    const params = useParams();
    const projectId = params.projectId as string;

    return (
        <DashboardLayout>
            <PodsPage projectId={projectId} />
        </DashboardLayout>
    );
}
