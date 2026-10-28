import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-gray-500">A little about me</p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">About</h1>
      </header>
      <section className="max-w-3xl rounded-xl border border-gray-200 bg-white p-6 lg:p-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-950">Hi, I’m Wellington.</h2>
        <p className="leading-7 text-gray-600">I’m a software developer interested in building useful products with AI, automation, and modern web technology. This portfolio is a collection of projects exploring those ideas, from AI powered assistants to workflow automation and monitoring tools.</p>
        <p className="mt-4 leading-7 text-gray-600">I enjoy taking a problem from an early idea through to a working product, with care for both the experience people use and the systems behind it.</p>
        <Link href="/projects" className="mt-6 inline-flex font-medium text-gray-900 underline underline-offset-4">Explore my projects</Link>
      </section>
    </div>
  );
}
