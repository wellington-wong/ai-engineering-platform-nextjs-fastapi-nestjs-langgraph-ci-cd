import Image from "next/image";

export default function HomePage() {
    return (
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-lg lg:text-2xl font-medium mb-6">Automation Workflow - n8n</h1>
            </header>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <Image src="/images/n8n-workflow-automation.png" width="1697" height="588" alt="Automation Workflow - n8n" />
            </section>
        </div>
    );
}
