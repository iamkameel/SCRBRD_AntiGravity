import type { Metadata } from 'next';
import { Inter, Inter_Tight, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Providers from '@/components/layout/Providers';
import { PermissionViewProvider } from '@/contexts/PermissionViewContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { AppShell } from "@/components/layout/AppShell";

// Design 2.0 §11 — three faces, three jobs. No other typefaces load.
// Display: Inter Tight — headings, scores, KPIs. Tight tracking at size.
const display = Inter_Tight({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

// Body and UI: Inter — copy, controls, labels.
const body = Inter({
  variable: '--font-body-face',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

// Data: Geist Mono — numerics, tables, live feeds. Tabular by default.
const data = Geist_Mono({
  variable: '--font-data',
  subsets: ['latin'],
  weight: ['400', '500'],
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
    // Font variables go on <html>, not <body>: globals.css derives --font-head
    // and friends on :root, and a custom property resolves var() on the element
    // that declares it. On <body> the next/font faces were never reached and
    // every heading fell back to the system font.
    <html lang="en" className={`${display.variable} ${body.variable} ${data.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <PermissionViewProvider>
              <DashboardProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="dark"
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
