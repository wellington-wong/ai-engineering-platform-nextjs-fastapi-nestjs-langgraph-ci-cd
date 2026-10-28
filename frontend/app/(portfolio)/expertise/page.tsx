import { Activity, Bot, Workflow } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expertise',
};

const areas = [
  {
    icon: Bot,
    title: 'Applied AI',
    description: 'Building practical AI experiences, from agent workflows to retrieval augmented generation and tools that make information easier to use.',
  },
  {
    icon: Workflow,
    title: 'Automation',
    description: 'Connecting services and streamlining repeatable work with thoughtful, observable automation workflows.',
  },
  {
    icon: Activity,
    title: 'Full stack engineering',
    description: 'Designing and shipping web applications with a focus on useful interfaces, reliable APIs, and operational visibility.',
  },
];

export default function ExpertisePage() {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-gray-500">What I do</p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Expertise</h1>
        <p className="mt-3 max-w-2xl text-gray-600">I build software that brings AI, automation, and dependable engineering together to solve real problems.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {areas.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-xl border border-gray-200 bg-white p-6">
            <Icon className="mb-5 h-6 w-6 text-gray-800" aria-hidden="true" />
            <h2 className="mb-2 text-lg font-semibold text-gray-950">{title}</h2>
            <p className="text-sm leading-6 text-gray-600">{description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
