import type { Metadata } from 'next';
import ObservabilityPage from '../../../observability/observability';

export const metadata: Metadata = {
  title: 'VPS Monitoring'
};

export default function MonitoringPage() {
  return <ObservabilityPage />;
}
