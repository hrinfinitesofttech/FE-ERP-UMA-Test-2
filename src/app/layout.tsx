import type { Metadata } from 'next';
import './globals.css';
import { ERPProvider } from '@/context/ERPContext';
import { ClientThemeProvider } from '@/components/theme/ClientThemeProvider';
import { AppShell } from '@/components/layout/AppShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Uma Techno Fab - Enterprise Make-to-Order ERP',
  description: 'Integrated MTO Manufacturing & Job Traceability ERP System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full overflow-hidden crm-app font-sans">
        <ClientThemeProvider clientThemeId="umaTechnoFab">
          <ERPProvider>
            <AppShell>{children}</AppShell>
          </ERPProvider>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
