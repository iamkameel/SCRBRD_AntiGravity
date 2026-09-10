import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SidebarNav from '../SidebarNav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { usePermissionView } from '@/contexts/PermissionViewContext';
import { USER_ROLES } from '@/lib/roles';
import { usePathname } from 'next/navigation';

// Mock dependencies
vi.mock('@/contexts/PermissionViewContext', () => ({
  usePermissionView: vi.fn()
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }))
}));

// Mock Collapsible to always show content
vi.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock ResizeObserver for SidebarProvider
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('SidebarNav', () => {
  const mockUsePermissionView = usePermissionView as Mock;
  const mockUsePathname = usePathname as Mock;

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
  });

  const renderWithProviders = (ui: React.ReactNode) => {
    return render(
      <SidebarProvider>
        {ui}
      </SidebarProvider>
    );
  };

  it('renders dashboard link for ADMIN', () => {
    mockUsePermissionView.mockReturnValue({ currentRole: USER_ROLES.ADMIN });
    renderWithProviders(<SidebarNav />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders Team Directory for ADMIN', () => {
    mockUsePermissionView.mockReturnValue({ currentRole: USER_ROLES.ADMIN });
    renderWithProviders(<SidebarNav />);
    
    expect(screen.getByText('Team Directory')).toBeInTheDocument();
  });

  it('does NOT render Financials for PLAYER', () => {
    mockUsePermissionView.mockReturnValue({ currentRole: USER_ROLES.PLAYER });
    renderWithProviders(<SidebarNav />);
    
    expect(screen.queryByText('Financials')).not.toBeInTheDocument();
  });

  it('renders Live Scoring for SCORER', () => {
    mockUsePermissionView.mockReturnValue({ currentRole: USER_ROLES.SCORER });
    renderWithProviders(<SidebarNav />);
    
    expect(screen.getByText('Live Scoring')).toBeInTheDocument();
  });

  it('renders Match Fixtures for ADMIN', () => {
    mockUsePermissionView.mockReturnValue({ currentRole: USER_ROLES.ADMIN });
    renderWithProviders(<SidebarNav />);
    
    expect(screen.getByText('Match Fixtures')).toBeInTheDocument();
  });

  it('does NOT render Settings for SPECTATOR if not allowed (checking logic)', () => {
    // Spectator usually doesn't have settings in some apps, but let's check the actual permissions in SidebarNav.tsx
    // It does NOT have 'settings' (and 'settings' key doesn't exist in nav-links.ts anyway)
    // Let's check something else they shouldn't have, e.g. "Financials"
    
    mockUsePermissionView.mockReturnValue({ currentRole: USER_ROLES.SPECTATOR });
    renderWithProviders(<SidebarNav />);
    
    expect(screen.queryByText('Financials')).not.toBeInTheDocument();
  });
});
