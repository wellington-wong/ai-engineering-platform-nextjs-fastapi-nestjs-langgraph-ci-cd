
'use client';



import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,

} from 'recharts';

type SystemMetric = {
    timestamp: string;
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    diskUsagePercent: number;
}


type SystemMetricsChartProps = {
    data: SystemMetric[];
}

export default function SystemMetricsChart({
                                               data,
                                           }: SystemMetricsChartProps) {
    const chartData = data.map((metric) => ({


        ...metric,
        time: new Date(metric.timestamp).toLocaleTimeString(),
    }));

    return (
        <div className="rounded-xl border p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold">
                    System Metrics

                </h2>

                <p className="text-sm text-gray-500">
                    CPU, memory, and disk usage
                </p>
            </div>

            <div className="h-80 w-full">


                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3"/>


                        <XAxis dataKey="time"/>


                        <YAxis
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                        />

                        <Tooltip
                            formatter={(value) =>
                                `${Number(value).toFixed(1)}%`
                            }

                        />

                        <Line
                            type="monotone"
                            dataKey="cpuUsagePercent"
                            name="CPU"
                            dot={false}
                        />


                        <Line
                            type="monotone"
                            dataKey="memoryUsagePercent"
                            name="Memory"
                            dot={false}
                        />

                        <Line


                            type="monotone"
                            dataKey="diskUsagePercent"
                            name="Disk"
                            dot={false}
                        />

                    </LineChart>


                </ResponsiveContainer>
            </div>
        </div>
    );
}