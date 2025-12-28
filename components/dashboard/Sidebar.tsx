"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    User,
    Folder,
    Users,
    MapPin,
    Settings,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const sidebarItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Profile",
        href: "/dashboard/profile",
        icon: User,
    },
    {
        title: "Projects",
        href: "/dashboard/projects",
        icon: Folder,
    },
    {
        title: "Community",
        href: "/dashboard/community",
        icon: Users,
    },
    {
        title: "Presence",
        href: "/dashboard/presence",
        icon: MapPin,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full border-r bg-card text-card-foreground w-64 shadow-md z-10">
            <div className="p-6 flex items-center justify-center border-b h-16">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image
                        src="/assets/images/logos/FLOSSK Hub Logo.png"
                        alt="FLOSSK Logo"
                        width={200}
                        height={200}
                        className="drop-shadow-sm"
                    />
                </Link>
            </div>
            <div className="flex-1 py-6 px-3 space-y-1">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                            pathname === item.href
                                ? "bg-brand-yellow text-brand-dark shadow-sm translate-x-1"
                                : "hover:bg-accent hover:text-accent-foreground hover:translate-x-1"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                ))}
            </div>
            <div className="p-4 border-t bg-muted/20">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
