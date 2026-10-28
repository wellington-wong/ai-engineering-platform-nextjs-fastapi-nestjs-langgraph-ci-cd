import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Me",
};

export default function ContactMePage() {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-gray-500">Let’s talk</p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Contact me</h1>
        <p className="mt-3 max-w-2xl text-gray-600">Have a project idea or want to talk about software, AI, or automation? Send me a note.</p>
      </header>
      <section className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6">
        <Mail className="mb-5 h-6 w-6 text-gray-800" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-gray-950">Email</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">The quickest way to reach me is by email.</p>
        <Link href="mailto:me@wellington.codes" className="mt-5 inline-flex items-center gap-2 font-medium text-gray-900 underline underline-offset-4">
          me@wellington.codes <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
