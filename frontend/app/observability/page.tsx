




import type { Metadata } from 'next';
import ObservabilityPage from '@/app/projects/ml-monitoring/observability'

export const metadata: Metadata = {
    title: 'VPS Observability',
}





export default function Page() {
    return <ObservabilityPage/>
}