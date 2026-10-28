import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Projects',
};

const projects = [
  { href: '/projects/ai-agent', title: 'AI Agent', description: 'An assistant workflow for discovering and working with information.' },
  { href: 'https://ragchat.wellington.codes', title: 'RAGChat', description: 'A retrieval augmented chat experience.' },
  { href: '/projects/automation', title: 'Automation', description: 'Workflow automation built with n8n.' },
  { href: '/projects/ml-monitoring', title: 'ML Monitoring', description: 'A monitoring dashboard for machine learning systems.' },
  { href: '/projects/ai-notes-summarizer', title: 'AI Notes Summarizer', description: 'Tools for summarizing and working with notes.' },
];

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">

      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-gray-500">Selected work</p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">AI Projects</h1>
        <p className="mt-3 max-w-2xl text-gray-600">A selection of experiments and applications across AI, automation, and software engineering.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Link key={project.href} href={project.href} target={project.href.startsWith('http') ? '_blank' : undefined} className="rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-400">
            <h2 className="font-semibold text-gray-950">{project.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{project.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
