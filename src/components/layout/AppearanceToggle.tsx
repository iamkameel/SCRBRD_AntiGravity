'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function AppearanceToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return <button type="button" aria-label="Toggle light and dark mode" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-secondary"><Sun size={18} className="dark:hidden"/><Moon size={18} className="hidden dark:block"/></button>;
}
