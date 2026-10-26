import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RAGChat'
};

export default function RagChatPage() {
  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-lg lg:text-2xl font-medium mb-6">RAGChat</h1>
        <p className="mt-2 text-gray-500">
          Chat with answers grounded in your knowledge sources.
        </p>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          Connect a knowledge source to start a conversation.
        </p>
      </section>
    </div>
  );
}
