'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';

import { AdminSidebar, AdminSidebarMobile } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AdminSidebarProvider, useAdminSidebar } from '@/lib/sidebar-context';
import { AdminBreadcrumbs } from './_components/admin-breadcrumbs';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminSidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminSidebarProvider>
  );
}

function AdminLayoutInner({ children }: AdminLayoutProps) {
  const { collapsed } = useAdminSidebar();
  const sidebarOffset = React.useMemo(
    () => (collapsed ? '4rem' : '15rem'),
    [collapsed]
  );
  const contentOffset =
    'md:ml-[var(--admin-content-offset)] lg:ml-[var(--admin-content-offset)]';

  return (
    <div className="flex min-h-screen w-full bg-muted/10">
      <AdminSidebar className="fixed inset-y-0 left-0 z-40 hidden h-screen md:flex" />

      <div
        className={cn(
          'flex min-h-screen flex-1 flex-col transition-[margin] duration-300 ease-in-out',
          contentOffset
        )}
        style={
          { '--admin-content-offset': sidebarOffset } as React.CSSProperties
        }
      >
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4 md:px-6 md:pl-2">
          <div className="flex items-center gap-2 md:hidden">
            <AdminSidebarMobile />
            <span className="text-sm font-medium text-muted-foreground">
              Admin
            </span>
          </div>

          <SidebarDesktopToggle />

          <div className="flex min-w-0 flex-1 items-center gap-2 md:col-start-2 md:col-end-3 md:ml-2">
            <Suspense
              fallback={
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              }
            >
              <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                <AdminBreadcrumbs />
              </div>
            </Suspense>
          </div>

          <div className="hidden items-center gap-2 md:col-start-3 md:flex md:justify-end">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 flex-col px-4 py-6 lg:px-8">
          <section className="flex-1 rounded-xl border border-border/60 bg-background/80 p-6 shadow-sm">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}

function SidebarDesktopToggle() {
  const { collapsed, toggleCollapsed } = useAdminSidebar();

  return (
    <div className="hidden md:col-start-1 md:flex md:items-center md:justify-start">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 items-center justify-center text-muted-foreground transition-transform hover:text-foreground"
            onClick={toggleCollapsed}
            aria-controls="admin-sidebar"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={!collapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Switch
      aria-label="Toggle theme"
      checked={mounted && resolvedTheme === 'dark'}
      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      disabled={!mounted}
    />
  );
}
