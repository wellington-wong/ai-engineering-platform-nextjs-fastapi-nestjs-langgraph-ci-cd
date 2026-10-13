import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DockerService } from '../docker/docker.service.js';

import { SystemMetricsService } from '../system/system-metrics.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { HealthService } from '../health/health.service.js';
import { MonitorsService } from '../monitors/monitors.service.js';
@Injectable()
export class CollectorService {
  private readonly logger = new Logger(CollectorService.name);

  constructor(
    private readonly dockerService: DockerService,
    private readonly systemMetricsService: SystemMetricsService,

    private readonly prisma: PrismaService,
    private readonly healthService: HealthService,
    private readonly monitorsService: MonitorsService,
  ) {}

  @Cron('*/10 * * * * *')
  async collect() {

    const systemMetrics = await this.systemMetricsService.getMetrics();
    await this.prisma.systemMetric.create({
      data: {

        cpuUsagePercent: systemMetrics.cpu.usagePercent ?? 0,
        memoryUsagePercent: systemMetrics.memory.usagePercent,

        diskUsagePercent: systemMetrics.disk.usagePercent,
        uptimeSeconds: systemMetrics.uptimeSeconds,
      },
    });

    const containers = await this.dockerService.getContainers();

    const containerMetrics = [];

    for (const container of containers) {
      if (container.state !== 'running') {
        continue;

      }
      const metrics = await this.dockerService.getContainerMetrics(
        container.id,

      );

      await this.prisma.containerMetric.create({
        data: {
          containerId: metrics.containerId,

          containerName: metrics.name,
          cpuUsagePercent: metrics.cpu.usagePercent,
          memoryUsageBytes: metrics.memory.usageBytes,
          memoryLimitBytes: metrics.memory.limitBytes,
          networkRxBytes: metrics.network.rxBytes,
          networkTxBytes: metrics.network.txBytes,
          blockIoReadBytes: metrics.blockIo.readBytes,
          blockIoWriteBytes: metrics.blockIo.writeBytes,


          pidsCurrent: metrics.pids.current,
          pidsLimit: metrics.pids.limit,
        },
      });

      containerMetrics.push(metrics);
    }


    const monitors = await this.monitorsService.getEnabledMonitors();
    for (const monitor of monitors) {
      const result = await this.healthService.check(
        monitor.url,
      )

      this.logger.debug(`Health check: ${monitor.name} - ${result.healthy}`,);


      await this.monitorsService.createHealthCheck(
        monitor.id,
        result,
      );
    }

    this.logger.log(

      JSON.stringify({
        system: systemMetrics,
        containers: containerMetrics,
      }),
    );
  }
}