'use client';
import MetricCard from '@/app/(projects)/apps/ml-monitoring/components/MetricCard';



import { useEffect, useState } from 'react';
import SystemMetricsChart from '@/app/(projects)/apps/ml-monitoring/components/SystemMetricsChart';
import ContainerList from '@/app/(projects)/apps/ml-monitoring/components/ContainerList';

type SystemMetric = {
    timestamp: string;
    cpuUsagePercent: number;
    memoryUsagePercent: number;

    diskUsagePercent: number;
};

type ContainerMetrics = {
    cpu: { usagePercent: number; }
    memory: { usageBytes: number; }
    network: { rxBytes: number; txBytes: number; }
    blockIo: { readBytes: number; writeBytes: number; }
    pids: { current: number; limit: number; }
}

type Container = {
    id: string;
    name: string;
    image: string;
    state: string;
    status: string;

    metrics: ContainerMetrics | null;
}

export default function ObservabilityPage() {
    const [metrics, setMetrics] = useState<SystemMetric[]>([]);

    const [ containers, setContainers ] = useState<Container[]>([]);


    useEffect(() => {
        async function fetchDashboardData() {
            try {


                const [systemResponse, dockerResponse] =
                    await Promise.all([
                        fetch(`${process.env.NEXT_PUBLIC_API_OBSERVABILITY}/metrics/system`),
                        fetch(`${process.env.NEXT_PUBLIC_API_OBSERVABILITY}/docker/containers/metrics`),
                    ]);


                if (!systemResponse.ok) {
                    throw new Error('Failed to fetch system metrics');
                }

                if (!dockerResponse.ok) {
                    throw new Error('Failed to fetch Docker metrics');
                }

                const [systemData, dockerData] =

                    await Promise.all([
                        systemResponse.json(),
                        dockerResponse.json(),
                    ]);

                setMetrics(systemData);
                setContainers(dockerData);
            } catch (error) {
                console.error(
                    'Failed to fetch dashboard data:',

                    error,
                );
            }
        }


        fetchDashboardData();

        const interval = setInterval(
            fetchDashboardData,
            10000,
        );


        return () => clearInterval(interval);
    }, []);


    const latest = metrics.at(-1);

    return (
        <main className="min-h-screen p-8">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8">
                    <h1 className="text-lg lg:text-2xl font-medium mb-6">
                        VPS System Overview
                    </h1>




                </header>


                <section className="grid gap-4 md:grid-cols-3">
                    <MetricCard
                        title="CPU"
                        value={latest?.cpuUsagePercent ?? 0}
                        unit="%"
                    />


                    <MetricCard

                        title="Memory"
                        value={latest?.memoryUsagePercent ?? 0}

                        unit="%"
                    />

                    <MetricCard
                        title="Disk"
                        value={latest?.diskUsagePercent ?? 0}


                        unit="%"
                    />
                </section>

                <section className="mt-6">
                    <SystemMetricsChart data={metrics} />
                </section>



                <ContainerList containers={containers} />

            </div>
        </main>
    );


}
