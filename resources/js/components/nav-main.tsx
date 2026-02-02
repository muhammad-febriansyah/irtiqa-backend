import { Link } from '@inertiajs/react';

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useActiveUrl } from '@/hooks/use-active-url';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';

export function NavMain({ items = [], label = 'Platform' }: { items: NavItem[], label?: string }) {
    const { urlIsActive } = useActiveUrl();

    return (
        <SidebarGroup className="px-0 py-0">
            <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map((item) => {
                    const isActive = urlIsActive(item.href);
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                className={cn(
                                    'group relative overflow-hidden transition-all duration-200',
                                    'hover:bg-primary/10 hover:text-primary',
                                    isActive && 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-medium shadow-sm border-l-2 border-primary'
                                )}
                            >
                                <Link href={item.href} prefetch className="flex items-center gap-3">
                                    {item.icon && (
                                        <div className={cn(
                                            'rounded-lg p-1.5 transition-all duration-200',
                                            'group-hover:bg-primary/15 group-hover:scale-110',
                                            isActive && 'bg-primary/20 shadow-sm'
                                        )}>
                                            <item.icon className={cn(
                                                'size-4 transition-colors',
                                                isActive && 'text-primary'
                                            )} />
                                        </div>
                                    )}
                                    <span className="transition-all">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
