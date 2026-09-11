import type { Metadata } from 'next';
import { Syne, DM_Mono, DM_Sans, Open_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Providers from '@/components/layout/Providers';
import { PermissionViewProvider } from '@/contexts/PermissionViewContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { AppShell } from "@/components/layout/AppShell";

// UIX Spec §3.1: Syne — main high-impact headers
const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
});

// Open Sans — clean UI, subheadings, interface controls
const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// UIX Spec §3.1: DM Mono — all numeric/data values
const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

// UIX Spec §3.1: DM Sans — body copy
const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SCRBRD Beta - Cricket Management',
  description: 'Manage cricket teams, players, matches, and more with SCRBRD Beta.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${openSans.variable} ${dmMono.variable} ${dmSans.variable} font-sans antialiased bg-background text-foreground`} suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <PermissionViewProvider>
              <DashboardProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <AppShell>
                    {children}
                  </AppShell>
                </ThemeProvider>
              </DashboardProvider>
            </PermissionViewProvider>
          </AuthProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
