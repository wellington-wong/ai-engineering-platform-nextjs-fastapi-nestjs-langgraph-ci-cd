import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-gray-500">Full-Stack Engineer | AI & Automation</p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Wellington Wong</h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          With 15+ years of experience in software development, I build scalable web applications, SaaS platforms, and AI-powered solutions—from intuitive user interfaces and robust APIs to intelligent agents and automated workflows.
        </p>
      </header>

      <div className="mt-9 flex flex-wrap gap-3">
        <Link href="/projects" className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-5 py-3 font-medium text-white transition-colors hover:bg-gray-800">
          Explore My Work <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href="/#contact" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50">
          Get in Touch <Mail className="h-4 w-4" aria-hidden="true" />
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
