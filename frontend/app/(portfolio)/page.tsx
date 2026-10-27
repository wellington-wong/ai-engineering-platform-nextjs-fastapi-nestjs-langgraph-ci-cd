import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-gray-500">Full-Stack Engineer | AI & Automation</p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Wellington Wong</h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Full-Stack Engineer with 15+ years of experience building scalable web applications, SaaS platforms, APIs, and mobile apps. Proficient in agentic AI, machine learning, and automation, with hands-on experience developing AI-powered applications and ML solutions using RAG, embeddings, semantic search, LLM APIs, neural networks, and PyTorch-based deep learning. Experienced with LangChain, LangGraph, n8n, and prompt engineering.
        </p>


        <p className="mt-3 max-w-2xl text-gray-600">
          Expertise across React, Next.js, Angular, Node.js, FastAPI, .NET, Laravel, WordPress, and React Native, with experience in end-to-end product development, cloud deployment, and CI/CD. Experienced with Docker, AWS, Cloudflare, and Vercel, with a focus on performance, scalability, security, and maintainable solutions.
        </p>
      </header>

      <div className="mt-9 flex flex-wrap gap-3">
        <Link href="/projects" className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-5 py-3 font-medium text-white transition-colors hover:bg-gray-800">
          Explore My Work <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
        <Link href="/expertise" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50">
          Expertise <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>

      <section id="contact" className="scroll-mt-8 border-t border-gray-200 py-10 mt-10">
        <h2 className="text-xl font-semibold text-gray-950">Get in touch</h2>
        <p className="mt-2 text-gray-600">Have a project in mind? I’d be happy to hear from you.</p>
        <Link href="/contact-me" className="mt-4 inline-flex font-medium text-gray-900 underline underline-offset-4">Contact me</Link>
      </section>
    </div>
  );
}
