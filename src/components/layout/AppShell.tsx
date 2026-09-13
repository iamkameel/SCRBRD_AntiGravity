"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { BottomNav } from "./BottomNav";
import { Header } from "@/components/layout/Header";
import { Navbar } from "@/components/layout/Navbar";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useSidebar, SidebarProvider } from "@/components/ui/sidebar";
import { BackgroundEffects } from "@/components/layout/BackgroundEffects";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// cmdk is ~180 KB; only fetch it the first time someone actually opens the palette.
const CommandMenu = dynamic(() => import("@/components/dashboard/CommandMenu").then(m => m.CommandMenu), { ssr: false });

function LazyCommandMenu() {
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (requested) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setRequested(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [requested]);

  return requested ? <CommandMenu defaultOpen /> : null;
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex min-h-screen w-full relative bg-background text-foreground font-sans antialiased">
      <BackgroundEffects />
      <Sidebar />
      <BottomNav />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:p-3 focus:text-primary-foreground">Skip to content</a>
      <main 
        className={cn(
          "min-w-0 flex-1 transition-all duration-300 ease-in-out relative z-10 min-h-screen pb-28 md:pb-12",
          isCollapsed ? "md:ml-[80px]" : "md:ml-[260px]"
        )}
      >
        <Header />
        <EmailVerificationBanner />
        <div id="main-content" tabIndex={-1} className="mx-auto max-w-[1600px] p-4 sm:p-6 xl:p-8 space-y-6 outline-none">
          <Breadcrumbs />
          {children}
        </div>
        <LazyCommandMenu />
      </main>
    </div>
  );
}

const PUBLIC_PAGES = ['/', '/login', '/signup', '/forgot-password'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = PUBLIC_PAGES.includes(pathname);

  // On the root landing page: render without any shell chrome (owns its own nav + bg)
  if (pathname === '/') {
    return (
      <div className="flex-1 relative z-10">{children}</div>
    );
  }

  // Auth pages (login/signup) - clean, no sidebar, no nav chrome
  if (isPublicPage) {
    return (
      <div className="flex min-h-screen flex-col relative bg-background text-foreground font-sans antialiased">
        <BackgroundEffects />
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
      </div>
    );
  }

  // Authenticated users on app pages - show responsive sidebar
  return (
    <SidebarProvider>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  );
}
