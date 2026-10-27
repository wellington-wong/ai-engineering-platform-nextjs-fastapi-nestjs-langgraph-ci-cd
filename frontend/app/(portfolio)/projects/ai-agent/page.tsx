import type { Metadata } from 'next';
import DiscoveryAgent from './components/discovery-agent';

export const metadata: Metadata = { title: 'AI Agent' };

export default function AiAgentPage() {
  return <DiscoveryAgent />;
}
