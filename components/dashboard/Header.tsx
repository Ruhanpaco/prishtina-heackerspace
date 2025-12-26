"use client";

import { usePathname } from "next/navigation";
import {
    Bell,
    Search,
    Settings,
    User,
    Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Assuming we might add Sheet for mobile later, but for now just a placeholder or visual
import { Sidebar } from "./Sidebar"; // verify if Sidebar export allows this, or if we duplicate for mobile

export function Header({ user }: { user: any }) {
    const pathname = usePathname();

    // Generate title from pathname
    const getPageTitle = (path: string) => {
        if (path === "/dashboard") return "Overview";
        const segments = path.split("/").filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        if (!lastSegment) return "Dashboard";
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 border-b bg-card w-full">
            {/* Left: Mobile Menu Trigger & Title */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold tracking-tight">
                        {getPageTitle(pathname)}
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                        / {pathname.split("/").filter(Boolean).join(" / ")}
                    </p>
                </div>
            </div>

            {/* Right: Search & Actions */}
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search projects, members..."
                        className="pl-8 bg-muted/50 border-none focus-visible:bg-background"
                    />
                </div>

                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9 border">
                                <AvatarImage src={user?.image} alt={user?.name || "User"} />
                                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/profile">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
