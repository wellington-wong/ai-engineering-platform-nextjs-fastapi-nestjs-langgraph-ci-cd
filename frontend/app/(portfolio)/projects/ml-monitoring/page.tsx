import type { Metadata } from 'next';
import ObservabilityPage from './observability';

export const metadata: Metadata = {
  title: 'ML Monitoring'
};

export default function MonitoringPage() {
  return <ObservabilityPage />;
}
