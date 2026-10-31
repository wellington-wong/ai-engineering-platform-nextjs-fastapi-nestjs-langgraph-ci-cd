import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';

import { useEffect } from 'react';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import Clarity from '@microsoft/clarity';

export const metadata: Metadata = {
  title: { default: 'Wellington Wong — Full-Stack Engineer | AI & Automation', template: "%s | Wellington.Codes" },
  description: 'Next.js + Vercel'


}
export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

function ClarityInit() {
  useEffect(() => {
  
  
    Clarity.init("wisod5y80f");
  }, []);

  return null;
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {

  Clarity.init("wisod5y80f");

  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-[#F5F2ED]">
          
        
        <ClarityInit />        
        <SWRConfig  
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
