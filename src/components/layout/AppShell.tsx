"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Navbar } from "@/components/layout/Navbar";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Loader2 } from "lucide-react";
import { useSidebar, SidebarProvider } from "@/components/ui/sidebar";
import { BackgroundEffects } from "@/components/layout/BackgroundEffects";
import { CommandMenu } from "@/components/dashboard/CommandMenu";
import { cn } from "@/lib/utils";
function AppShellContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex min-h-screen w-full relative bg-background text-foreground font-sans antialiased">
      <BackgroundEffects />
      <Sidebar />
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out relative z-10 min-h-screen pb-12",
          isCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"
        )}
      >
        <Header />
        <EmailVerificationBanner />
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          <Breadcrumbs />
          {children}
        </div>
        <CommandMenu />
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  // Public pages should never have sidebar
  const publicPages = ['/', '/login', '/signup'];
  const isPublicPage = publicPages.includes(pathname);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Landing page or not logged in - show navbar only
  if (!user || isPublicPage) {
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
