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
    ShieldAlert,
    CreditCard,
    BarChart,
    ClipboardList,
    ShieldCheck,
    Code,
    Stars,
    Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

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
        memberOnly: true
    },
    {
        title: "Community",
        href: "/dashboard/community",
        icon: Users,
        memberOnly: true
    },
    {
        title: "Presence",
        href: "/dashboard/presence",
        icon: MapPin,
        memberOnly: true
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

const adminSidebarItems = [
    {
        title: "User Management",
        href: "/dashboard/admin/users",
        icon: Users,
    },
    {
        title: "Identity Review",
        href: "/dashboard/admin/identity",
        icon: ShieldCheck,
    },
    {
        title: "Payments",
        href: "/dashboard/admin/payments",
        icon: CreditCard,
    },
    {
        title: "Audit Logs",
        href: "/dashboard/admin/logs",
        icon: ClipboardList,
    },
    {
        title: "Security Intel",
        href: "/dashboard/admin/logs/analytics",
        icon: ShieldAlert,
    },
    {
        title: "API Docs",
        href: "/dashboard/admin/docs",
        icon: Code,
    },
    {
        title: "System Stats",
        href: "/dashboard/admin/stats",
        icon: BarChart,
    },
    {
        title: "Inventory",
        href: "/dashboard/admin/inventory",
        icon: Package,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userRole = session?.user?.role;
    const isMember = (session?.user as any)?.membershipStatus === 'ACTIVE';

    const visibleItems = sidebarItems.filter(item => !item.memberOnly || isMember);

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
                {visibleItems.map((item) => (
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

                {!isMember && (
                    <div className="mt-6 px-3">
                        <Button
                            variant="default"
                            className="w-full bg-gradient-to-r from-brand-yellow to-yellow-600 text-brand-dark font-bold border-none hover:shadow-lg transition-all"
                            asChild
                        >
                            <Link href="/dashboard/membership/pricing">
                                <Stars className="h-4 w-4 mr-2" />
                                Become a Member
                            </Link>
                        </Button>
                    </div>
                )}

                {(userRole === 'ADMIN' || userRole === 'STAFF') && (
                    <>
                        <div className="pt-8 pb-2 px-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                Administration
                            </p>
                        </div>
                        {adminSidebarItems.map((item) => (
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
                    </>
                )}
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
        </div >
    );
}
