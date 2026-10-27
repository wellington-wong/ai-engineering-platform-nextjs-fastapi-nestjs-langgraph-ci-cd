'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Activity, AppWindow, ArrowUpRight, BriefcaseBusiness, ChevronRight, CodeXml, House, Menu, Mail } from 'lucide-react';
import { Header } from '../(dashboard)/layout';

export default function AppsLayout({
                                          children
                                        }: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: '/', icon: House, label: 'Home' },
    { href: '/expertise', icon: CodeXml, label: 'Expertise' },
    { href: '/projects', icon: BriefcaseBusiness, label: 'Projects' },
    { href: '/projects/ai-agent', icon: ChevronRight, label: 'AI Agent', nested: true },

    { href: 'https://ragchat.wellington.codes', icon: ChevronRight, label: 'RAG Chat', target: '_blank', nested: true },
    { href: '/projects/automation', icon: ChevronRight, label: 'Automation', nested: true },
    { href: '/projects/ml-monitoring', icon: ChevronRight, label: 'ML Monitoring', nested: true },
    { href: '/projects/ai-notes-summarizer', icon: ChevronRight, label: 'AI Notes Summarizer', nested: true },
    { href: '/projects/saas-platforms', icon: AppWindow, label: 'SaaS Platforms' },
    { href: 'https://referrals.wellington.codes', icon: ChevronRight, label: 'Laravel', target: '_blank', nested: true },
    { href: 'https://saas.wellington.codes', icon: ChevronRight, label: 'Nuxt + .NET', target: '_blank', nested: true },
    { href: '/contact-me', icon: Mail, label: 'Contact me' },
  ];

  return (
    <>
      <Header saasMode={false} />
      <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">

        <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">


          <div className="flex items-center">
            <span className="font-medium">Settings</span>
          </div>
          <Button
              className="-mr-3"
              variant="ghost"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden h-full">
          {/* Sidebar */}
          <aside
              className={`w-64 bg-[#F5F2ED] lg:bg-[#F5F2ED] border-r border-gray-200 lg:block ${
                  isSidebarOpen ? 'block' : 'hidden'
              } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                  isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
          >
            <nav className="h-full overflow-y-auto p-4">
              {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}


                    target={item?.target}
                    aria-current={
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? 'page'
                        : undefined
                    }
                    passHref
                  >
                    <Button
                        variant={
                          pathname === item.href || pathname.startsWith(`${item.href}/`)
                            ? 'secondary'
                            : 'ghost'
                        }
                        className={`shadow-none my-1 w-full justify-start cursor-pointer ${
                          pathname === item.href || pathname.startsWith(`${item.href}/`)
                          ? 'bg-[#F5F2ED] font-bold text-gray-950'
                            : ''
                        } ${item.nested ? 'ml-4 w-[calc(100%-1rem)] text-sm' : ''}`}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon className={"h-3 w-3 " + (item.nested?'opacity-15':'')} />
                      {item.label}{item.target&&<ArrowUpRight />}
                    </Button>
                  </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
        </div>
      </div>
    </>
  );
}
