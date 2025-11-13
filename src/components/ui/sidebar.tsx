'use client';

import * as React from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Slot } from '@radix-ui/react-slot';
import { VariantProps, cva } from 'class-variance-authority';
import {
  Calendar,
  Home,
  House,
  Image as ImageIcon,
  LogOut,
  Menu as MenuIcon,
  PanelLeft,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useAdminSidebar } from '@/lib/sidebar-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '15rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContext = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === 'function' ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open]
    );

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleSidebar]);

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? 'expanded' : 'collapsed';

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                '--sidebar-width': SIDEBAR_WIDTH,
                '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }
);
SidebarProvider.displayName = 'SidebarProvider';

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    side?: 'left' | 'right';
    variant?: 'sidebar' | 'floating' | 'inset';
    collapsible?: 'offcanvas' | 'icon' | 'none';
  }
>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (collapsible === 'none') {
      return (
        <div
          className={cn(
            'flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      );
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <div
        ref={ref}
        className="group peer hidden text-sidebar-foreground md:block"
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-variant={variant}
        data-side={side}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            'relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear',
            'group-data-[collapsible=offcanvas]:w-0',
            'group-data-[side=right]:rotate-180',
            variant === 'floating' || variant === 'inset'
              ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
              : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]'
          )}
        />
        <div
          className={cn(
            'fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex',
            side === 'left'
              ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
              : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
            // Adjust the padding for floating and inset variants.
            variant === 'floating' || variant === 'inset'
              ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
              : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l',
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Sidebar.displayName = 'Sidebar';

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 hover:after:bg-sidebar-border sm:flex',
        '[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize',
        '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar',
        '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        className
      )}
      {...props}
    />
  );
});
SidebarRail.displayName = 'SidebarRail';

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'main'>
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        'relative flex min-h-svh flex-1 flex-col bg-background',
        'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow',
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = 'SidebarInset';

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        'h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        className
      )}
      {...props}
    />
  );
});
SidebarInput.displayName = 'SidebarInput';

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
});
SidebarHeader.displayName = 'SidebarHeader';

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = 'SidebarFooter';

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn('mx-2 w-auto bg-sidebar-border', className)}
      {...props}
    />
  );
});
SidebarSeparator.displayName = 'SidebarSeparator';

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = 'SidebarContent';

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  );
});
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        'absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 after:md:hidden',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
});
SidebarGroupAction.displayName = 'SidebarGroupAction';

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn('w-full text-sm', className)}
    {...props}
  />
));
SidebarGroupContent.displayName = 'SidebarGroupContent';

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn('flex w-full min-w-0 flex-col gap-1', className)}
    {...props}
  />
));
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn('group/menu-item relative', className)}
    {...props}
  />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline:
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = 'default',
      size = 'default',
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const { isMobile, state } = useSidebar();

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    );

    if (!tooltip) {
      return button;
    }

    if (typeof tooltip === 'string') {
      tooltip = {
        children: tooltip,
      };
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== 'collapsed' || isMobile}
          {...tooltip}
        />
      </Tooltip>
    );
  }
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    asChild?: boolean;
    showOnHover?: boolean;
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        'absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 after:md:hidden',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0',
        className
      )}
      {...props}
    />
  );
});
SidebarMenuAction.displayName = 'SidebarMenuAction';

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      'pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground',
      'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
      'peer-data-[size=sm]/menu-button:top-1',
      'peer-data-[size=default]/menu-button:top-1.5',
      'peer-data-[size=lg]/menu-button:top-2.5',
      'group-data-[collapsible=icon]:hidden',
      className
    )}
    {...props}
  />
));
SidebarMenuBadge.displayName = 'SidebarMenuBadge';

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    showIcon?: boolean;
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-[--skeleton-width] flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  );
});
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton';

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5',
      'group-data-[collapsible=icon]:hidden',
      className
    )}
    {...props}
  />
));
SidebarMenuSub.displayName = 'SidebarMenuSub';

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ ...props }, ref) => <li ref={ref} {...props} />);
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<'a'> & {
    asChild?: boolean;
    size?: 'sm' | 'md';
    isActive?: boolean;
  }
>(({ asChild = false, size = 'md', isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
        'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    label: 'Reservations',
    href: '/admin/reservations',
    icon: Calendar,
  },
  {
    label: 'Menu',
    href: '/admin/menu',
    icon: MenuIcon,
  },
  {
    label: 'Gallery',
    href: '/admin/gallery',
    icon: ImageIcon,
  },
];

interface AdminSidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

function AdminSidebarContent({
  collapsed,
  onNavigate,
}: AdminSidebarContentProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const activeHref = React.useMemo(() => {
    return ADMIN_NAV_ITEMS.find((item) => pathname?.startsWith(item.href))
      ?.href;
  }, [pathname]);

  const userName = React.useMemo(() => {
    return session?.user?.name?.trim() || 'Admin User';
  }, [session?.user?.name]);

  const userEmail = React.useMemo(() => {
    return session?.user?.email || 'Administrator';
  }, [session?.user?.email]);

  const userInitials = React.useMemo(() => {
    if (!session?.user?.name) return null;
    const parts = session.user.name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join('');
    return parts.slice(0, 2) || null;
  }, [session?.user?.name]);

  const userImage = session?.user?.image ?? undefined;
  const isSessionLoading = status === 'loading';

  const handleLogout = React.useCallback(async () => {
    onNavigate?.();
    try {
      await signOut({ callbackUrl: '/admin/login' });
    } catch (error) {
      console.error('Failed to sign out', error);
      toast.error('We could not sign you out. Please try again.');
    }
  }, [onNavigate]);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center border-b border-border px-3 py-4">
        <Link
          href="/admin/dashboard"
          aria-label={collapsed ? 'Admin Panel' : undefined}
          className={cn(
            'flex items-center text-lg font-semibold transition-all duration-300',
            collapsed ? 'w-full justify-center' : 'gap-2'
          )}
        >
          <House className="h-5 w-5 text-primary" aria-hidden="true" />
          <span
            aria-hidden={collapsed}
            className={cn(
              'ml-2 whitespace-nowrap transition-all duration-200',
              collapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'
            )}
          >
            Admin Panel
          </span>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-3 px-4 py-6">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = activeHref === item.href;

            const navLink = (
              <Link
                href={item.href}
                onClick={() => onNavigate?.()}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300',
                  collapsed ? 'justify-center gap-0' : 'gap-3',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                )}
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                <span
                  aria-hidden={collapsed}
                  className={cn(
                    'whitespace-nowrap transition-all duration-200',
                    collapsed
                      ? 'w-0 overflow-hidden opacity-0'
                      : 'w-auto opacity-100'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );

            if (!collapsed) {
              return React.cloneElement(navLink, { key: item.href });
            }

            return (
              <Tooltip
                key={item.href}
                delayDuration={100}
                disableHoverableContent
              >
                <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                <TooltipContent side="right" align="center">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-border px-3 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/10',
                collapsed && 'justify-center'
              )}
              aria-label={collapsed ? 'Open user menu' : undefined}
            >
              <Avatar className="h-9 w-9">
                {userImage ? (
                  <AvatarImage
                    src={userImage}
                    alt={userName}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                ) : null}
                <AvatarFallback>
                  {userInitials ? (
                    <span className="text-xs font-medium">{userInitials}</span>
                  ) : (
                    <User className="h-4 w-4" aria-hidden="true" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                aria-hidden={collapsed}
                className={cn(
                  'flex flex-1 flex-col transition-all duration-200',
                  collapsed
                    ? 'ml-0 w-0 overflow-hidden opacity-0'
                    : 'ml-1 w-auto opacity-100'
                )}
              >
                <span className="text-sm font-semibold">
                  {isSessionLoading ? 'Loading…' : userName}
                </span>
                <span className="text-xs text-secondary">
                  {isSessionLoading ? 'Please wait' : userEmail}
                </span>
              </div>
              {collapsed ? <span className="sr-only">{userName}</span> : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onSelect={async (event) => {
                event.preventDefault();
                await handleLogout();
              }}
              className="gap-2 text-sm"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

const AdminSidebar = React.forwardRef<HTMLDivElement, AdminSidebarProps>(
  ({ className, onNavigate }, ref) => {
    const { collapsed, setCollapsed } = useAdminSidebar();
    const open = !collapsed;

    const handleOpenChange = React.useCallback(
      (nextOpen: boolean) => {
        setCollapsed(!nextOpen);
      },
      [setCollapsed]
    );

    return (
      <Collapsible.Root open={open} onOpenChange={handleOpenChange} asChild>
        <aside
          id="admin-sidebar"
          ref={ref}
          data-state={open ? 'open' : 'closed'}
          data-collapsed={collapsed ? 'true' : 'false'}
          aria-expanded={open}
          className={cn(
            'group/sidebar relative flex h-full flex-col overflow-hidden border-r border-border bg-background transition-[width] duration-300 ease-in-out',
            'data-[state=open]:w-60 data-[state=closed]:w-16',
            className
          )}
        >
          <AdminSidebarContent collapsed={collapsed} onNavigate={onNavigate} />
        </aside>
      </Collapsible.Root>
    );
  }
);
AdminSidebar.displayName = 'AdminSidebar';

const AdminSidebarMobile = ({ className }: { className?: string }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              'border-primary/40 text-primary shadow-sm hover:bg-primary/10 md:hidden',
              className
            )}
          >
            <PanelLeft className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Open admin navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-60 border-r border-border bg-background p-0"
        >
          <AdminSidebarContent
            collapsed={false}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-50 rounded-full border-primary/40 text-primary shadow-md backdrop-blur md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open admin navigation"
      >
        <PanelLeft className="h-5 w-5" aria-hidden="true" />
      </Button>
    </>
  );
};
AdminSidebarMobile.displayName = 'AdminSidebarMobile';

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  AdminSidebar,
  AdminSidebarMobile,
  ADMIN_NAV_ITEMS,
  useSidebar,
};

export type { AdminNavItem };
