

'use client';


type ContainerMetrics = {
    cpu: {usagePercent: number;}
    memory: {usageBytes: number;}
    network: {rxBytes: number; txBytes: number;}
    blockIo: {readBytes: number; writeBytes: number;}
    pids: {current: number; limit: number;}
}

type Container = {
    id: string;




    name: string;
    image: string;
    state: string;
    status: string;
    metrics: ContainerMetrics | null;
}


type ContainerListProps = {
    containers: Container[];
};

function formatNetworkBytes(bytes: number) {
    const kilobytes = bytes / 1024;
    return kilobytes > 1000
        ? `${(kilobytes / 1024).toFixed(1)} MB`
        : `${kilobytes.toFixed(1)} kB`;
}

function formatBlockIoBytes(bytes: number) {
    const megabytes = bytes / 1024 / 1024;
    return megabytes > 1000
        ? `${(megabytes / 1024).toFixed(1)} GB`
        : `${megabytes.toFixed(1)} MB`;
}

export default function ContainerList({


                                          containers,
                                      }: ContainerListProps) {


    return (



        <section className="mt-6 rounded-xl border p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold">
                    Docker Containers
                </h2>

                <p className="text-sm text-gray-500">




                    Container status and runtime information
                </p>
            </div>


                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                        <tr className="border-b">
                            <th className="pb-3">Container</th>

                            <th className="pb-3">State</th>
                            <th className="pb-3">CPU</th>



                            <th className="pb-3">Memory</th>
                            <th className="pb-3">Net I/O</th>
                            <th className="pb-3">Block I/O</th>
                            <th className="pb-3">PIDS</th>
                            <th className="pb-3">Status</th>
                        </tr>
                        </thead>

                        <tbody>
                        {containers.map((container) => (

                            <tr

                                key={container.id}
                                className=" border-b last:border-0"
                            >
                                <td className="py-4 font-medium">
                                    {container.name}
                                </td>




                                <td className="py-4">
                                    <span
                                        className={


                                            container.state === 'running'
                                                ? 'font-medium'
                                                : 'text-gray-500'
                                        }
                                    >
                                        {container.state}
                                    </span>
                                </td>

                                <td className="py-4">
                                    {container.metrics
                                        ? `${container.metrics.cpu.usagePercent.toFixed(1)}%`
                                        : '—'}


                                </td>

                                <td className="py-4">
                                    {container.metrics
                                        ? `${(
                                            container.metrics.memory.usageBytes /
                                            1024 /
                                            1024

                                        ).toFixed(1)} MB`
                                        : '—'}
                                </td>

                                <td className="py-4">
                                    {container.metrics
                                        ? `${formatNetworkBytes(container.metrics.network.rxBytes)} / ${formatNetworkBytes(container.metrics.network.txBytes)}`
                                        : '—'}
                                </td>

                                <td className="py-4">
                                    {container.metrics
                                        ? `${formatBlockIoBytes(container.metrics.blockIo.readBytes)} / ${formatBlockIoBytes(container.metrics.blockIo.writeBytes)}`
                                        : '—'}
                                </td>

                                <td className="py-4">
                                    {container.metrics
                                        ? `${container.metrics.pids.current} / ${container.metrics.pids.limit}`
                                        : '—'}
                                </td>

                                <td className="py-4 text-gray-500">
                                    {container.status}
                                </td>

                            </tr>
                        ))}







                        </tbody>
                    </table>
                </div>




        </section>
    );
}
