import { usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-background/95 backdrop-blur-sm px-6 transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 shadow-sm">
            <div className="flex flex-1 items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="-ml-1 hover:bg-primary/10 hover:text-primary transition-colors rounded-lg" />
                    <div className="h-6 w-px bg-border/60" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-medium text-primary">
                            Online
                        </span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors">
                            <Avatar className="h-9 w-9 border-2 border-primary/20">
                                <AvatarImage
                                    src={user.avatar}
                                    alt={user.name}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-medium">
                                    {user.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Administrator
                                </span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="flex flex-col">
                                <span className="font-semibold">{user.name}</span>
                                <span className="text-xs text-muted-foreground font-normal">
                                    {user.email}
                                </span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <a href="/profile" className="w-full">
                                    Profil
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <a href="/settings" className="w-full">
                                    Pengaturan
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                                <a href="/logout" className="w-full">
                                    Keluar
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
