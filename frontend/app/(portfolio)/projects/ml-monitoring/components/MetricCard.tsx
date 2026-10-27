type MetricCardProps = {
    title: string;
    value: number;

    unit: string;
};

export default function MetricCard({
                                       title,
                                       value,
                                       unit,
                                   }: MetricCardProps) {
    return (

        <div className="rounded-xl border p-6">
            <p className="text-sm text-gray-500">{title}</p>

            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold">
                    {value.toFixed(1)}
                </span>

                <span className="text-sm text-gray-500">

                    {unit}
                </span>
            </div>
        </div>
    );
}